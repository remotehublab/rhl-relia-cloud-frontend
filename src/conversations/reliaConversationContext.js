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

    return {
        labState: {
            selectedTab,
            taskStatus: session.status || 'not_started',
            assignedInstanceName: session.assignedInstanceName || null,
            deviceType: process.env.REACT_APP_DEVICE_NAME || null,
            deviceStatuses: widgetContext.deviceStatuses || {}
        },
        receiverPlots: (widgetContext.receiverPlots || []).map(clonePlot),
        transmitterPlots: (widgetContext.transmitterPlots || []).map(clonePlot)
    };
}
