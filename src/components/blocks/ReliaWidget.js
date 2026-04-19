import $ from 'jquery';

const DEFAULT_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 5000;
const MAX_POINTS_PER_SERIES = 1024;

class ReliaWidget {
    constructor($divElement, deviceIdentifier, blockIdentifier, taskIdentifier, options = {}) {
        this.$div = $divElement;
        this.deviceIdentifier = deviceIdentifier;
        this.blockIdentifier = blockIdentifier;
        this.taskIdentifier = taskIdentifier;
        this.url = window.API_BASE_URL + "data/tasks/" + taskIdentifier + "/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;
        this.options = options;
        this.running = false;
        this.widgetState = 'initializing';
        this.latestSnapshot = null;
        this.latestError = null;
        this.consecutiveFailures = 0;
        this.debugFlags = {
            loggedNullSnapshot: false,
            loggedRenderedWithoutSnapshot: false,
            loggedWaitingWithoutSnapshotWhileVisible: false
        };
    }

    start() {
        this.running = true;
        this.debugFlags = {
            loggedNullSnapshot: false,
            loggedRenderedWithoutSnapshot: false,
            loggedWaitingWithoutSnapshotWhileVisible: false
        };
        this.setWidgetState('initializing');
        this.redraw();
        this.performRequest();
    }

    hasVisiblePlotDom() {
        return !!(
            this.$div
            && typeof this.$div.find === 'function'
            && this.$div.find('svg, canvas').length
        );
    }

    performRequest() {
        var self = this;

        if (!this.running)
            return;

        var scheduleNextRequest = function (delayMs) {
            if (!self.running) {
                return;
            }

            setTimeout(function () {
                if (!self.running) {
                    return;
                }
                self.redraw();
                self.performRequest();
            }, delayMs);
        };

        var scheduleRetry = function () {
            const delayMs = Math.min(MAX_RETRY_DELAY_MS, DEFAULT_RETRY_DELAY_MS * Math.max(self.consecutiveFailures, 1));
            scheduleNextRequest(delayMs);
        };

        $.get(this.url).done(function (response) {
            if (!self.running) {
                // Do not even print the new data
                return;
            }

            if (!response.success) {
                console.log("Error on request" + self.url + ": " + response.message, response);
                self.latestError = response.message || 'Request failed';
                self.consecutiveFailures += 1;
                self.setWidgetState(self.consecutiveFailures >= 3 ? 'failed' : 'retrying');
                scheduleRetry();
                return;
            }

            if (response.data == null) {
                self.latestError = null;
                self.consecutiveFailures = 0;
                self.handleNoDataResponse();
                scheduleNextRequest(DEFAULT_RETRY_DELAY_MS);
                return;
            }

            self.latestError = null;
            self.consecutiveFailures = 0;

            try {
                self.handleResponseData(response.data);
                self.setWidgetState('rendered');
            } catch (error) {
                console.error("Error handling data for widget", self.blockIdentifier, error);
                self.latestError = error && error.message ? error.message : String(error);
                self.consecutiveFailures += 1;
                self.setWidgetState(self.consecutiveFailures >= 3 ? 'failed' : 'retrying');
            }

            scheduleNextRequest(0);
        }).fail(function () {
            // failing is not stopping (unless they tell us to stop)
            if (!self.running) {
                return;
            }
            self.latestError = 'Network request failed';
            self.consecutiveFailures += 1;
            self.setWidgetState(self.consecutiveFailures >= 3 ? 'failed' : 'retrying');
            scheduleRetry();
        });
    }

    setWidgetState(state) {
        this.widgetState = state;
        if (state === 'rendered' && !this.latestSnapshot && !this.debugFlags.loggedRenderedWithoutSnapshot) {
            console.debug('ReliaWidget rendered without snapshot', {
                taskIdentifier: this.taskIdentifier,
                deviceIdentifier: this.deviceIdentifier,
                blockIdentifier: this.blockIdentifier,
                hasVisiblePlotDom: this.hasVisiblePlotDom()
            });
            this.debugFlags.loggedRenderedWithoutSnapshot = true;
        }
        if (this.options && typeof this.options.onStateChange === 'function') {
            this.options.onStateChange(this, this.getWidgetStatus());
        }
    }

    getWidgetStatus() {
        return {
            state: this.widgetState,
            error: this.latestError,
            hasSnapshot: !!this.latestSnapshot
        };
    }

    handleNoDataResponse() {
        if (!this.latestSnapshot && this.hasVisiblePlotDom() && !this.debugFlags.loggedWaitingWithoutSnapshotWhileVisible) {
            console.debug('ReliaWidget waiting_for_data while plot DOM exists', {
                taskIdentifier: this.taskIdentifier,
                deviceIdentifier: this.deviceIdentifier,
                blockIdentifier: this.blockIdentifier
            });
            this.debugFlags.loggedWaitingWithoutSnapshotWhileVisible = true;
        }
        this.setWidgetState(this.latestSnapshot ? 'rendered' : 'waiting_for_data');
    }

    setSnapshot(snapshot) {
        this.latestSnapshot = snapshot;
        if (!snapshot && !this.debugFlags.loggedNullSnapshot) {
            console.debug('ReliaWidget produced an empty snapshot', {
                taskIdentifier: this.taskIdentifier,
                deviceIdentifier: this.deviceIdentifier,
                blockIdentifier: this.blockIdentifier,
                widgetState: this.widgetState,
                hasVisiblePlotDom: this.hasVisiblePlotDom()
            });
            this.debugFlags.loggedNullSnapshot = true;
        }
        if (this.options && typeof this.options.onStateChange === 'function') {
            this.options.onStateChange(this, this.getWidgetStatus());
        }
    }

    getAiContext() {
        return this.latestSnapshot;
    }

    buildSeriesSnapshot(blockType, xLabel, seriesDefinitions, yLabel, yUnit) {
        const sanitizedSeries = (seriesDefinitions || []).map((series) => ({
            label: series.label,
            points: this.downsamplePoints(series.points || [])
        })).filter((series) => series.points.length > 0);

        if (!sanitizedSeries.length) {
            return null;
        }

        return {
            blockType,
            blockName: this.translatedIdentifier(),
            xLabel: xLabel || null,
            yLabel: yLabel || null,
            yUnit: yUnit || null,
            series: sanitizedSeries
        };
    }

    downsamplePoints(points) {
        const validPoints = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

        if (validPoints.length <= MAX_POINTS_PER_SERIES) {
            return validPoints.map((point) => ({
                x: point.x,
                y: point.y
            }));
        }

        const step = Math.ceil(validPoints.length / MAX_POINTS_PER_SERIES);
        const sampled = [];
        for (let index = 0; index < validPoints.length; index += step) {
            sampled.push({
                x: validPoints[index].x,
                y: validPoints[index].y
            });
        }

        const lastPoint = validPoints[validPoints.length - 1];
        if (sampled[sampled.length - 1].x !== lastPoint.x || sampled[sampled.length - 1].y !== lastPoint.y) {
            sampled.push({
                x: lastPoint.x,
                y: lastPoint.y
            });
        }

        return sampled;
    }

    /*
    * redraw the widget. Optional method.
    */
    redraw () {}

    /*
    * handle the response data from the call to self.url. Mandatory method.
    */
    handleResponseData (response) {
        console.log("ReliaWidget::handleResponseData() called. About to raise an error");
        throw new Error("handleNewData not implemented");
    }

    stop() {
        this.running = false;
    }

    /*
    * Mandatory method. Translated name
    */
    translatedName() {
        // by default we provide the block identifier
        return this.englishName();
    }
    
    /*
    * No need to do anything with this function
    */
    englishName() {
        return this.blockIdentifier.split("(")[0];
    }

    /*
    * No need to do anything with this function
    */
    translatedIdentifier() {
        return this.blockIdentifier.replace(this.englishName(), this.translatedName());
    }
}

export default ReliaWidget;
