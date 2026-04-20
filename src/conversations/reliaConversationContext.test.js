import { buildReliaConversationContext } from './reliaConversationContext';

describe('buildReliaConversationContext', () => {
    const originalDeviceName = process.env.REACT_APP_DEVICE_NAME;

    afterEach(() => {
        process.env.REACT_APP_DEVICE_NAME = originalDeviceName;
    });

    test('returns minimal context without widgets', () => {
        const context = buildReliaConversationContext({
            selectedTab: 'introduction',
            currentSession: {
                status: 'not_started',
                assignedInstanceName: ''
            },
            reliaWidgets: null
        });

        expect(context.labState.selectedTab).toBe('introduction');
        expect(context.labState.taskStatus).toBe('not_started');
        expect(context.context).toContain('RELIA laboratory state:');
        expect(context.context).toContain('Receiver plots: 0');
        expect(context.context).toContain('Transmitter plots: 0');
        expect(context.receiverPlots).toEqual([]);
        expect(context.transmitterPlots).toEqual([]);
    });

    test('returns cloned receiver and transmitter plot snapshots only', () => {
        const context = buildReliaConversationContext({
            selectedTab: 'laboratory',
            currentSession: {
                status: 'fully-assigned',
                assignedInstanceName: 'uw-s1i1',
                receiverFilename: 'receiver.grc',
                transmitterFilename: 'transmitter.grc',
                hiddenPrompt: 'secret'
            },
            reliaWidgets: {
                getAssistantContext: () => ({
                    deviceStatuses: {
                        receiver: 'rendered',
                        transmitter: 'waiting_for_data'
                    },
                    receiverPlots: [
                        {
                            blockType: 'time-sink',
                            blockName: 'Receiver Plot',
                            series: [
                                {
                                    label: 'Ch 1',
                                    points: [{ x: 0, y: 1 }]
                                }
                            ]
                        }
                    ],
                    transmitterPlots: [
                        {
                            blockType: 'frequency-sink',
                            blockName: 'Transmitter Plot',
                            series: [
                                {
                                    label: 'Ch 1',
                                    points: [{ x: 10, y: 5 }]
                                }
                            ]
                        }
                    ]
                })
            }
        });

        expect(context.receiverPlots).toHaveLength(1);
        expect(context.transmitterPlots).toHaveLength(1);
        expect(context.labState.deviceStatuses.receiver).toBe('rendered');
        expect(context.context).toContain('Receiver plots: 1');
        expect(context.context).toContain('Receiver Plot [time-sink]');
        expect(context.context).toContain('Transmitter Plot [frequency-sink]');
        expect(context.context).toContain('peak y 1 at x 0');
        expect(context.context).toContain('peak y 5 at x 10');

        const serialized = JSON.stringify(context);
        expect(serialized).not.toContain('receiver.grc');
        expect(serialized).not.toContain('transmitter.grc');
        expect(serialized).not.toContain('secret');
    });

    test('uses fallback session and widget defaults and clones nullable plot fields', () => {
        process.env.REACT_APP_DEVICE_NAME = 'pluto';

        const widgetContext = {
            receiverPlots: [
                {
                    blockType: 'number-sink',
                    blockName: 'Receiver Number',
                    series: [
                        {
                            label: 'Value',
                            points: [{ x: 1, y: 2 }]
                        }
                    ]
                }
            ]
        };

        const context = buildReliaConversationContext({
            selectedTab: 'laboratory',
            currentSession: null,
            reliaWidgets: {
                getAssistantContext: () => widgetContext
            }
        });

        expect(context.labState).toEqual({
            selectedTab: 'laboratory',
            taskStatus: 'not_started',
            assignedInstanceName: null,
            deviceType: 'pluto',
            deviceStatuses: {}
        });
        expect(context.receiverPlots[0]).toEqual({
            blockType: 'number-sink',
            blockName: 'Receiver Number',
            xLabel: null,
            yLabel: null,
            yUnit: null,
            series: [
                {
                    label: 'Value',
                    points: [{ x: 1, y: 2 }]
                }
            ]
        });

        widgetContext.receiverPlots[0].series[0].points[0].y = 999;
        expect(context.receiverPlots[0].series[0].points[0].y).toBe(2);
        expect(context.transmitterPlots).toEqual([]);
    });

    test('summarizes large series without dumping every point into the text context', () => {
        const points = Array.from({ length: 16 }, (_, index) => ({
            x: index,
            y: index * 2
        }));

        const context = buildReliaConversationContext({
            selectedTab: 'laboratory',
            currentSession: {
                status: 'completed',
                assignedInstanceName: 'uw-s1i2'
            },
            reliaWidgets: {
                getAssistantContext: () => ({
                    deviceStatuses: {
                        receiver: 'rendered',
                        transmitter: 'rendered'
                    },
                    receiverPlots: [
                        {
                            blockType: 'vector-sink',
                            blockName: 'Receiver Plot',
                            xLabel: 'Point',
                            yLabel: 'Power',
                            yUnit: 'dB',
                            series: [
                                {
                                    label: "''",
                                    points
                                }
                            ]
                        }
                    ],
                    transmitterPlots: []
                })
            }
        });

        expect(context.receiverPlots[0].series[0].points).toHaveLength(16);
        expect(context.context).toContain('Receiver Plot [vector-sink]; axes x=Point, y=Power (dB)');
        expect(context.context).toContain('unnamed series: 16 points');
        expect(context.context).toContain('(0, 0)');
        expect(context.context).toContain('(15, 30)');
        expect(context.context).not.toContain('(14, 28), (15, 30)');
    });

    test('falls back when reliaWidgets does not expose getAssistantContext', () => {
        const context = buildReliaConversationContext({
            selectedTab: 'loader',
            currentSession: {},
            reliaWidgets: {}
        });

        expect(context.labState.deviceStatuses).toEqual({});
        expect(context.receiverPlots).toEqual([]);
        expect(context.transmitterPlots).toEqual([]);
    });

    test('normalizes missing plot arrays and missing series definitions', () => {
        const context = buildReliaConversationContext({
            selectedTab: 'laboratory',
            currentSession: {},
            reliaWidgets: {
                getAssistantContext: () => ({
                    receiverPlots: [
                        {
                            blockType: 'time-sink',
                            blockName: 'Receiver Empty'
                        }
                    ],
                    transmitterPlots: null,
                    deviceStatuses: null
                })
            }
        });

        expect(context.labState.deviceStatuses).toEqual({});
        expect(context.receiverPlots).toEqual([
            {
                blockType: 'time-sink',
                blockName: 'Receiver Empty',
                xLabel: null,
                yLabel: null,
                yUnit: null,
                series: []
            }
        ]);
        expect(context.transmitterPlots).toEqual([]);
    });
});
