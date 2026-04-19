jest.mock('jquery', () => ({
    __esModule: true,
    default: {
        get: jest.fn()
    }
}));

import $ from 'jquery';

import ReliaWidget from './ReliaWidget';

function createDeferredRequest() {
    const deferred = {
        doneHandler: null,
        failHandler: null,
        api: null
    };

    deferred.api = {
        done(handler) {
            deferred.doneHandler = handler;
            return deferred.api;
        },
        fail(handler) {
            deferred.failHandler = handler;
            return deferred.api;
        }
    };

    deferred.resolve = function (value) {
        deferred.doneHandler(value);
    };

    deferred.reject = function () {
        deferred.failHandler();
    };

    return deferred;
}

class TestWidget extends ReliaWidget {
    redraw() {}

    handleResponseData() {
        this.setSnapshot(this.buildSeriesSnapshot(
            'test-widget',
            'x',
            [
                {
                    label: 'Series',
                    points: [{ x: 1, y: 2 }]
                }
            ],
            'y',
            null
        ));
    }
}

class ThrowingWidget extends ReliaWidget {
    redraw() {}

    handleResponseData() {
        throw new Error('broken widget');
    }
}

class StoppingWidget extends ReliaWidget {
    redraw() {}

    handleResponseData() {
        this.stop();
    }
}

class OptionsOverwritingWidget extends ReliaWidget {
    redraw() {
        this.options = {
            chart: true
        };
    }

    handleResponseData() {
        this.setSnapshot(this.buildSeriesSnapshot(
            'options-overwriting-widget',
            'x',
            [
                {
                    label: 'Series',
                    points: [{ x: 1, y: 2 }]
                }
            ],
            'y',
            null
        ));
    }
}

describe('ReliaWidget polling', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        window.API_BASE_URL = 'https://relia.rhlab.ece.uw.edu/pluto/api/';
        $.get.mockReset();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('continues polling when the backend reports no data yet', () => {
        const firstRequest = createDeferredRequest();
        const secondRequest = createDeferredRequest();
        $.get
            .mockReturnValueOnce(firstRequest.api)
            .mockReturnValueOnce(secondRequest.api);

        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        widget.start();
        firstRequest.resolve({
            success: true,
            data: null
        });

        expect(widget.getWidgetStatus().state).toBe('waiting_for_data');

        jest.advanceTimersByTime(1000);

        expect($.get).toHaveBeenCalledTimes(2);
        widget.stop();
    });

    test('does not schedule another request after stop while waiting for the next poll', () => {
        const firstRequest = createDeferredRequest();
        $.get.mockReturnValueOnce(firstRequest.api);

        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        widget.start();
        firstRequest.resolve({
            success: true,
            data: null
        });

        widget.stop();
        jest.advanceTimersByTime(1000);

        expect($.get).toHaveBeenCalledTimes(1);
    });

    test('marks rendered and stores sanitized AI context on success', () => {
        const firstRequest = createDeferredRequest();
        const secondRequest = createDeferredRequest();
        $.get
            .mockReturnValueOnce(firstRequest.api)
            .mockReturnValueOnce(secondRequest.api);

        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block(extra)', 'task-1');
        widget.start();
        firstRequest.resolve({
            success: true,
            data: {
                ok: true
            }
        });

        expect(widget.getWidgetStatus().state).toBe('rendered');
        expect(widget.getAiContext()).toEqual({
            blockType: 'test-widget',
            blockName: 'Test Block(extra)',
            xLabel: 'x',
            yLabel: 'y',
            yUnit: null,
            series: [
                {
                    label: 'Series',
                    points: [{ x: 1, y: 2 }]
                }
            ]
        });
        expect(widget.translatedIdentifier()).toBe('Test Block(extra)');

        jest.advanceTimersByTime(0);
        expect($.get).toHaveBeenCalledTimes(2);
        widget.stop();
    });

    test('retries after transient failures and escalates to failed state', () => {
        const firstRequest = createDeferredRequest();
        const secondRequest = createDeferredRequest();
        const thirdRequest = createDeferredRequest();
        const fourthRequest = createDeferredRequest();
        $.get
            .mockReturnValueOnce(firstRequest.api)
            .mockReturnValueOnce(secondRequest.api)
            .mockReturnValueOnce(thirdRequest.api)
            .mockReturnValueOnce(fourthRequest.api);

        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        widget.start();

        firstRequest.reject();
        expect(widget.getWidgetStatus().state).toBe('retrying');
        jest.advanceTimersByTime(1000);

        secondRequest.reject();
        expect(widget.getWidgetStatus().state).toBe('retrying');
        jest.advanceTimersByTime(2000);

        thirdRequest.reject();
        expect(widget.getWidgetStatus().state).toBe('failed');
        widget.stop();
    });

    test('retries after unsuccessful responses from the backend', () => {
        const firstRequest = createDeferredRequest();
        const secondRequest = createDeferredRequest();
        const thirdRequest = createDeferredRequest();
        $.get
            .mockReturnValueOnce(firstRequest.api)
            .mockReturnValueOnce(secondRequest.api)
            .mockReturnValueOnce(thirdRequest.api);

        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        widget.start();

        firstRequest.resolve({
            success: false,
            message: 'bad 1'
        });
        expect(widget.getWidgetStatus().state).toBe('retrying');
        jest.advanceTimersByTime(1000);

        secondRequest.resolve({
            success: false,
            message: 'bad 2'
        });
        expect(widget.getWidgetStatus().state).toBe('retrying');
        jest.advanceTimersByTime(2000);

        thirdRequest.resolve({
            success: false,
            message: 'bad 3'
        });
        expect(widget.getWidgetStatus()).toEqual({
            state: 'failed',
            error: 'bad 3',
            hasSnapshot: false
        });
        widget.stop();
    });

    test('downsamples long series and preserves the last point', () => {
        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        const points = [];
        for (let index = 0; index < 1500; index += 1) {
            points.push({ x: index, y: index * 2 });
        }
        points.push({ x: Number.NaN, y: 0 });

        const sampled = widget.downsamplePoints(points);
        expect(sampled.length).toBeLessThanOrEqual(1024);
        expect(sampled[0]).toEqual({ x: 0, y: 0 });
        expect(sampled[sampled.length - 1]).toEqual({ x: 1499, y: 2998 });
    });

    test('buildSeriesSnapshot drops empty series and handleNoDataResponse keeps rendered snapshots visible', () => {
        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        expect(widget.buildSeriesSnapshot('type', 'x', [], 'y', null)).toBeNull();

        widget.setSnapshot({
            blockType: 'existing',
            series: []
        });
        widget.handleNoDataResponse();
        expect(widget.getWidgetStatus().state).toBe('rendered');
    });

    test('marks retrying when response handling itself throws', () => {
        const firstRequest = createDeferredRequest();
        const secondRequest = createDeferredRequest();
        $.get
            .mockReturnValueOnce(firstRequest.api)
            .mockReturnValueOnce(secondRequest.api);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const widget = new ThrowingWidget(null, 'uw-s1i1:r', 'Broken Block', 'task-1');
        widget.start();
        firstRequest.resolve({
            success: true,
            data: {
                anything: true
            }
        });

        expect(widget.getWidgetStatus().state).toBe('retrying');
        expect(widget.getWidgetStatus().error).toBe('broken widget');
        consoleErrorSpy.mockRestore();
        widget.stop();
    });

    test('ignores successful responses after the widget has been stopped', () => {
        const firstRequest = createDeferredRequest();
        $.get.mockReturnValueOnce(firstRequest.api);

        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        widget.start();
        widget.stop();
        firstRequest.resolve({
            success: true,
            data: {
                ok: true
            }
        });

        expect(widget.getWidgetStatus()).toEqual({
            state: 'initializing',
            error: null,
            hasSnapshot: false
        });
    });

    test('does not schedule a follow-up request when response handling stops the widget', () => {
        const firstRequest = createDeferredRequest();
        $.get.mockReturnValueOnce(firstRequest.api);

        const widget = new StoppingWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        widget.start();
        firstRequest.resolve({
            success: true,
            data: {
                ok: true
            }
        });

        jest.advanceTimersByTime(0);
        expect($.get).toHaveBeenCalledTimes(1);
        expect(widget.running).toBe(false);
    });

    test('ignores failed requests after the widget has been stopped', () => {
        const firstRequest = createDeferredRequest();
        $.get.mockReturnValueOnce(firstRequest.api);

        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        widget.start();
        widget.stop();
        firstRequest.reject();

        expect(widget.getWidgetStatus().state).toBe('initializing');
    });

    test('notifies state changes through options callbacks and defaults to waiting_for_data without a snapshot', () => {
        const onStateChange = jest.fn();
        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1', {
            onStateChange
        });

        widget.setWidgetState('initializing');
        widget.handleNoDataResponse();
        widget.setSnapshot({
            blockType: 'test-widget',
            series: []
        });

        expect(onStateChange).toHaveBeenCalled();
        expect(widget.getWidgetStatus().state).toBe('waiting_for_data');
    });

    test('keeps lifecycle callbacks working when widgets overwrite this.options for chart config', () => {
        const firstRequest = createDeferredRequest();
        const onStateChange = jest.fn();
        $.get.mockReturnValueOnce(firstRequest.api);

        const widget = new OptionsOverwritingWidget(null, 'uw-s1i1:r', 'Options Block', 'task-1', {
            onStateChange
        });
        widget.start();
        firstRequest.resolve({
            success: true,
            data: {
                ok: true
            }
        });

        expect(onStateChange).toHaveBeenCalledWith(widget, expect.objectContaining({
            state: 'rendered',
            hasSnapshot: true
        }));
        widget.stop();
    });

    test('default handler throws and helper methods keep valid points only', () => {
        const widget = new ReliaWidget(null, 'uw-s1i1:r', 'Plain Widget(block)', 'task-1');
        expect(() => widget.handleResponseData({})).toThrow('handleNewData not implemented');
        expect(widget.translatedName()).toBe('Plain Widget');
        expect(widget.englishName()).toBe('Plain Widget');
        expect(widget.translatedIdentifier()).toBe('Plain Widget(block)');
        expect(widget.downsamplePoints([
            { x: 1, y: 2 },
            { x: Number.NaN, y: 3 }
        ])).toEqual([{ x: 1, y: 2 }]);
    });

    test('performRequest returns immediately when the widget is not running', () => {
        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        widget.performRequest();
        expect($.get).not.toHaveBeenCalled();
    });

    test('downsamplePoints does not duplicate the last point when it is already sampled', () => {
        const widget = new TestWidget(null, 'uw-s1i1:r', 'Test Block', 'task-1');
        const points = [];
        for (let index = 0; index < 1025; index += 1) {
            points.push({ x: index, y: index });
        }

        const sampled = widget.downsamplePoints(points);

        expect(sampled[sampled.length - 1]).toEqual({ x: 1024, y: 1024 });
        expect(sampled.filter((point) => point.x === 1024)).toHaveLength(1);
    });
});
