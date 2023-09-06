import React, { useState } from 'react';

// for  translations
import i18n, {t} from './i18n';
import { withTranslation } from 'react-i18next';

//for design
import { Container, Row, Col, Button, Form, InputGroup, Image, Nav  } from 'react-bootstrap';
import './Loader.css';
import Loader from "./Loader";

//images
import LabsLand_logo from './components/images/LabsLand_logo.png';
import Background_logo from './components/images/Background.png';
import UW_logo from './components/images/uw_logo.png';
import RHL_logo from './components/images/RHL_logo.png';
import Clock from './components/images/clock.png';


function Introduction() {
    return (
        <Container>
            <Col md={{span: 6, offset: 3}}>
                {'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ips'}
            </Col>
        </Container>
    );
}

function Laboratory() {
    return (
        <Container>
        </Container>
    );
}


function Outerloader() {
    const [selectedTab, setSelectedTab] = useState('introduction');
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
            <Col>
                <Image src={UW_logo} fluid  className={"image"}/>
            </Col>
            <Col>
                 <Image src={RHL_logo} fluid />
            </Col>
            <Col>
                <Image src={LabsLand_logo} fluid />
            </Col>
        </Row>
        <Row >
            <Col>
                <Row>
                    <Col md={6} className={"images-container"}>
                        <Image src={Clock} fluid className={"image"}/>
                    </Col>
                    <Col md={6} className={"button-container"}>
                        <Button>Go back</Button>
                    </Col>
                </Row>
            </Col>
            <Col className={"header-container"}>
                <h1 className={"relia-title"}>RELIA</h1>
            </Col>
            <Col>
            </Col>
        </Row>
        <Row  >
            <Col className={"pills-container"}>
                <Nav variant="pills" defaultActiveKey="1. Introduction">
                  <Nav.Item>
                    <Nav.Link  eventKey="1. Introduction" onClick={() => setSelectedTab('introduction')}>Introduction</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="2. Load Files" onClick={() => setSelectedTab('loadFiles')}>Load Files</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="3. Laboratory" onClick={() => setSelectedTab('laboratory')}>Laboratory</Nav.Link>
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


