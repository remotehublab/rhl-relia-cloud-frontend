import React from 'react';

// for  translations
import i18n, {t} from './i18n';
import { withTranslation } from 'react-i18next';

import { Container } from 'react-bootstrap';

/**
 * Renders the Introduction component.
 *
 * This component will display the lab
 *
 * @returns {JSX.Element} The rendered Introduction component.
 */
function Laboratory({currentSession, setCurrentSession}) {
    return (
        <Container className={"loader-container"}>
        </Container>
    );
}

export default withTranslation()(Laboratory);
