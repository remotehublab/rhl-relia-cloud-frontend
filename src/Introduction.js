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
    // TODO: fill this document, discuss it with 
    // https://docs.google.com/presentation/d/1LkXYqcaKgF1N0DhtzHHImhMU4-TM61e7jvPDsA2jbY4/edit#slide=id.g29df1718c1d_0_4
    return (
        <Container className={"introduction-container"}>
            <Col md={{span: 10, offset: 1}}>
            <p>Welcome to RELIA, the Software-defined Radio (SDR) remote laboratory.</p>
            <p>The steps to use the remote laboratory are:</p>
            <ol>
                <li>In <a href="https://www.gnuradio.org/" target="_blank">GNU Radio</a>, you can build two files, one for a transmitter and one for a receiver. 
                    You can use blocks that are QT widgets (Frequency Sink, Vector Sink, and others), as well as Pluto SDR blocks (PlutoSDR Source and PlutoSDR Sink). You can find an <a href="https://raw.githubusercontent.com/remotehublab/rhl-relia-gr-runner/main/examples/test_tx.grc" target="_blank">example transmitter</a> and an <a href="https://raw.githubusercontent.com/remotehublab/rhl-relia-gr-runner/main/examples/test_rx.grc" target="_blank">example receiver file</a>.</li>
                <li>In the remote laboratory, click on Load files, and upload the two files. Then select which one will run in the transmitter and which one in the receiver. Then click on Send to SDR devices.</li>
                <li>Then, you will be assigned to one of the SDR setups that has both a transmitter and a receiver. You will see them in real-time running your two blocks for a few seconds. You will see the results of the widgets and the camera pointing at them.</li>
            </ol>
            <p>This work was supported by the National Science Foundation's Division of Undergraduate Education under Grant #2141798. All the source code is open-source and can be found <a href="https://github.com/remotehublab" target="_blank">in GitHub</a>.</p>
            </Col>
        </Container>
    );
}

export default withTranslation()(Introduction);
