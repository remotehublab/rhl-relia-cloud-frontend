import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import Outerloader from './Outerloader';
import i18n from './i18n';

jest.mock('react-i18next', () => ({
    withTranslation: () => (Component) => Component
}));

jest.mock('./i18n', () => {
    const changeLanguage = jest.fn();
    const t = jest.fn((key) => key);

    return {
        __esModule: true,
        default: {
            language: 'en',
            changeLanguage,
            t
        },
        t
    };
});

const mockState = {
    laboratoryProps: null,
    reliaWidgets: null
};

jest.mock('./Introduction', () => function IntroductionMock() {
    return <div data-testid="introduction-view">intro</div>;
});

jest.mock('./Loader', () => function LoaderMock(props) {
    const fileStatusText = props.fileStatus && props.fileStatus.props
        ? props.fileStatus.props.children
        : props.fileStatus || '';

    return (
        <div data-testid="loader-view">
            <button onClick={() => props.setSelectedTab('laboratory')}>go-laboratory</button>
            <button onClick={() => props.manageTask()}>manage-task</button>
            <button onClick={() => props.checkStatus()}>check-status</button>
            <div data-testid="loader-file-status">{fileStatusText}</div>
        </div>
    );
});

jest.mock('./Laboratory', () => function LaboratoryMock(props) {
    mockState.laboratoryProps = props;

    return (
        <div data-testid="laboratory-view">
            <div data-testid="chart-status">{props.chartLibraryStatus}</div>
            <div data-testid="lab-session-status">{props.currentSession.status}</div>
            <div data-testid="lab-task-id">{props.currentSession.taskIdentifier || ''}</div>
            <button
                onClick={() => props.setCurrentSession({
                    ...props.currentSession,
                    taskIdentifier: 'task-1',
                    status: 'queued',
                    assignedInstance: 'instance-1',
                    assignedInstanceName: 'uw-s1i1'
                })}
            >
                activate-session
            </button>
            <button
                onClick={() => props.setReliaWidgets(mockState.reliaWidgets)}
            >
                attach-widgets
            </button>
        </div>
    );
});

function jsonResponse(payload, options = {}) {
    const status = options.status || 200;
    const ok = Object.prototype.hasOwnProperty.call(options, 'ok') ? options.ok : status >= 200 && status < 300;

    return Promise.resolve({
        ok,
        status,
        json: async () => payload
    });
}

function flushPromises() {
    return Promise.resolve();
}

function createFetchMock(overrides = {}) {
    const pollData = overrides.pollData || {
        success: true,
        locale: 'en',
        redirect_to: 'https://labsland.example/back',
        conversations: null
    };
    const filesData = overrides.filesData || {
        success: true,
        files: [],
        metadata: {
            receiver: [],
            transmitter: []
        }
    };
    const statusData = overrides.statusData || {
        success: true,
        result: {
            available: true,
            enabled: true,
            role: 'student'
        }
    };
    const cancelData = overrides.cancelData || {
        success: true
    };
    const createTaskData = overrides.createTaskData || {
        success: true,
        taskIdentifier: 'task-created',
        status: 'queued',
        message: 'created'
    };
    const statusCheckData = overrides.statusCheckData || {
        success: true,
        status: 'completed',
        message: 'done',
        assignedInstance: 'uw-s1i1',
        transmitterFilename: 'tx.grc',
        receiverFilename: 'rx.grc',
        cameraUrl: 'https://camera.example'
    };
    let statusCheckIndex = 0;

    return jest.fn((url, options = {}) => {
        const clone = (payload) => JSON.parse(JSON.stringify(payload));

        if (url === 'https://portal.example/status') {
            return jsonResponse(clone(statusData), overrides.statusOptions);
        }
        if (url.endsWith('/api/user/poll')) {
            return jsonResponse(clone(pollData), overrides.pollOptions);
        }
        if (url.endsWith('/api/user/files/')) {
            return jsonResponse(clone(filesData), overrides.filesOptions);
        }
        if (url.includes('/scheduler/user/tasks/') && options.method === 'POST') {
            return jsonResponse(clone(cancelData), overrides.cancelOptions);
        }
        if (url.includes('/scheduler/user/tasks/') && options.method === 'GET') {
            if (Array.isArray(statusCheckData)) {
                const payload = statusCheckData[Math.min(statusCheckIndex, statusCheckData.length - 1)];
                statusCheckIndex += 1;
                return jsonResponse(clone(payload), overrides.statusCheckOptions);
            }
            return jsonResponse(clone(statusCheckData), overrides.statusCheckOptions);
        }
        if (url.endsWith('/api/user/tasks/') && options.method === 'POST') {
            return jsonResponse(clone(createTaskData), overrides.createTaskOptions);
        }

        throw new Error('Unexpected fetch URL: ' + url);
    });
}

describe('Outerloader integration', () => {
    const originalLocation = window.location;
    const originalGoogle = window.google;
    const originalApiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const originalDeviceName = process.env.REACT_APP_DEVICE_NAME;

    beforeEach(() => {
        jest.useFakeTimers();
        process.env.REACT_APP_API_BASE_URL = 'https://relia.rhlab.ece.uw.edu/pluto';
        process.env.REACT_APP_DEVICE_NAME = 'ADALM Pluto';
        mockState.laboratoryProps = null;
        mockState.reliaWidgets = {
            stop: jest.fn(),
            getAssistantContext: jest.fn(() => ({
                receiverPlots: [
                    {
                        blockType: 'time-sink',
                        blockName: 'Receiver Plot',
                        series: [{ label: 'RX', points: [{ x: 0, y: 1 }] }]
                    }
                ],
                transmitterPlots: [
                    {
                        blockType: 'frequency-sink',
                        blockName: 'Transmitter Plot',
                        series: [{ label: 'TX', points: [{ x: 1, y: 2 }] }]
                    }
                ],
                deviceStatuses: {
                    receiver: 'rendered',
                    transmitter: 'waiting_for_data'
                }
            }))
        };
        document.head.querySelectorAll('#googleChartsScript').forEach((node) => node.remove());
        document.body.innerHTML = '';
        delete window.google;
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: {
                _href: 'http://localhost/',
                set href(value) {
                    this._href = value;
                },
                get href() {
                    return this._href;
                }
            }
        });
        global.fetch = createFetchMock();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        window.google = originalGoogle;
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation
        });
        process.env.REACT_APP_API_BASE_URL = originalApiBaseUrl;
        process.env.REACT_APP_DEVICE_NAME = originalDeviceName;
        delete global.fetch;
    });

    test('polls user and files on mount, refreshes on interval, and cleans up the interval', async () => {
        window.google = {
            visualization: {}
        };
        global.fetch = createFetchMock({
            pollData: {
                success: true,
                locale: 'es',
                redirect_to: 'https://labsland.example/back',
                conversations: null
            }
        });

        const { unmount } = render(<Outerloader />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://relia.rhlab.ece.uw.edu/pluto/api/user/poll',
                { method: 'GET' }
            );
        });
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://relia.rhlab.ece.uw.edu/pluto/api/user/files/',
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        });
        expect(i18n.changeLanguage).toHaveBeenCalledWith('es');

        act(() => {
            jest.advanceTimersByTime(5 * 60 * 1000);
        });
        await waitFor(() => {
            const pollCalls = global.fetch.mock.calls.filter((call) => call[0].endsWith('/api/user/poll'));
            expect(pollCalls).toHaveLength(2);
        });

        const callCountBeforeUnmount = global.fetch.mock.calls.length;
        unmount();
        act(() => {
            jest.advanceTimersByTime(5 * 60 * 1000);
        });
        expect(global.fetch).toHaveBeenCalledTimes(callCountBeforeUnmount);
    });

    test('redirects to the configured location or the RELIA fallback when polling fails', async () => {
        window.google = {
            visualization: {}
        };
        global.fetch = createFetchMock({
            pollData: {
                success: false,
                redirect_to: 'https://labsland.example/return'
            }
        });

        render(<Outerloader />);

        await waitFor(() => {
            expect(window.location.href).toBe('https://labsland.example/return');
        });

        window.location.href = 'http://localhost/';
        global.fetch = createFetchMock({
            pollData: {
                success: false
            }
        });
        render(<Outerloader />);

        await waitFor(() => {
            expect(window.location.href).toBe('https://relia.rhlab.ece.uw.edu');
        });
    });

    test('handles chart library ready, load success, load error, missing charts, and timeout failure paths', async () => {
        let chartsCallback = null;
        window.google = {
            charts: {
                load: jest.fn(),
                setOnLoadCallback: jest.fn((callback) => {
                    chartsCallback = callback;
                })
            }
        };

        const { unmount } = render(<Outerloader />);
        const script = document.getElementById('googleChartsScript');
        expect(script).not.toBeNull();

        act(() => {
            script.onload();
        });
        window.google.visualization = {};
        chartsCallback();
        fireEvent.click(screen.getByText(/2\. loader\.upload\.load-files/));
        fireEvent.click(screen.getByText('go-laboratory'));
        await waitFor(() => {
            expect(screen.getByTestId('chart-status')).toHaveTextContent('ready');
        });
        expect(window.google.charts.load).toHaveBeenCalledWith('current', { packages: ['corechart'] });

        unmount();
        document.getElementById('googleChartsScript').remove();

        window.google = {
            charts: {
                load: jest.fn(),
                setOnLoadCallback: jest.fn()
            }
        };
        const errorRender = render(<Outerloader />);
        act(() => {
            document.getElementById('googleChartsScript').onerror();
        });
        await flushPromises();
        fireEvent.click(screen.getByText(/2\. loader\.upload\.load-files/));
        fireEvent.click(screen.getByText('go-laboratory'));
        await waitFor(() => {
            expect(screen.getByTestId('chart-status')).toHaveTextContent('failed');
        });
        errorRender.unmount();
        document.getElementById('googleChartsScript').remove();

        window.google = {};
        const missingChartsRender = render(<Outerloader />);
        act(() => {
            document.getElementById('googleChartsScript').onload();
        });
        await flushPromises();
        fireEvent.click(screen.getByText(/2\. loader\.upload\.load-files/));
        fireEvent.click(screen.getByText('go-laboratory'));
        await waitFor(() => {
            expect(screen.getByTestId('chart-status')).toHaveTextContent('failed');
        });
        missingChartsRender.unmount();
        document.getElementById('googleChartsScript').remove();

        let timeoutCallback = null;
        window.google = {
            charts: {
                load: jest.fn(),
                setOnLoadCallback: jest.fn((callback) => {
                    timeoutCallback = callback;
                })
            }
        };
        const timeoutRender = render(<Outerloader />);
        act(() => {
            document.getElementById('googleChartsScript').onload();
        });
        expect(timeoutCallback).not.toBeNull();
        act(() => {
            jest.advanceTimersByTime(10000);
        });
        fireEvent.click(screen.getByText(/2\. loader\.upload\.load-files/));
        fireEvent.click(screen.getByText('go-laboratory'));
        await waitFor(() => {
            expect(screen.getByTestId('chart-status')).toHaveTextContent('failed');
        });
        timeoutRender.unmount();
    });

    test('mounts one conversation component, refreshes config through statusUrl, and removes it when config disappears', async () => {
        window.google = {
            visualization: {}
        };
        global.fetch = createFetchMock({
            pollData: {
                success: true,
                locale: 'en',
                redirect_to: 'https://labsland.example/back',
                conversations: {
                    available: true,
                    enabled: false,
                    role: 'student',
                    statusUrl: 'https://portal.example/status'
                }
            },
            statusData: {
                success: true,
                result: {
                    available: true,
                    enabled: true,
                    role: 'student',
                    questions: ['Updated question']
                }
            }
        });

        const { rerender } = render(<Outerloader />);

        await waitFor(() => {
            expect(document.querySelectorAll('lle-conversation')).toHaveLength(1);
        });
        expect(global.fetch).toHaveBeenCalledWith('https://portal.example/status', { method: 'GET' });

        act(() => {
            jest.advanceTimersByTime(5 * 60 * 1000);
        });
        await waitFor(() => {
            const statusCalls = global.fetch.mock.calls.filter((call) => call[0] === 'https://portal.example/status');
            expect(statusCalls.length).toBeGreaterThanOrEqual(2);
        });
        expect(document.querySelectorAll('lle-conversation')).toHaveLength(1);

        global.fetch = createFetchMock({
            pollData: {
                success: true,
                locale: 'en',
                redirect_to: 'https://labsland.example/back',
                conversations: null
            }
        });
        rerender(<Outerloader />);
        act(() => {
            jest.advanceTimersByTime(5 * 60 * 1000);
        });
        await flushPromises();
        await waitFor(() => {
            expect(document.querySelectorAll('lle-conversation')).toHaveLength(0);
        });
    });

    test('logs file listing network errors and skips conversation mounting when the container is unavailable', async () => {
        window.google = {
            visualization: {}
        };
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const originalGetElementById = document.getElementById.bind(document);
        const getElementByIdSpy = jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'conversation-container') {
                return null;
            }
            return originalGetElementById(id);
        });
        global.fetch = createFetchMock({
            pollData: {
                success: true,
                locale: 'en',
                redirect_to: '',
                conversations: {
                    statusUrl: 'https://portal.example/status'
                }
            },
            filesOptions: {
                ok: false,
                status: 500
            }
        });

        render(<Outerloader />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', 'Network response was not ok.');
        });
        expect(document.querySelector('lle-conversation')).toBeNull();

        getElementByIdSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test('wires live assistant context and cancels active tasks when leaving laboratory', async () => {
        window.google = {
            visualization: {}
        };
        global.fetch = createFetchMock({
            pollData: {
                success: true,
                locale: 'en',
                redirect_to: 'https://labsland.example/back',
                conversations: {
                    available: true,
                    enabled: true,
                    role: 'student'
                }
            }
        });

        render(<Outerloader />);

        await waitFor(() => {
            expect(document.querySelectorAll('lle-conversation')).toHaveLength(1);
        });

        fireEvent.click(screen.getByText(/2\. loader\.upload\.load-files/));
        fireEvent.click(screen.getByText('go-laboratory'));
        fireEvent.click(screen.getByText('activate-session'));
        fireEvent.click(screen.getByText('attach-widgets'));

        await waitFor(() => {
            const conversation = document.querySelector('lle-conversation');
            const context = conversation.getContextForMessage();
            expect(context.labState.selectedTab).toBe('laboratory');
            expect(context.labState.taskStatus).toBe('queued');
            expect(context.labState.deviceStatuses).toEqual({
                receiver: 'rendered',
                transmitter: 'waiting_for_data'
            });
            expect(context.receiverPlots).toHaveLength(1);
            expect(context.transmitterPlots).toHaveLength(1);
        });

        fireEvent.click(screen.getByText(/1\. loader\.upload\.introduction/));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://relia.rhlab.ece.uw.edu/pluto/scheduler/user/tasks/task-1',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ action: 'delete' })
                }
            );
        });
        expect(mockState.reliaWidgets.stop).toHaveBeenCalled();
    });

    test('starts a task from the loader and polls scheduler status into the laboratory view', async () => {
        window.google = {
            visualization: {}
        };
        global.fetch = createFetchMock({
            statusCheckData: {
                success: true,
                status: 'completed',
                message: 'completed',
                assignedInstance: 'uw-s1i1',
                transmitterFilename: 'tx-1.grc',
                receiverFilename: 'rx-1.grc',
                cameraUrl: 'https://camera.example/1'
            }
        });

        render(<Outerloader />);

        fireEvent.click(screen.getByText(/2\. loader\.upload\.load-files/));
        fireEvent.click(screen.getByText('manage-task'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://relia.rhlab.ece.uw.edu/pluto/api/user/tasks/',
                { method: 'POST' }
            );
        });
        await waitFor(() => {
            expect(screen.getByTestId('laboratory-view')).toBeInTheDocument();
            expect(screen.getByTestId('lab-task-id')).toHaveTextContent('task-created');
        });

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://relia.rhlab.ece.uw.edu/pluto/scheduler/user/tasks/task-created',
                { method: 'GET' }
            );
        });
        await waitFor(() => {
            expect(screen.getByTestId('lab-session-status')).toHaveTextContent('completed');
        });
    });

    test('shows task creation failures in the loader and logs failed scheduler checks', async () => {
        window.google = {
            visualization: {}
        };
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        global.fetch = createFetchMock({
            createTaskData: {
                success: false
            },
            statusCheckData: {
                success: false,
                message: 'scheduler failed'
            }
        });

        render(<Outerloader />);

        fireEvent.click(screen.getByText(/2\. loader\.upload\.load-files/));
        fireEvent.click(screen.getByText('manage-task'));

        await waitFor(() => {
            expect(screen.getByTestId('loader-file-status')).toHaveTextContent('Error sending files, please try again');
        });

        fireEvent.click(screen.getByText('check-status'));
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to check status:', 'scheduler failed');
        });

        consoleErrorSpy.mockRestore();
    });

    test('retries queued scheduler statuses and surfaces poll/load errors', async () => {
        window.google = {
            visualization: {}
        };
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        global.fetch = createFetchMock({
            pollOptions: {
                ok: false,
                status: 500
            },
            filesData: {
                success: false,
                message: 'file listing failed',
                files: [],
                metadata: {
                    receiver: [],
                    transmitter: []
                }
            },
            statusCheckData: [
                {
                    success: true,
                    status: 'queued',
                    message: 'queued',
                    assignedInstance: 'uw-s1i1',
                    transmitterFilename: 'tx-1.grc',
                    receiverFilename: 'rx-1.grc',
                    cameraUrl: 'https://camera.example/1'
                },
                {
                    success: true,
                    status: 'completed',
                    message: 'completed',
                    assignedInstance: 'uw-s1i1',
                    transmitterFilename: 'tx-1.grc',
                    receiverFilename: 'rx-1.grc',
                    cameraUrl: 'https://camera.example/1'
                }
            ]
        });

        render(<Outerloader />);

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Fetch error:', 'Network response was not ok.');
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching files:', 'file listing failed');

        global.fetch = createFetchMock({
            statusCheckData: [
                {
                    success: true,
                    status: 'queued',
                    message: 'queued',
                    assignedInstance: 'uw-s1i1',
                    transmitterFilename: 'tx-1.grc',
                    receiverFilename: 'rx-1.grc',
                    cameraUrl: 'https://camera.example/1'
                },
                {
                    success: true,
                    status: 'completed',
                    message: 'completed',
                    assignedInstance: 'uw-s1i1',
                    transmitterFilename: 'tx-1.grc',
                    receiverFilename: 'rx-1.grc',
                    cameraUrl: 'https://camera.example/1'
                }
            ]
        });
        fireEvent.click(screen.getByText(/2\. loader\.upload\.load-files/));
        fireEvent.click(screen.getByText('manage-task'));

        await waitFor(() => {
            expect(screen.getByTestId('laboratory-view')).toBeInTheDocument();
            expect(screen.getByTestId('lab-task-id')).toHaveTextContent('task-created');
        });

        await act(async () => {
            jest.advanceTimersByTime(1000);
            await flushPromises();
        });

        await act(async () => {
            jest.advanceTimersByTime(1000);
            await flushPromises();
        });

        await waitFor(() => {
            const schedulerGets = global.fetch.mock.calls.filter((call) =>
                call[0] === 'https://relia.rhlab.ece.uw.edu/pluto/scheduler/user/tasks/task-created'
                && call[1].method === 'GET'
            );
            expect(schedulerGets.length).toBeGreaterThanOrEqual(2);
            expect(screen.getByTestId('lab-session-status')).toHaveTextContent('completed');
        });

        consoleErrorSpy.mockRestore();
    });

    test('logs cancellation failures and surfaces non-200 task creation errors', async () => {
        window.google = {
            visualization: {}
        };
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        mockState.reliaWidgets = {
            stop: jest.fn(),
            getAssistantContext: jest.fn(() => ({
                receiverPlots: [],
                transmitterPlots: [],
                deviceStatuses: {
                    receiver: 'waiting_for_data',
                    transmitter: 'waiting_for_data'
                }
            }))
        };
        global.fetch = createFetchMock({
            pollData: {
                success: true,
                locale: 'en',
                redirect_to: 'https://labsland.example/back',
                conversations: {
                    available: true,
                    enabled: true,
                    role: 'student'
                }
            },
            cancelOptions: {
                status: 500,
                ok: false
            }
        });

        render(<Outerloader />);
        await waitFor(() => {
            expect(document.querySelectorAll('lle-conversation')).toHaveLength(1);
        });

        fireEvent.click(screen.getByText(/2\. loader\.upload\.load-files/));
        fireEvent.click(screen.getByText('go-laboratory'));
        fireEvent.click(screen.getByText('activate-session'));
        fireEvent.click(screen.getByText('attach-widgets'));
        fireEvent.click(screen.getByText(/1\. loader\.upload\.introduction/));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error canceling task', expect.any(Error));
        });

        global.fetch = createFetchMock({
            createTaskOptions: {
                status: 500,
                ok: false
            }
        });
        fireEvent.click(screen.getByText(/2\. loader\.upload\.load-files/));
        fireEvent.click(screen.getByText('manage-task'));

        await waitFor(() => {
            expect(screen.getByTestId('loader-file-status')).toHaveTextContent('Error sending files, please try again');
        });

        consoleErrorSpy.mockRestore();
    });
});
