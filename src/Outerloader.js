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
      '-> problem is that would require making a new outer container


*/
import React, {
    useEffect,
    useState
} from 'react';

// for  translations
import i18n, {
    t
} from './i18n';
import {
    withTranslation
} from 'react-i18next';

//for design
import {
    Container,
    Row,
    Col,
    Button,
    Image,
    Nav
} from 'react-bootstrap';
import './Loader.css';
import Loader from "./Loader";
import Laboratory from "./Laboratory";
import Introduction from "./Introduction";

//images
import LabsLand_logo from './components/images/LabsLand-logo.png';
import UW_logo from './components/images/uw-logo.gif';
import RHL_logo from './components/images/RHL-logo.png';

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
    const [userData, setUserData] = useState({
        "locale": "en",
        "redirect_to": "",
        "session_id": null,
        "success": null,
        "user_id": null
    });

    const [reliaWidgets, setReliaWidgets] = useState(null);

    const [storedFiles, setStoredFiles] = useState([]);

    // this is the state variable for the status right?
    const [currentSession, setCurrentSession] = useState({
        "taskIdentifier": null,
        "status": "not_started",
        "message": "",
        "renderingWidgets": false,
    });

    const [selectedFilesColumnRX, setSelectedFilesColumnRX] = useState([]);
    const [selectedFilesColumnTX, setSelectedFilesColumnTX] = useState([]);

    window.API_BASE_URL = "/api/";


    useEffect(() => {
      const head = document.head;
      let script = document.getElementById('googleChartsScript');
      if (!script) {
        script = document.createElement('script');
        script.src = "https://www.gstatic.com/charts/loader.js";
        script.id = 'googleChartsScript';
        script.onload = () => {
          if (window.google && window.google.charts) {
            window.google.charts.load('current', { 'packages': ['corechart'] });

          }
        };
        head.appendChild(script);
      }
  }, []);

    // Define a useEffect hook to make the fetch call when the component mounts
    useEffect(() => {
        getUserData();
    }, []);

    useEffect(() => {
        if ((selectedTab === "introduction" || selectedTab === "loadFiles") && (
            // skip completed
            currentSession.status === "queued"
            //  skip deleted
            || currentSession.status === "receiver-assigned"
            || currentSession.status === "fully-assigned"
            || currentSession.status === 'receiver-still-processing'
            || currentSession.status === "transmitter-still-processing"
            || currentSession.status === 'receiver-assigned' )) {
                cancelTask();
        }
    }, [selectedTab]);

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
                if (reliaWidgets != null) {
                    reliaWidgets.stop();
                }
                return <Introduction currentSession={currentSession} setCurrentSession={setCurrentSession}/> ;
            case 'loadFiles':
                if (reliaWidgets != null) {
                    reliaWidgets.stop();
                }
                return <Loader currentSession={currentSession} setCurrentSession={setCurrentSession} setSelectedTab={setSelectedTab}
                               storedFiles={storedFiles} setStoredFiles={setStoredFiles} setSelectedFilesColumnRX={setSelectedFilesColumnRX}
                                selectedFilesColumnRX={selectedFilesColumnRX} selectedFilesColumnTX={selectedFilesColumnTX} setSelectedFilesColumnTX={setSelectedFilesColumnTX}/>;
            case 'laboratory':
                return <Laboratory currentSession={currentSession} setCurrentSession={setCurrentSession} setReliaWidgets={setReliaWidgets} reliaWidgets={reliaWidgets}/> ;
            default:
                return null;
        }
    };

    const getUserData = () => {
        fetch('/user/poll', {
                method: 'GET'
            })
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
            })
            .then((data) => {
                // Update the userData state with the retrieved data
                setUserData(data);
            });

        fetch('/files/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()).then(data => {
            if(data.success) {
                // Access the list of files from the response
                const files = data.files;
                setStoredFiles(files);
                const selectedRXFiles = data.metadata['receiver'];
                setSelectedFilesColumnRX(selectedRXFiles);
                const selectedTXFiles = data.metadata['transmitter'];
                setSelectedFilesColumnTX(selectedTXFiles);
            } else {
                console.error('Error fetching files:', data.message);
            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }
    const cancelTask = () => {
    const jsonData = {
        action: "delete",
    };

    fetch('/scheduler/user/tasks/' + currentSession.taskIdentifier, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Task cancellation successful', data);
        getUserData();
        // Additional logic here if needed, e.g., updating state or UI
    })
    .catch(error => {
        console.error('Error canceling task', error);
    });
}
    const showLibrary = () => {
        // Make a GET request to '/files/' to fetch the list of files
        fetch('/files/', {
                method: 'GET'
            })
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
            })
            .then((data) => {
                if (data.success) {

                    const {
                        files,
                        metadata
                    } = data;
                    console.log(files);
                    console.log(metadata);
                    console.log('Current receiver:', metadata['receiver']);

                    // Show files from metadata['transmitter']
                    console.log('Current trasmitter:', metadata['transmitter']);

                    // Print every file in the files array
                    files.forEach((file) => {
                        console.log('File:', file);
                    });

                } else {

                    console.error('Failed to fetch files:', data.message);
                }
            });
    };

    return (
        <Container>

          <Container className={"outer-container"}>
            <Row  className={"images-container"}>
                <Col className={"image-col"}>
                    <a className={"image-col"} href={"https://ece.uw.edu"} target="_blank"><Image src={UW_logo} fluid  className={"image"}/></a>
                </Col>
                <Col className={"image-col"}>
                    <a className={"image-col"} href={"https://rhlab.ece.uw.edu"} target="_blank"><Image  src={RHL_logo} fluid className={"image"}/></a>

                </Col>
                <Col className={"image-col"}>
                    <a className={"image-col"} href={"https://labsland.com"} target="_blank"><Image src={LabsLand_logo} fluid className={"image"}/></a>
                </Col>
            </Row>
            <Row >
                <Col  className={"button-container"}>
                    <a className={"btn btn-primary"} href={userData.redirect_to}>{t("loader.upload.go-back")}</a>
                </Col>
                <Col className={"header-container"}>
                    <h1 className={"relia-title"}>SDR Lab (RELIA)</h1>
                </Col>
                <Col className={"button-container"} >
                     <a onClick={() => showLibrary()} className={"btn btn-primary"}>Show Library></a>
                </Col>
            </Row>
            <Row  >
                <Col className={"pills-container"} md={{span: 6, offset: 3}} >
                    <Nav variant="pills" defaultActiveKey="introduction" activeKey={selectedTab}>
                        <Nav.Item>
                            <Nav.Link eventKey="introduction" onClick={() => setSelectedTab('introduction')} className={"pill"}>
                                1. { t("loader.upload.introduction") }
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="loadFiles" onClick={() => setSelectedTab('loadFiles')} className={"pill"}>
                                2. {t("loader.upload.load-files")}
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            {/* Laboratory tab is disabled and cannot be clicked. It can only be activated programmatically */}
                            <Nav.Link eventKey="laboratory" disabled className={"pill"}>
                                3. {t("loader.upload.laboratory")}
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Col>
                <Col>
                     {"Current Task Status: " + currentSession.status}
                </Col>
            </Row>
            <Row >
                <Col >
                  {renderContent()}
                </Col>
            </Row>
          </Container>
      </Container>
  );
}
export default withTranslation()(Outerloader);
