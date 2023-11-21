import React from 'react';

// for  translations
import i18n, {t} from './i18n';
import { withTranslation } from 'react-i18next';

import { Container, Col  } from 'react-bootstrap';

/**
 * Renders the Introduction component.
 *
 * This component displays introductory text that explain how to use the lab
 * Currently placeholder
 *
 * @returns {JSX.Element} The rendered Introduction component.
 */
function Introduction() {
    // https://docs.google.com/document/d/16H62F51Ynf_HsBIZ2qxP61v17Bd0wKZkbd78jplX0Lo/edit
    return (
        <Container className={"introduction-container"}>
            <Col md={{span: 6, offset: 3}}>
                {'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of getset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ips'}
            </Col>
        </Container>
    );
}

export default withTranslation()(Introduction);
