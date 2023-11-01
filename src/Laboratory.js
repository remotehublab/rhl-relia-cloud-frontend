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
function Laboratory({currentSession, setCurrentSession, reliaWidgets, setReliaWidgets}) {
    useEffect(() => {
        if (reliaWidgets !== null)
            reliaWidgets.stop();
        
        var newReliaWidgets = new ReliaWidgets($("#relia-widgets"));
        newReliaWidgets.start();
        setReliaWidgets(newReliaWidgets);
    }, []);

    useEffect(() => {
        if (currentSession.status == "completed" || currentSession.status == "error" || currentSession.status == "deleted") {
            if (reliaWidgets !== null)
                reliaWidgets.stop();
        }
    }, [ currentSession ]);

    return (
        <Container className={"loader-container"}>
            <div id={"relia-widgets"}> </div>
        </Container>
    );
}

export default withTranslation()(Laboratory);
