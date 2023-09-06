/**
  This code works as an outer layer for the Relia frontend page,
  enabling users to switch from the different segments of the lab

  Components:
  - Introduction: Displays introductory content.
  - Loader:       Enables user to upload their GRC files
  - Laboratory:   Displays output of the sent GRC files
  - Outerloader: Manages tab navigation and content rendering based on the selected tab.

  Todo:
    = eventually separate Introduction and Laboratory into their on files
    = add a footer
    = add a real clock and go back button
    = make it more responsive
    = make top images smaller ( should not be hard but I can't figure it out)

*/

import React, { useState } from 'react';

// for  translations
import i18n, {t} from './i18n';
import { withTranslation } from 'react-i18next';

//for design
import { Container, Row, Col, Button, Form, InputGroup, Image, Nav  } from 'react-bootstrap';
import './Loader.css';
import Loader from "./Loader";

//images
import LabsLand_logo from './components/images/LabsLand-logo.png';
import UW_logo from './components/images/uw-logo.gif';
import RHL_logo from './components/images/RHL-logo.png';


/**
 * Renders the Introduction component.
 *
 * This component displays introductory text that explain how to use the lab
 * Currently placeholder
 *
 * @returns {JSX.Element} The rendered Introduction component.
 */
function Introduction() {
    return (
        <Container className={"introduction-container"}>
            <Col md={{span: 6, offset: 3}}>
                {'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ips'}
            </Col>
        </Container>
    );
}

/**
 * Renders the Introduction component.
 *
 * This component will display the lab
 *
 * @returns {JSX.Element} The rendered Introduction component.
 */
function Laboratory() {
    return (
        <Container className={"loader-container"}>
        </Container>
    );
}


/**
 * Renders the Outerloader component.
 *
 * Displays the outer components of the webpage (timer, links, info, images, etc.)
 * This component also manages tab navigation and content rendering based on the selected tab.
 *
 * State:
 *  selectedTab: currently selected tab of the lab
 * @returns {JSX.Element} The rendered Outerloader component.
 */
function Outerloader() {
    const [selectedTab, setSelectedTab] = useState('introduction');

    /**
     * Renders content based on the selected tab.
     *
     * This function is responsible for determining which component to render based on the value of the `selectedTab` state.
     *
     * @returns {JSX.Element | null} The rendered content for the selected tab as a JSX element, or null if no tab matches.
     * */
    const renderContent = () => {
        switch (selectedTab) {
          case 'introduction':
            return <Introduction />;
          case 'loadFiles':
            return <Loader />;
          case 'laboratory':
            return <Laboratory />;
          default:
            return null;
        }
  };

    return (
      <Container className={"outer-container"}>
        <Row  className={"images-container"}>
            <Col className={"image-col"}>
                <Image src={UW_logo} fluid  className={"image"}/>
            </Col>
            <Col className={"image-col"}>
                 <Image src={RHL_logo} fluid className={"image"}/>
            </Col>
            <Col className={"image-col"}>
                <Image src={LabsLand_logo} fluid className={"image"}/>
            </Col>
        </Row>
        <Row >
            <Col>
                <Row>
                    <Col  className={"button-container"}>
                        <Button>Go back</Button>
                    </Col>
                </Row>
            </Col>
            <Col className={"header-container"}>
                <h1 className={"relia-title"}>SDR Lab (RELIA)</h1>
            </Col>
            <Col>
            </Col>
        </Row>
        <Row  >
            <Col className={"pills-container"}>
                <Nav variant="pills" defaultActiveKey="1. Introduction">
                  <Nav.Item >
                    <Nav.Link   eventKey="1. Introduction" onClick={() => setSelectedTab('introduction')}>1. Introduction</Nav.Link>
                  </Nav.Item >
                  <Nav.Item>
                    <Nav.Link  eventKey="2. Load Files" onClick={() => setSelectedTab('loadFiles')}>2. Load Files</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link  eventKey="3. Laboratory" onClick={() => setSelectedTab('laboratory')}>3. Laboratory</Nav.Link>
                  </Nav.Item>
                </Nav>
            </Col>
        </Row>
        <Row >
            <Col >
              {renderContent()}
            </Col>
        </Row>
      </Container>
  );
}
export default withTranslation()(Outerloader);
