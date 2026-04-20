import {
    buildDefaultQuestions,
    ensureConversationComponent,
    removeConversationComponent,
    resolveConversationApiEndpoint,
    resolveConversationConfig
} from './reliaConversation';

describe('reliaConversation helpers', () => {
    afterEach(() => {
        delete window.LANG;
        delete window.LANGUAGE;
    });

    test('returns null when container or config is missing', () => {
        expect(ensureConversationComponent({
            container: null,
            config: {
                available: true
            }
        })).toBeNull();

        const container = document.createElement('div');
        expect(ensureConversationComponent({
            container,
            config: null
        })).toBeNull();
    });

    test('uses built-in defaults when optional inputs are omitted', () => {
        const container = document.createElement('div');
        const component = ensureConversationComponent({
            container,
            config: {
                available: true,
                enabled: true,
                role: 'student'
            },
            apiEndpoint: 'https://relia.rhlab.ece.uw.edu/pluto/'
        });

        expect(component.context).toEqual({});
        expect(component.questions).toEqual(buildDefaultQuestions());
    });

    test('ensureConversationComponent mounts only one component and refreshes properties', () => {
        document.body.innerHTML = '<div id="conversation-container"></div>';
        const container = document.getElementById('conversation-container');
        const getContextForMessage = jest.fn(() => ({ labState: { selectedTab: 'introduction' } }));

        ensureConversationComponent({
            container,
            config: {
                available: true,
                enabled: true,
                role: 'student',
                allowFullTextMessages: true
            },
            apiEndpoint: 'https://relia.rhlab.ece.uw.edu/pluto/',
            getContextForMessage,
            defaultQuestions: buildDefaultQuestions()
        });

        ensureConversationComponent({
            container,
            config: {
                available: true,
                enabled: true,
                role: 'student',
                allowFullTextMessages: false
            },
            apiEndpoint: 'https://relia.rhlab.ece.uw.edu/pluto/',
            getContextForMessage,
            defaultQuestions: buildDefaultQuestions()
        });

        const conversationComponents = container.querySelectorAll('lle-conversation');
        expect(conversationComponents).toHaveLength(1);
        expect(conversationComponents[0].allowFullTextMessages).toBe(false);
        expect(getContextForMessage).toHaveBeenCalledTimes(2);
    });

    test('applies instructor and unavailable configuration branches', () => {
        document.body.innerHTML = '<div id="conversation-container"></div>';
        const container = document.getElementById('conversation-container');
        window.LANG = 'es';

        const component = ensureConversationComponent({
            container,
            config: {
                available: true,
                enabled: false,
                role: 'instructor',
                questions: ['Q1'],
                surveyUrl: 'https://survey.example',
                surveyIntroText: 'Please answer',
                settingsUrl: 'https://settings.example',
                instructorStartingMessage: 'Instructor hello'
            },
            apiEndpoint: 'https://relia.rhlab.ece.uw.edu/pluto/',
            getContextForMessage: () => ({})
        });

        expect(component.isActive).toBe(true);
        expect(component.questions).toEqual([{ type: 'standard', content: 'Q1' }]);
        expect(component.surveyUrl).toBe('https://survey.example');
        expect(component.surveyIntroText).toBe('Please answer');
        expect(component.settingsUrl).toBe('https://settings.example');
        expect(component.startingMessage).toBe('Instructor hello');
        expect(component.lang).toBe('es');
        expect(component.systemDisclaimer).toContain('Students **cannot**');

        const unavailable = ensureConversationComponent({
            container,
            config: {
                available: false,
                settingsUrl: 'https://settings-2.example'
            },
            apiEndpoint: 'https://relia.rhlab.ece.uw.edu/pluto/',
            getContextForMessage: () => ({})
        });

        expect(unavailable.isActive).toBe(false);
        expect(unavailable.settingsUrl).toBe('https://settings-2.example');
    });

    test('applies enabled instructor disclaimer', () => {
        const container = document.createElement('div');
        const component = ensureConversationComponent({
            container,
            config: {
                available: true,
                enabled: true,
                role: 'instructor'
            },
            apiEndpoint: 'https://relia.rhlab.ece.uw.edu/pluto/',
            getContextForMessage: () => ({})
        });

        expect(component.systemDisclaimer).toBe('Students can see and use this assistant.');
        expect(component.isActive).toBe(true);
    });

    test('applies student disclaimers, language fallback and default removal helper', () => {
        document.body.innerHTML = '<div id="conversation-container"><span>legacy</span></div>';
        const container = document.getElementById('conversation-container');
        window.LANGUAGE = 'pt';

        const component = ensureConversationComponent({
            container,
            config: {
                available: true,
                enabled: true,
                role: 'student'
            },
            apiEndpoint: 'https://relia.rhlab.ece.uw.edu/pluto/',
            getContextForMessage: () => ({})
        });

        expect(component.systemDisclaimer).toContain('viewable by your instructor');
        expect(component.lang).toBe('pt');

        const disabledStudent = ensureConversationComponent({
            container,
            config: {
                available: true,
                enabled: false,
                role: 'student'
            },
            apiEndpoint: 'https://relia.rhlab.ece.uw.edu/pluto/',
            getContextForMessage: () => ({})
        });

        expect(disabledStudent.systemDisclaimer).toBe('');

        removeConversationComponent(container);
        expect(container.innerHTML).toBe('');
        expect(removeConversationComponent(null)).toBeUndefined();
    });

    test('welcome prompt dispatches only once for the same prompt', () => {
        jest.useFakeTimers();
        document.body.innerHTML = '<div id="conversation-container"></div>';
        const container = document.getElementById('conversation-container');

        ensureConversationComponent({
            container,
            config: {
                available: true,
                enabled: true,
                role: 'student',
                welcomePrompt: 'Explain this plot.'
            },
            apiEndpoint: 'https://relia.rhlab.ece.uw.edu/pluto/',
            getContextForMessage: () => ({})
        });

        const component = container.querySelector('lle-conversation');
        const dispatchSpy = jest.spyOn(component, 'dispatchEvent');

        ensureConversationComponent({
            container,
            config: {
                available: true,
                enabled: true,
                role: 'student',
                welcomePrompt: 'Explain this plot.'
            },
            apiEndpoint: 'https://relia.rhlab.ece.uw.edu/pluto/',
            getContextForMessage: () => ({})
        });

        jest.advanceTimersByTime(1000);

        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        jest.useRealTimers();
    });

    test('resolveConversationConfig refreshes through statusUrl when available', async () => {
        const fetchImpl = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                success: true,
                result: {
                    available: true,
                    enabled: true,
                    role: 'student',
                    questions: ['Refreshed']
                }
            })
        });

        const result = await resolveConversationConfig({
            statusUrl: 'https://portal.example/status',
            enabled: false
        }, fetchImpl);

        expect(fetchImpl).toHaveBeenCalledWith('https://portal.example/status', { method: 'GET' });
        expect(result.questions).toEqual(['Refreshed']);
        expect(result.enabled).toBe(true);
    });

    test('resolveConversationConfig preserves original question config when statusUrl omits it', async () => {
        const fetchImpl = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                success: true,
                result: {
                    available: true,
                    enabled: true,
                    role: 'student'
                }
            })
        });

        const result = await resolveConversationConfig({
            statusUrl: 'https://portal.example/status',
            enabled: false,
            questions: ['Configured in LabsLand'],
            welcomePrompt: 'Start here'
        }, fetchImpl);

        expect(result.enabled).toBe(true);
        expect(result.questions).toEqual(['Configured in LabsLand']);
        expect(result.welcomePrompt).toBe('Start here');
    });

    test('resolveConversationConfig falls back to the original config on fetch issues', async () => {
        const config = {
            statusUrl: 'https://portal.example/status',
            enabled: false
        };

        expect(await resolveConversationConfig(null)).toBeNull();
        expect(await resolveConversationConfig({ enabled: true }, jest.fn())).toEqual({ enabled: true });

        expect(await resolveConversationConfig(config, null)).toBe(config);

        const nonOkFetch = jest.fn().mockResolvedValue({
            ok: false
        });
        expect(await resolveConversationConfig(config, nonOkFetch)).toBe(config);

        const failedPayloadFetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                success: false
            })
        });
        expect(await resolveConversationConfig(config, failedPayloadFetch)).toBe(config);

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const throwingFetch = jest.fn().mockRejectedValue(new Error('boom'));
        expect(await resolveConversationConfig(config, throwingFetch)).toBe(config);
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });

    test('resolveConversationApiEndpoint normalizes the current page URL for the widget API contract', () => {
        expect(resolveConversationApiEndpoint('https://relia.rhlab.ece.uw.edu/pluto')).toBe(
            'https://relia.rhlab.ece.uw.edu/pluto/'
        );
        expect(resolveConversationApiEndpoint('https://relia.rhlab.ece.uw.edu/pluto/?foo=1#lab')).toBe(
            'https://relia.rhlab.ece.uw.edu/pluto/'
        );
    });
});
