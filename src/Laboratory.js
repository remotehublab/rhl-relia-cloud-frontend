import React, {useEffect} from 'react';

// for  translations
import i18n, {t} from './i18n';
import { withTranslation } from 'react-i18next';

import { Container } from 'react-bootstrap';


import  { ReliaWidgets} from "./components/blocks/loaderDevelopment";

import $ from 'jquery';


/**
 * Renders the Introduction component.
 *
 * This component will display the lab
 *
 * @returns {JSX.Element} The rendered Introduction component.
 */
function Laboratory({currentSession, setCurrentSession}) {
    useEffect(() => {
        window.API_BASE_URL = "/api/";
        console.log(" im here");
        if (!currentSession.renderingWidgets && (
            currentSession.status === 'fully-assigned'
            || currentSession.status === 'receiver-still-processing'
            || currentSession.status === "transmitter-still-processing")) {
            const widgets = new ReliaWidgets($("#relia-widgets"));
            widgets.start();
            const newSession = {
                            "taskIdentifier": currentSession.taskIdentifier,
                            "status": currentSession.status,
                            "message": currentSession.message,
                            "renderingWidgets": true,
                        }
            setCurrentSession(newSession);
            Object.assign(currentSession, newSession);


        }
    }, []);
    return (
        <Container className={"loader-container"}>
            <div id={"relia-widgets"}> </div>
        </Container>
    );
}

export default withTranslation()(Laboratory);
