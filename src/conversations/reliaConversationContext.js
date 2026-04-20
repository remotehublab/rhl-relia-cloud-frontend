const MAX_SUMMARY_PLOTS_PER_SIDE = 4;
const MAX_SUMMARY_SERIES_PER_PLOT = 3;
const MAX_SAMPLE_POINTS_PER_SERIES = 8;

function clonePoints(points) {
    return (points || []).map((point) => ({
        x: point.x,
        y: point.y
    }));
}

function clonePlot(plot) {
    return {
        blockType: plot.blockType,
        blockName: plot.blockName,
        xLabel: plot.xLabel || null,
        yLabel: plot.yLabel || null,
        yUnit: plot.yUnit || null,
        series: (plot.series || []).map((series) => ({
            label: series.label,
            points: clonePoints(series.points)
        }))
    };
}

function trimTrailingZeros(value) {
    return value.replace(/\.?0+$/, '');
}

function formatNumber(value) {
    if (!Number.isFinite(value)) {
        return 'n/a';
    }

    const normalizedValue = Object.is(value, -0) ? 0 : value;
    const absoluteValue = Math.abs(normalizedValue);

    if (absoluteValue === 0) {
        return '0';
    }

    if (absoluteValue >= 1000 || absoluteValue < 0.01) {
        const exponential = normalizedValue.toExponential(2).split('e');
        return `${trimTrailingZeros(exponential[0])}e${exponential[1]}`;
    }

    if (absoluteValue >= 100) {
        return trimTrailingZeros(normalizedValue.toFixed(1));
    }

    if (absoluteValue >= 10) {
        return trimTrailingZeros(normalizedValue.toFixed(2));
    }

    return trimTrailingZeros(normalizedValue.toFixed(3));
}

function samplePoints(points, maxPoints) {
    if (points.length <= maxPoints) {
        return points;
    }

    const sampledPoints = [];
    const usedIndices = new Set();
    const step = (points.length - 1) / (maxPoints - 1);

    for (let sampleIndex = 0; sampleIndex < maxPoints; sampleIndex += 1) {
        const pointIndex = Math.round(sampleIndex * step);
        if (!usedIndices.has(pointIndex)) {
            sampledPoints.push(points[pointIndex]);
            usedIndices.add(pointIndex);
        }
    }

    const lastIndex = points.length - 1;
    if (!usedIndices.has(lastIndex)) {
        sampledPoints.push(points[lastIndex]);
    }

    return sampledPoints;
}

function formatSeriesLabel(label) {
    const normalizedLabel = String(label || '')
        .trim()
        .replace(/^'+|'+$/g, '');

    return normalizedLabel || 'unnamed series';
}

function getFinitePoints(points) {
    return (points || []).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

function summarizeSeries(series) {
    const points = getFinitePoints(series.points);

    if (!points.length) {
        return null;
    }

    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;
    let totalY = 0;
    let peakPoint = points[0];

    points.forEach((point) => {
        minX = Math.min(minX, point.x);
        maxX = Math.max(maxX, point.x);
        minY = Math.min(minY, point.y);
        maxY = Math.max(maxY, point.y);
        totalY += point.y;

        if (point.y > peakPoint.y) {
            peakPoint = point;
        }
    });

    const sampledPoints = samplePoints(points, MAX_SAMPLE_POINTS_PER_SERIES)
        .map((point) => `(${formatNumber(point.x)}, ${formatNumber(point.y)})`)
        .join(', ');

    return `${formatSeriesLabel(series.label)}: ${points.length} points, `
        + `x ${formatNumber(minX)} to ${formatNumber(maxX)}, `
        + `y ${formatNumber(minY)} to ${formatNumber(maxY)}, `
        + `avg y ${formatNumber(totalY / points.length)}, `
        + `peak y ${formatNumber(peakPoint.y)} at x ${formatNumber(peakPoint.x)}, `
        + `samples [${sampledPoints}]`;
}

function summarizePlot(sideLabel, plot, plotIndex) {
    const lines = [];
    const axes = [];

    if (plot.xLabel) {
        axes.push(`x=${plot.xLabel}`);
    }

    if (plot.yLabel && plot.yUnit) {
        axes.push(`y=${plot.yLabel} (${plot.yUnit})`);
    } else if (plot.yLabel) {
        axes.push(`y=${plot.yLabel}`);
    } else if (plot.yUnit) {
        axes.push(`y unit=${plot.yUnit}`);
    }

    const header = `${sideLabel} plot ${plotIndex + 1}: ${plot.blockName || 'Unnamed plot'}`
        + `${plot.blockType ? ` [${plot.blockType}]` : ''}`
        + `${axes.length ? `; axes ${axes.join(', ')}` : ''}`;

    lines.push(header);

    const series = plot.series || [];
    const summarizedSeries = series
        .slice(0, MAX_SUMMARY_SERIES_PER_PLOT)
        .map(summarizeSeries)
        .filter(Boolean);

    if (!summarizedSeries.length) {
        lines.push('  No finite sample points available.');
    } else {
        summarizedSeries.forEach((summary, summaryIndex) => {
            lines.push(`  Series ${summaryIndex + 1}: ${summary}`);
        });
    }

    if (series.length > MAX_SUMMARY_SERIES_PER_PLOT) {
        lines.push(`  Additional series omitted: ${series.length - MAX_SUMMARY_SERIES_PER_PLOT}.`);
    }

    return lines.join('\n');
}

function appendPlotSection(lines, sideLabel, plots) {
    lines.push('');
    lines.push(`${sideLabel} plots: ${plots.length}`);

    if (!plots.length) {
        lines.push(`No ${sideLabel.toLowerCase()} plot snapshots are currently available.`);
        return;
    }

    plots.slice(0, MAX_SUMMARY_PLOTS_PER_SIDE).forEach((plot, plotIndex) => {
        lines.push(summarizePlot(sideLabel, plot, plotIndex));
    });

    if (plots.length > MAX_SUMMARY_PLOTS_PER_SIDE) {
        lines.push(`Additional ${sideLabel.toLowerCase()} plots omitted: ${plots.length - MAX_SUMMARY_PLOTS_PER_SIDE}.`);
    }
}

function buildPlotSummaryContext({
    selectedTab,
    session,
    widgetContext,
    receiverPlots,
    transmitterPlots
}) {
    const lines = [
        'RELIA laboratory state:',
        `Selected tab: ${selectedTab || 'unknown'}`,
        `Task status: ${session.status || 'not_started'}`,
        `Assigned instance: ${session.assignedInstanceName || 'none'}`,
        `Device type: ${process.env.REACT_APP_DEVICE_NAME || 'unknown'}`,
        `Receiver status: ${(widgetContext.deviceStatuses || {}).receiver || 'unknown'}`,
        `Transmitter status: ${(widgetContext.deviceStatuses || {}).transmitter || 'unknown'}`
    ];

    appendPlotSection(lines, 'Receiver', receiverPlots);
    appendPlotSection(lines, 'Transmitter', transmitterPlots);

    return lines.join('\n');
}

export function buildReliaConversationContext({
    selectedTab,
    currentSession,
    reliaWidgets
}) {
    const session = currentSession || {};
    const widgetContext = reliaWidgets && reliaWidgets.getAssistantContext
        ? reliaWidgets.getAssistantContext()
        : {
            receiverPlots: [],
            transmitterPlots: [],
            deviceStatuses: {}
        };
    const receiverPlots = (widgetContext.receiverPlots || []).map(clonePlot);
    const transmitterPlots = (widgetContext.transmitterPlots || []).map(clonePlot);

    return {
        context: buildPlotSummaryContext({
            selectedTab,
            session,
            widgetContext,
            receiverPlots,
            transmitterPlots
        }),
        labState: {
            selectedTab,
            taskStatus: session.status || 'not_started',
            assignedInstanceName: session.assignedInstanceName || null,
            deviceType: process.env.REACT_APP_DEVICE_NAME || null,
            deviceStatuses: widgetContext.deviceStatuses || {}
        },
        receiverPlots,
        transmitterPlots
    };
}
