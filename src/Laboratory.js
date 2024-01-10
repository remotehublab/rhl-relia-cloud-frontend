import React, {useEffect, useRef} from 'react';

// for  translations
import i18n, {t} from './i18n';
import { withTranslation } from 'react-i18next';

import { Container, Row, Col } from 'react-bootstrap';

import  { ReliaWidgets} from "./components/blocks/loaderDevelopment";
import $ from 'jquery';


/**
 * Renders the Introduction component.
 *
 * This component will display the lab
 *
 * @returns {JSX.Element} The rendered Introduction component.
 */
function Laboratory({currentSession, setCurrentSession, reliaWidgets, setReliaWidgets}) {

    // function formatString(input) {
    //     return input
    //         .split('-') // Split the string by hyphens
    //         .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    //         .join(' '); // Join the words back into a string with spaces
    // }
    function convertStatusMessage(status) {
        switch (status) {
            case 'error':
                return "runner.messages.there-was-an-error-running-your-gnu-radio-code";
            case 'stopped':
                return "runner.messages.your-gnu-radio-code-has-stopped";
            case 'deleted':
                return "runner.messages.your-gnu-radio-code-is-not-running-anymore-feel-free-to-run-it-again";
            case 'receiver-assigned':
                return "runner.messages.remote-set-up-assigned-waiting-to-start-running-your-gnu-radio-code";
            case 'fully-assigned':
                return "runner.messages.your-gnu-radio-code-is-now-running-in-both-remote-devices";
            case 'receiver-still-processing':
                return "runner.messages.the-remote-set-up-is-processing-your-GNU-Radio-in-the-receiver-device";
            case 'transmitter-still-processing':
                return "runner.messages.the-remote-set-up-is-processing-your-GNU-Radio-in-the-transmitter-device";
            case 'starting':
                return "runner.messages.starting-to-run-again-your-gnu-radio-code";
            case 'stopping':
                return "runner.messages.stopping";
            case 'queued':
                return "runner.messages.waiting-for-a-remote-set-up-to-be-available";
            case 'processing':
                return "runner.messages.your-gnu-radio-files-are-being-processed-please-wait";
            case 'completed':
                return "runner.messages.your-gnu-radio-code-is-not-running-anymore-feel-free-to-run-it-again";
            default:
                return "Status not recognized";
        }
    }

    const currentSessionRef = useRef(currentSession);
    currentSessionRef.current = currentSession;

    useEffect(() => {
        console.log("Calling useEffect in Laboratory");
        console.log(reliaWidgets);
        if (reliaWidgets !== null)
            reliaWidgets.stop();

        const newReliaWidgets = new ReliaWidgets($("#relia-widgets"), currentSession.taskIdentifier, currentSessionRef);
        newReliaWidgets.start();
        setReliaWidgets(newReliaWidgets);

        return () => {
            newReliaWidgets.stop();
            newReliaWidgets.clean();
        }
    }, []);

    useEffect(() => {
        if (currentSession.status == "completed" || currentSession.status == "error" || currentSession.status == "deleted") {
            if (reliaWidgets !== null)
                reliaWidgets.stop();
        }
    }, [ currentSession ]);

    // The receiver is always on the left!
    return (
        <Container className={"laboratory-container text-center"}>
            <Row >
                <Col className={"laboratory-status-message"} md={{ span: 10, offset: 1 }}> 
                    {t(convertStatusMessage(currentSession.status))}
                    <br /><br />
                    <span>{t("runner.assigned-instance")}: <a target="_blank" href="{ currentSession.cameraUrl || '#'}">{currentSession.assignedInstanceName}</a></span>
                </Col>
            </Row>
            <Row id={"relia-widgets"}> 
                <Col style={{ display: currentSession.assignedInstance != null ? 'block' : 'none' }} >
                    <center>
                        <h2>{ t("runner.receiver") }</h2>
                        { currentSession.receiverFilename != null && <h4>({ currentSession.receiverFilename })</h4> }
                    </center>
                    
                    <div id={"relia-widgets-receiver"}></div>
                </Col>
                <Col style={{ display: currentSession.assignedInstance != null ? 'block' : 'none' }} >
                    <center>
                        <h2>{ t("runner.transmitter") }</h2>
                        { currentSession.transmitterFilename != null && <h4>({ currentSession.transmitterFilename })</h4> }
                    </center>
                    
                    <div id={"relia-widgets-transmitter"}></div>
                </Col>
            </Row>
        </Container>
    );
}

export default withTranslation()(Laboratory);
