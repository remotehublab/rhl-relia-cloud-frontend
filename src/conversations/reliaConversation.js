export const RELIA_DIST_ELEMENTS_MARKER = 'll-widgets-ng-dist-elements';

export function buildDefaultQuestions() {
    return [
        {
            type: 'standard',
            content: 'What can this assistant do?'
        },
        {
            type: 'standard',
            content: 'How can I interact with it?'
        }
    ];
}

function buildQuestionObjects(questions) {
    if (!Array.isArray(questions)) {
        return null;
    }

    return questions.map((question) => ({
        type: 'standard',
        content: question
    }));
}

function dispatchWelcomePrompt(component, prompt) {
    if (!prompt || component.dataset.lastWelcomePrompt === prompt) {
        return;
    }

    component.dataset.lastWelcomePrompt = prompt;
    setTimeout(function () {
        const event = new CustomEvent('newPromptMessage', {
            detail: {
                content: prompt
            },
            bubbles: true,
            composed: true
        });
        component.dispatchEvent(event);
    }, 1000);
}

export async function resolveConversationConfig(config, fetchImpl = window.fetch) {
    if (!config || !config.statusUrl || typeof fetchImpl !== 'function') {
        return config;
    }

    try {
        const response = await fetchImpl(config.statusUrl, {
            method: 'GET'
        });
        if (!response.ok) {
            return config;
        }

        const payload = await response.json();
        if (payload && payload.success && payload.result) {
            return {
                ...config,
                ...payload.result
            };
        }
    } catch (error) {
        console.error('Failed to refresh conversation config', error);
    }

    return config;
}

export function resolveConversationApiEndpoint(locationHref = window.location.href) {
    try {
        const url = new URL(locationHref, window.location.origin);
        url.search = '';
        url.hash = '';
        if (!url.pathname.endsWith('/')) {
            url.pathname = `${url.pathname}/`;
        }
        return url.href;
    } catch (error) {
        if (typeof locationHref !== 'string' || !locationHref) {
            return locationHref;
        }
        return locationHref.endsWith('/') ? locationHref : `${locationHref}/`;
    }
}

export function removeConversationComponent(container) {
    if (container) {
        container.innerHTML = '';
    }
}

export function ensureConversationComponent({
    container,
    config,
    apiEndpoint,
    getContextForMessage,
    defaultQuestions
}) {
    if (!container || !config) {
        return null;
    }

    let conversationComponent = container.querySelector('lle-conversation');
    if (!conversationComponent) {
        conversationComponent = document.createElement('lle-conversation');
        container.appendChild(conversationComponent);
    }

    conversationComponent.context = getContextForMessage ? getContextForMessage(null) : {};
    conversationComponent.getContextForMessage = getContextForMessage;
    conversationComponent.apiEndpoint = apiEndpoint;
    conversationComponent.canExpand = true;
    conversationComponent.testMode = false;
    conversationComponent.questions = defaultQuestions || buildDefaultQuestions();

    if (config.available) {
        if (config.role === 'instructor') {
            conversationComponent.isActive = true;
        } else {
            conversationComponent.isActive = !!config.enabled;
        }

        conversationComponent.allowFullTextMessages = !!config.allowFullTextMessages;

        const questions = buildQuestionObjects(config.questions);
        if (questions) {
            conversationComponent.questions = questions;
        }

        if (config.enabled) {
            if (config.role === 'instructor') {
                conversationComponent.systemDisclaimer = "Students can see and use this assistant.";
            } else {
                conversationComponent.systemDisclaimer = "Conversations are being recorded and viewable by your instructor.";
            }
        } else if (config.role === 'instructor') {
            conversationComponent.systemDisclaimer = "Students **cannot** see and use this assistant until you configure it in the AI Assistant settings.";
        } else {
            conversationComponent.systemDisclaimer = '';
        }

        if (config.surveyUrl) {
            conversationComponent.surveyUrl = config.surveyUrl;
        }

        if (window.LANG) {
            conversationComponent.lang = window.LANG;
        } else if (window.LANGUAGE) {
            conversationComponent.lang = window.LANGUAGE;
        }

        if (config.surveyIntroText) {
            conversationComponent.surveyIntroText = config.surveyIntroText;
        }

        if (config.instructorStartingMessage) {
            conversationComponent.startingMessage = config.instructorStartingMessage;
        }

        dispatchWelcomePrompt(conversationComponent, config.welcomePrompt);
    } else {
        conversationComponent.isActive = false;
    }

    if (config.settingsUrl) {
        conversationComponent.settingsUrl = config.settingsUrl;
    }

    return conversationComponent;
}
