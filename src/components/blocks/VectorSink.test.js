import $ from 'jquery';
import ReliaVectorSink from './VectorSink';
jest.mock('../../i18n', () => ({t: value => value}));

afterEach(() => { delete window.google; });

test('renders the radio spectrum in MHz with labels and matching snapshot coordinates', () => {
    const draw = jest.fn();
    window.google = {visualization: {
        LineChart: jest.fn(() => ({draw})),
        arrayToDataTable: data => data
    }};
    const widget = new ReliaVectorSink($('<div>'), 'uw-s2i1:r', 'Vector Sink(1)', 'task');
    const data = {params: {
        nconnections: 1, vlen: 1024, name: 'Received RF spectrum',
        x_start: 2449.7, x_step: 0.6 / 1024,
        x_axis_label: 'Frequency', x_units: 'MHz',
        y_axis_label: 'Relative power', y_units: 'dB',
        ymin: -140, ymax: 10, average: 1,
        colors: ['#0000ff'], labels: ['Receiver'], widths: [1]
    }, data: {streams: [{x: Array.from({length: 1024}, (_, n) => n === 640 ? 10 : -30)}]}};
    // Include a completed averaging cycle, as the normal widget poller does.
    for (let n = 0; n < 3; n += 1) widget.handleResponseData(data);
    const [table, options] = draw.mock.calls[draw.mock.calls.length - 1];
    expect(options.hAxis.title).toBe('Frequency (MHz)');
    expect(options.vAxis.title).toBe('Relative power (dB)');
    expect(table[641]).toEqual([2450.075, 10]);
    expect(table[1][0]).toBe(2449.7);
    expect(widget.getAiContext().xLabel).toBe('Frequency (MHz)');
    expect(widget.getAiContext().series[0].points[640]).toEqual({x: 2450.075, y: 10});
});
