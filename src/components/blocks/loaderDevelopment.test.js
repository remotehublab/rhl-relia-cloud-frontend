import $ from 'jquery';

import { ReliaWidgets } from './loaderDevelopment';

jest.mock('../../i18n', () => ({
    __esModule: true,
    t: jest.fn((key) => key)
}));

jest.mock('jquery', () => {
    const actual = jest.requireActual('jquery');
    actual.get = jest.fn();

    return {
        __esModule: true,
        default: actual
    };
});

const mockBlockState = {
    instances: []
};

function mockCreateFakeBlockClass(kind) {
    return class FakeBlock {
        constructor($divContents, deviceIdentifier, blockName, taskId, options) {
            this.$divContents = $divContents;
            this.deviceIdentifier = deviceIdentifier;
            this.blockName = blockName;
            this.taskId = taskId;
            this.options = options || {};
            this.kind = kind;
            this.running = false;
            this.snapshot = null;
            this.start = jest.fn(() => {
                this.running = true;
                if (this.options.onStateChange) {
                    this.options.onStateChange(this, {
                        state: 'waiting_for_data',
                        error: null,
                        hasSnapshot: !!this.snapshot
                    });
                }
            });
            this.stop = jest.fn(() => {
                this.running = false;
            });
            mockBlockState.instances.push(this);
        }

        translatedIdentifier() {
            return this.blockName + ' translated';
        }

        getAiContext() {
            return this.snapshot;
        }

        emitStatus(state, error = null, hasSnapshot = !!this.snapshot) {
            this.options.onStateChange(this, {
                state,
                error,
                hasSnapshot
            });
        }
    };
}

jest.mock('./ConstellationSink.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('constellation')
}));
jest.mock('./TimeSink.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('time')
}));
jest.mock('./VectorSink.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('vector')
}));
jest.mock('./VariableRange.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('range')
}));
jest.mock('./HistogramSink.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('histogram')
}));
jest.mock('./VariableCheckBox.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('checkbox')
}));
jest.mock('./VariablePushButton.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('button')
}));
jest.mock('./VariableChooser.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('chooser')
}));
jest.mock('./NumberSink.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('number')
}));
jest.mock('./EyePlot.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('eye')
}));
jest.mock('./FrequencySink.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('frequency')
}));
jest.mock('./AutoCorrSink.js', () => ({
    __esModule: true,
    default: mockCreateFakeBlockClass('autocorr')
}));

function createDeferredRequest() {
    const deferred = {
        doneHandler: null,
        failHandler: null
    };

    return {
        api: {
            done(handler) {
                deferred.doneHandler = handler;
                return this;
            },
            fail(handler) {
                deferred.failHandler = handler;
                return this;
            }
        },
        resolve(payload) {
            deferred.doneHandler(payload);
        },
        reject() {
            deferred.failHandler();
        }
    };
}

function createRoot() {
    document.body.innerHTML = `
        <div id="root">
            <div id="relia-widgets-receiver"></div>
            <div id="relia-widgets-transmitter"></div>
        </div>
    `;

    return $('#root');
}

describe('ReliaWidgets runtime', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        window.API_BASE_URL = 'https://relia.rhlab.ece.uw.edu/pluto/api/';
        mockBlockState.instances = [];
        $.get.mockReset();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    test('start initializes both device statuses and invokes processing', () => {
        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: null,
                assignedInstanceName: 'uw-s1i1'
            }
        });
        const processSpy = jest.spyOn(widgets, 'process').mockImplementation(() => {});

        widgets.start();

        expect(widgets.getDeviceStatuses()).toEqual({
            receiver: 'initializing',
            transmitter: 'initializing'
        });
        expect(processSpy).toHaveBeenCalled();
    });

    test('retries device discovery when the devices endpoint fails', () => {
        const first = createDeferredRequest();
        const second = createDeferredRequest();
        $.get
            .mockReturnValueOnce(first.api)
            .mockReturnValueOnce(second.api);

        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: null,
                assignedInstanceName: 'uw-s1i1'
            }
        });
        widgets.start();

        first.resolve({ success: false });
        expect(widgets.getDeviceStatuses()).toEqual({
            receiver: 'retrying',
            transmitter: 'retrying'
        });

        jest.advanceTimersByTime(500);
        expect($.get).toHaveBeenCalledTimes(2);
        widgets.stop();
    });

    test('keeps both sides waiting for blocks until an instance is assigned', () => {
        const devices = createDeferredRequest();
        $.get.mockReturnValueOnce(devices.api);

        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: null,
                assignedInstanceName: 'uw-s1i1'
            }
        });
        widgets.start();

        devices.resolve({
            success: true
        });

        expect(widgets.getDeviceStatuses()).toEqual({
            receiver: 'waiting_for_block',
            transmitter: 'waiting_for_block'
        });
        widgets.stop();
    });

    test('marks only the affected side as retrying when block discovery fails', () => {
        const devices = createDeferredRequest();
        const receiverBlocks = createDeferredRequest();
        const transmitterBlocks = createDeferredRequest();
        $.get
            .mockReturnValueOnce(devices.api)
            .mockReturnValueOnce(receiverBlocks.api)
            .mockReturnValueOnce(transmitterBlocks.api);

        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        widgets.start();

        devices.resolve({ success: true });
        receiverBlocks.resolve({ success: false });
        transmitterBlocks.resolve({ success: true, blocks: [] });

        expect(widgets.getDeviceStatuses()).toEqual({
            receiver: 'retrying',
            transmitter: 'waiting_for_block'
        });
        widgets.stop();
    });

    test('keeps waiting_for_block when block discovery succeeds but no blocks exist', () => {
        const devices = createDeferredRequest();
        const receiverBlocks = createDeferredRequest();
        const transmitterBlocks = createDeferredRequest();
        $.get
            .mockReturnValueOnce(devices.api)
            .mockReturnValueOnce(receiverBlocks.api)
            .mockReturnValueOnce(transmitterBlocks.api);

        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        widgets.start();

        devices.resolve({ success: true });
        receiverBlocks.resolve({ success: true, blocks: [] });
        transmitterBlocks.resolve({ success: true, blocks: [] });

        expect(widgets.getDeviceStatuses()).toEqual({
            receiver: 'waiting_for_block',
            transmitter: 'waiting_for_block'
        });
        widgets.stop();
    });

    test('creates supported receiver and transmitter blocks and starts them', () => {
        const devices = createDeferredRequest();
        const receiverBlocks = createDeferredRequest();
        const transmitterBlocks = createDeferredRequest();
        $.get
            .mockReturnValueOnce(devices.api)
            .mockReturnValueOnce(receiverBlocks.api)
            .mockReturnValueOnce(transmitterBlocks.api);

        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        widgets.start();

        devices.resolve({ success: true });
        receiverBlocks.resolve({ success: true, blocks: ['RELIA Time Sink(receiver)'] });
        transmitterBlocks.resolve({ success: true, blocks: ['RELIA Number Sink(transmitter)'] });

        expect(mockBlockState.instances).toHaveLength(2);
        expect(mockBlockState.instances[0].start).toHaveBeenCalled();
        expect(mockBlockState.instances[1].start).toHaveBeenCalled();
        expect($('#root').text()).toContain('RELIA Time Sink(receiver) translated');
        expect($('#root').text()).toContain('RELIA Number Sink(transmitter) translated');
        expect(widgets.getDeviceStatuses()).toEqual({
            receiver: 'waiting_for_data',
            transmitter: 'waiting_for_data'
        });
        widgets.stop();
    });

    test('shows unsupported notices and marks the device as failed when only unsupported blocks exist', () => {
        const devices = createDeferredRequest();
        const receiverBlocks = createDeferredRequest();
        const transmitterBlocks = createDeferredRequest();
        $.get
            .mockReturnValueOnce(devices.api)
            .mockReturnValueOnce(receiverBlocks.api)
            .mockReturnValueOnce(transmitterBlocks.api);

        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        widgets.start();

        devices.resolve({ success: true });
        receiverBlocks.resolve({ success: true, blocks: ['Unsupported Widget'] });
        transmitterBlocks.resolve({ success: true, blocks: [] });

        expect(widgets.getDeviceStatuses().receiver).toBe('failed');
        expect($('#root').text()).toContain('runner.widget-status.unsupported-block');
        expect($('#root').text()).toContain('runner.widget-status.unsupported-only');
        widgets.stop();
    });

    test('applies device-status precedence across rendered, retrying, failed, waiting, and empty states', () => {
        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        widgets.registerBlockState('uw-s1i1:r', 'block-a', { state: 'waiting_for_data' });
        expect(widgets.getDeviceStatuses().receiver).toBe('waiting_for_data');

        widgets.registerBlockState('uw-s1i1:r', 'block-b', { state: 'failed' });
        expect(widgets.getDeviceStatuses().receiver).toBe('failed');

        widgets.registerBlockState('uw-s1i1:r', 'block-c', { state: 'retrying' });
        expect(widgets.getDeviceStatuses().receiver).toBe('retrying');

        widgets.registerBlockState('uw-s1i1:r', 'block-d', { state: 'rendered' });
        expect(widgets.getDeviceStatuses().receiver).toBe('rendered');

        delete widgets.blockStatusesByDevice['uw-s1i1:r'];
        widgets.refreshDeviceStatus('uw-s1i1:r');
        expect(widgets.getDeviceStatuses().receiver).toBe('waiting_for_block');
    });

    test('treats an existing snapshot as rendered even if the last reported state was not updated', () => {
        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });

        widgets.registerBlockState('uw-s1i1:r', 'block-a', {
            state: 'waiting_for_data',
            hasSnapshot: true
        });

        expect(widgets.getDeviceStatuses().receiver).toBe('rendered');
    });

    test('restarts an existing stopped block instead of duplicating it', () => {
        const firstDevices = createDeferredRequest();
        const firstReceiverBlocks = createDeferredRequest();
        const firstTransmitterBlocks = createDeferredRequest();
        const secondDevices = createDeferredRequest();
        const secondReceiverBlocks = createDeferredRequest();
        const secondTransmitterBlocks = createDeferredRequest();
        $.get
            .mockReturnValueOnce(firstDevices.api)
            .mockReturnValueOnce(firstReceiverBlocks.api)
            .mockReturnValueOnce(firstTransmitterBlocks.api)
            .mockReturnValueOnce(secondDevices.api)
            .mockReturnValueOnce(secondReceiverBlocks.api)
            .mockReturnValueOnce(secondTransmitterBlocks.api);

        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        widgets.start();
        firstDevices.resolve({ success: true });
        firstReceiverBlocks.resolve({ success: true, blocks: ['RELIA Time Sink(receiver)'] });
        firstTransmitterBlocks.resolve({ success: true, blocks: [] });

        const existingBlock = mockBlockState.instances[0];
        existingBlock.start.mockClear();
        existingBlock.running = false;

        widgets.process();
        secondDevices.resolve({ success: true });
        secondReceiverBlocks.resolve({ success: true, blocks: ['RELIA Time Sink(receiver)'] });
        secondTransmitterBlocks.resolve({ success: true, blocks: [] });

        expect(mockBlockState.instances).toHaveLength(1);
        expect(existingBlock.start).toHaveBeenCalledTimes(1);
        widgets.stop();
    });

    test('returns assistant context split by receiver and transmitter snapshots', () => {
        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });

        const receiverBlock = {
            deviceIdentifier: 'uw-s1i1:r',
            getAiContext: () => ({
                blockName: 'Receiver Plot'
            })
        };
        const transmitterBlock = {
            deviceIdentifier: 'uw-s1i1:t',
            getAiContext: () => ({
                blockName: 'Transmitter Plot'
            })
        };
        const nullSnapshotBlock = {
            deviceIdentifier: 'uw-s1i1:r',
            getAiContext: () => null
        };
        const nonPlotBlock = {
            deviceIdentifier: 'uw-s1i1:t'
        };
        widgets.blocks = [receiverBlock, transmitterBlock, nullSnapshotBlock, nonPlotBlock];
        widgets.setDeviceStatus('receiver', 'rendered');
        widgets.setDeviceStatus('transmitter', 'waiting_for_data');

        expect(widgets.getAssistantContext()).toEqual({
            receiverPlots: [{ blockName: 'Receiver Plot' }],
            transmitterPlots: [{ blockName: 'Transmitter Plot' }],
            deviceStatuses: {
                receiver: 'rendered',
                transmitter: 'waiting_for_data'
            }
        });
    });

    test('maps status messages and classes and does not duplicate unsupported notices', () => {
        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        const $deviceContents = $('#relia-widgets-receiver');

        expect(widgets.getStatusMessage('initializing')).toBe('runner.widget-status.initializing');
        expect(widgets.getStatusMessage('unknown')).toBe('');
        expect(widgets.getStatusClass('retrying')).toBe('alert alert-warning');
        expect(widgets.getStatusClass('failed')).toBe('alert alert-danger');
        expect(widgets.getStatusClass('waiting_for_block')).toBe('alert alert-info');

        widgets.addUnsupportedBlockNotice($deviceContents, 'uw-s1i1:r', 'Unsupported Widget');
        widgets.addUnsupportedBlockNotice($deviceContents, 'uw-s1i1:r', 'Unsupported Widget');

        expect($('#root').text()).toContain('runner.widget-status.unsupported-block');
        expect($('#root').find('.alert-warning')).toHaveLength(1);
    });

    test('retries after transport-level failures on block and device requests', () => {
        const firstDevices = createDeferredRequest();
        const receiverBlocks = createDeferredRequest();
        const transmitterBlocks = createDeferredRequest();
        const secondDevices = createDeferredRequest();
        const retryDevices = createDeferredRequest();
        const followUpDevices = createDeferredRequest();
        $.get
            .mockReturnValueOnce(firstDevices.api)
            .mockReturnValueOnce(receiverBlocks.api)
            .mockReturnValueOnce(transmitterBlocks.api)
            .mockReturnValueOnce(secondDevices.api)
            .mockReturnValueOnce(retryDevices.api)
            .mockReturnValueOnce(followUpDevices.api);

        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        widgets.start();

        firstDevices.resolve({ success: true });
        receiverBlocks.reject();
        transmitterBlocks.reject();
        expect(widgets.getDeviceStatuses()).toEqual({
            receiver: 'retrying',
            transmitter: 'retrying'
        });

        widgets.process();
        secondDevices.reject();
        expect(widgets.getDeviceStatuses()).toEqual({
            receiver: 'retrying',
            transmitter: 'retrying'
        });

        jest.advanceTimersByTime(500);
        expect($.get).toHaveBeenCalledTimes(6);
        widgets.stop();
    });

    test('ignores stale device and block callbacks after widgets are stopped', () => {
        const devicesFail = createDeferredRequest();
        $.get.mockReturnValueOnce(devicesFail.api);

        const stoppedBeforeDeviceFailure = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        stoppedBeforeDeviceFailure.start();
        stoppedBeforeDeviceFailure.stop();
        devicesFail.reject();

        expect(stoppedBeforeDeviceFailure.getDeviceStatuses()).toEqual({
            receiver: 'initializing',
            transmitter: 'initializing'
        });

        const devices = createDeferredRequest();
        const receiverBlocks = createDeferredRequest();
        const transmitterBlocks = createDeferredRequest();
        $.get
            .mockReset()
            .mockReturnValueOnce(devices.api)
            .mockReturnValueOnce(receiverBlocks.api)
            .mockReturnValueOnce(transmitterBlocks.api);

        const stoppedBeforeBlockCallbacks = new ReliaWidgets(createRoot(), 'task-2', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        stoppedBeforeBlockCallbacks.start();
        devices.resolve({ success: true });
        stoppedBeforeBlockCallbacks.stop();
        receiverBlocks.resolve({ success: false });
        transmitterBlocks.reject();

        expect(stoppedBeforeBlockCallbacks.getDeviceStatuses()).toEqual({
            receiver: 'waiting_for_block',
            transmitter: 'waiting_for_block'
        });
    });

    test('stop halts all blocks and clean clears DOM and registries', () => {
        const widgets = new ReliaWidgets(createRoot(), 'task-1', {
            current: {
                assignedInstance: 'instance-1',
                assignedInstanceName: 'uw-s1i1'
            }
        });
        widgets.blocks = [
            { stop: jest.fn() },
            { stop: jest.fn() }
        ];
        widgets.blocksById = { receiver: { a: {} } };
        widgets.blockStatusesByDevice = { 'uw-s1i1:r': { a: { state: 'failed' } } };
        widgets.unsupportedBlocksByDevice = { 'uw-s1i1:r': ['Unsupported'] };
        $('#relia-widgets-receiver').append('<span>receiver</span>');
        $('#relia-widgets-transmitter').append('<span>transmitter</span>');

        widgets.running = true;
        const firstBlock = widgets.blocks[0];
        const secondBlock = widgets.blocks[1];
        widgets.stop();
        widgets.clean();

        expect(firstBlock.stop).toHaveBeenCalled();
        expect(secondBlock.stop).toHaveBeenCalled();
        expect(widgets.blocks).toEqual([]);
        expect(widgets.blocksById).toEqual({});
        expect(widgets.blockStatusesByDevice).toEqual({});
        expect(widgets.unsupportedBlocksByDevice).toEqual({});
        expect($('#relia-widgets-receiver').text()).toBe('');
        expect($('#relia-widgets-transmitter').text()).toBe('');
    });
});
