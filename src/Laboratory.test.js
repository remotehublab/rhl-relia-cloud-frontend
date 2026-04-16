import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Laboratory from './Laboratory';

jest.mock('react-i18next', () => ({
    withTranslation: () => (Component) => Component
}));

jest.mock('./i18n', () => ({
    __esModule: true,
    default: {},
    t: jest.fn((key) => key)
}));

const mockReliaWidgetsState = {
    instances: []
};

jest.mock('./components/blocks/loaderDevelopment', () => ({
    __esModule: true,
    ReliaWidgets: class MockReliaWidgets {
        constructor($divElement, taskId, currentSessionRef) {
            this.$divElement = $divElement;
            this.taskId = taskId;
            this.currentSessionRef = currentSessionRef;
            this.running = false;
            this.start = jest.fn(() => {
                this.running = true;
            });
            this.stop = jest.fn(() => {
                this.running = false;
            });
            this.clean = jest.fn();
            mockReliaWidgetsState.instances.push(this);
        }
    }
}));

function jsonResponse(payload, status = 200) {
    return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        json: async () => payload
    });
}

function createSession(overrides = {}) {
    return {
        taskIdentifier: 'task-1',
        status: 'queued',
        message: '',
        assignedInstance: 'instance-1',
        assignedInstanceName: 'uw-s1i1',
        receiverFilename: 'rx.grc',
        transmitterFilename: 'tx.grc',
        cameraUrl: 'https://camera.example/feed',
        renderingWidgets: false,
        ...overrides
    };
}

describe('Laboratory component', () => {
    const originalApiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    let dateCounter = 0;

    beforeEach(() => {
        jest.useFakeTimers();
        process.env.REACT_APP_API_BASE_URL = 'https://relia.rhlab.ece.uw.edu/pluto';
        mockReliaWidgetsState.instances = [];
        dateCounter = 0;
        jest.spyOn(Date.prototype, 'toString').mockImplementation(() => {
            dateCounter += 1;
            return 'STAMP-' + dateCounter;
        });
        global.fetch = jest.fn();
    });

    afterEach(() => {
        Date.prototype.toString.mockRestore();
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        process.env.REACT_APP_API_BASE_URL = originalApiBaseUrl;
        delete global.fetch;
    });

    test('starts widgets only when charts are ready and a task identifier exists', () => {
        const setReliaWidgets = jest.fn();
        const { rerender } = render(
            <Laboratory
                currentSession={createSession({ taskIdentifier: null })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={setReliaWidgets}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="ready"
            />
        );

        expect(mockReliaWidgetsState.instances).toHaveLength(0);

        rerender(
            <Laboratory
                currentSession={createSession({ taskIdentifier: 'task-1' })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={setReliaWidgets}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="loading"
            />
        );
        expect(mockReliaWidgetsState.instances).toHaveLength(0);

        rerender(
            <Laboratory
                currentSession={createSession({ taskIdentifier: 'task-1' })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={setReliaWidgets}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="ready"
            />
        );

        expect(mockReliaWidgetsState.instances).toHaveLength(1);
        expect(mockReliaWidgetsState.instances[0].start).toHaveBeenCalled();
        expect(setReliaWidgets).toHaveBeenCalledWith(mockReliaWidgetsState.instances[0]);
    });

    test('stops previous widgets before restart and cleans up on unmount', () => {
        const oldWidgets = {
            stop: jest.fn(),
            clean: jest.fn()
        };
        const setReliaWidgets = jest.fn();
        const { rerender, unmount } = render(
            <Laboratory
                currentSession={createSession({ taskIdentifier: 'task-1' })}
                setCurrentSession={jest.fn()}
                reliaWidgets={oldWidgets}
                setReliaWidgets={setReliaWidgets}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="ready"
            />
        );

        const firstInstance = mockReliaWidgetsState.instances[0];
        expect(oldWidgets.stop).toHaveBeenCalled();
        expect(firstInstance.start).toHaveBeenCalled();

        rerender(
            <Laboratory
                currentSession={createSession({ taskIdentifier: 'task-2' })}
                setCurrentSession={jest.fn()}
                reliaWidgets={firstInstance}
                setReliaWidgets={setReliaWidgets}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="ready"
            />
        );

        expect(firstInstance.stop).toHaveBeenCalled();
        expect(mockReliaWidgetsState.instances).toHaveLength(2);

        const secondInstance = mockReliaWidgetsState.instances[1];
        unmount();

        expect(secondInstance.stop).toHaveBeenCalled();
        expect(secondInstance.clean).toHaveBeenCalled();
    });

    test.each(['completed', 'error', 'deleted'])('stops active widgets when the task becomes %s', (status) => {
        const activeWidgets = {
            stop: jest.fn(),
            clean: jest.fn()
        };

        render(
            <Laboratory
                currentSession={createSession({ status })}
                setCurrentSession={jest.fn()}
                reliaWidgets={activeWidgets}
                setReliaWidgets={jest.fn()}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="failed"
            />
        );

        expect(activeWidgets.stop).toHaveBeenCalled();
    });

    test('renders chart library alerts only when an instance is assigned', () => {
        const { rerender } = render(
            <Laboratory
                currentSession={createSession({ assignedInstance: 'instance-1' })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={jest.fn()}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="loading"
            />
        );

        expect(screen.getByText('runner.widget-status.loading-chart-library')).toBeInTheDocument();

        rerender(
            <Laboratory
                currentSession={createSession({ assignedInstance: 'instance-1' })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={jest.fn()}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="failed"
            />
        );

        expect(screen.getByText('runner.widget-status.chart-library-failed')).toBeInTheDocument();

        rerender(
            <Laboratory
                currentSession={createSession({ assignedInstance: null })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={jest.fn()}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="failed"
            />
        );

        expect(screen.queryByText('runner.widget-status.chart-library-failed')).toBeNull();
    });

    test('refreshes a completed task, updates session state, and schedules status polling', async () => {
        const setCurrentSession = jest.fn();
        const checkStatus = jest.fn();
        const setFileStatus = jest.fn();
        const oldWidgets = {
            stop: jest.fn(),
            clean: jest.fn()
        };
        global.fetch.mockImplementation(() => jsonResponse({
            success: true,
            taskIdentifier: 'task-2',
            status: 'queued',
            message: 'new task'
        }));

        render(
            <Laboratory
                currentSession={createSession({ status: 'completed', taskIdentifier: 'task-1' })}
                setCurrentSession={setCurrentSession}
                reliaWidgets={oldWidgets}
                setReliaWidgets={jest.fn()}
                fileStatus={null}
                setFileStatus={setFileStatus}
                manageTask={jest.fn()}
                checkStatus={checkStatus}
                chartLibraryStatus="ready"
            />
        );

        fireEvent.click(screen.getByText('runner.buttons.refresh'));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://relia.rhlab.ece.uw.edu/pluto/api/user/tasks/',
                { method: 'POST' }
            );
        });
        expect(oldWidgets.stop).toHaveBeenCalled();
        expect(oldWidgets.clean).toHaveBeenCalled();
        await waitFor(() => {
            expect(setCurrentSession).toHaveBeenCalledWith(expect.objectContaining({
                taskIdentifier: 'task-2',
                status: 'queued'
            }));
        });

        jest.advanceTimersByTime(1000);
        expect(checkStatus).toHaveBeenCalled();
        expect(setFileStatus).not.toHaveBeenCalled();
    });

    test('shows a refresh error when the restart request fails', async () => {
        const setFileStatus = jest.fn();
        global.fetch.mockImplementation(() => jsonResponse({}, 500));

        render(
            <Laboratory
                currentSession={createSession({ status: 'completed' })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={jest.fn()}
                fileStatus={null}
                setFileStatus={setFileStatus}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="ready"
            />
        );

        fireEvent.click(screen.getByText('runner.buttons.refresh'));

        await waitFor(() => {
            expect(setFileStatus).toHaveBeenCalled();
        });
        expect(setFileStatus.mock.calls[0][0].props.children).toBe('Error sending files, please try again');
    });

    test('camera reloads only in active statuses and stops when hidden', () => {
        const { rerender } = render(
            <Laboratory
                currentSession={createSession({ status: 'receiver-assigned' })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={jest.fn()}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="ready"
            />
        );

        fireEvent.click(screen.getByText('runner.buttons.show'));
        const image = screen.getByAltText('Camera');
        const firstSrc = image.getAttribute('src');

        fireEvent.load(image);
        jest.advanceTimersByTime(50);
        const secondSrc = image.getAttribute('src');
        expect(secondSrc).not.toEqual(firstSrc);

        fireEvent.click(screen.getByText('runner.buttons.hide'));
        fireEvent.load(image);
        jest.advanceTimersByTime(50);
        expect(screen.queryByAltText('Camera')).toBeNull();
        expect(image.getAttribute('src')).toEqual(secondSrc);

        rerender(
            <Laboratory
                currentSession={createSession({ status: 'completed' })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={jest.fn()}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="ready"
            />
        );

        fireEvent.click(screen.getByText('runner.buttons.show'));
        const completedImage = screen.getByAltText('Camera');
        const completedSrc = completedImage.getAttribute('src');
        fireEvent.load(completedImage);
        jest.advanceTimersByTime(50);
        expect(screen.getByAltText('Camera').getAttribute('src')).toEqual(completedSrc);
    });

    test.each([
        ['queued', 'runner.messages.waiting-for-a-remote-set-up-to-be-available'],
        ['receiver-assigned', 'runner.messages.remote-set-up-assigned-waiting-to-start-running-your-gnu-radio-code'],
        ['fully-assigned', 'runner.messages.your-gnu-radio-code-is-now-running-in-both-remote-devices'],
        ['receiver-still-processing', 'runner.messages.the-remote-set-up-is-processing-your-GNU-Radio-in-the-receiver-device'],
        ['transmitter-still-processing', 'runner.messages.the-remote-set-up-is-processing-your-GNU-Radio-in-the-transmitter-device'],
        ['completed', 'runner.messages.your-gnu-radio-code-is-not-running-anymore-feel-free-to-run-it-again'],
        ['error', 'runner.messages.there-was-an-error-running-your-gnu-radio-code'],
        ['deleted', 'runner.messages.your-gnu-radio-code-is-not-running-anymore-feel-free-to-run-it-again']
    ])('renders the status message mapping for %s', (status, expectedKey) => {
        render(
            <Laboratory
                currentSession={createSession({ status })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={jest.fn()}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="ready"
            />
        );

        expect(screen.getByText(expectedKey)).toBeInTheDocument();
    });

    test.each([
        ['starting', 'runner.messages.starting-to-run-again-your-gnu-radio-code'],
        ['stopping', 'runner.messages.stopping'],
        ['processing', 'runner.messages.your-gnu-radio-files-are-being-processed-please-wait'],
        ['mystery-status', 'Status not recognized']
    ])('renders the extended status message mapping for %s', (status, expectedKey) => {
        render(
            <Laboratory
                currentSession={createSession({ status })}
                setCurrentSession={jest.fn()}
                reliaWidgets={null}
                setReliaWidgets={jest.fn()}
                fileStatus={null}
                setFileStatus={jest.fn()}
                manageTask={jest.fn()}
                checkStatus={jest.fn()}
                chartLibraryStatus="ready"
            />
        );

        expect(screen.getByText(expectedKey)).toBeInTheDocument();
    });
});
