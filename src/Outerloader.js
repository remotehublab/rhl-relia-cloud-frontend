/**
  This code works as an outer layer for the Relia frontend page,
  enabling users to switch from the different segments of the lab
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
 *   The {@code Outerloader} component acts as the main interface for the Relia educational lab environment.
 *   It offers navigational controls to switch between various segments of the lab such as Introduction, File Loading,
 *   and Laboratory. This component is responsible for managing user sessions, handling file uploads,
 *   and rendering content dynamically based on the user's interaction and current state.
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

    const [currentSession, setCurrentSession] = useState({
        "taskIdentifier": null,
        "status": "not_started",
        "message": "",
        "renderingWidgets": false,
    });

    const [selectedFilesColumnRX, setSelectedFilesColumnRX] = useState([]);
    const [selectedFilesColumnTX, setSelectedFilesColumnTX] = useState([]);

    // Set a global variable for the base API URL.
    window.API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/`;

    // Using useEffect to execute code after the component mounts.
    useEffect(() => {
      // Accessing the document's head element.
      const head = document.head;

      // Check if the Google Charts script is already loaded.
      let script = document.getElementById('googleChartsScript');
      if (!script) {
        // If the script isn't loaded, create a new script element.
        script = document.createElement('script');
        // Set the source of the script to load Google Charts.
        script.src = "https://www.gstatic.com/charts/loader.js";
        // Assign an ID to the script for future reference.
        script.id = 'googleChartsScript';

        // Define what happens once the script is loaded.
        script.onload = () => {
          // Check if the Google Charts library is available.
          if (window.google && window.google.charts) {
            // Load the 'corechart' package from Google Charts.
            window.google.charts.load('current', { 'packages': ['corechart'] });
          }
        };

        // Append the script element to the document's head.
        head.appendChild(script);
        // console.log(process.env.REACT_APP_API_BASE_URL);
      }
    }, []); // The empty dependency array ensures this effect runs once after initial render.


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
            || currentSession.status === "transmitter-still-processing")) {
                cancelTask();
                if (reliaWidgets != null) {
                    reliaWidgets.stop();
                }
        }
    }, [selectedTab]);

    /**
     * Renders the appropriate content based on the current tab selection.
     *
     * This function determines which component to display in the UI based on the current value
     * of the 'selectedTab' state.
     *
     * @returns {JSX.Element | null} - The content to be rendered for the selected tab. Returns a JSX
     *                                 Element corresponding to the selected tab ('introduction',
     *                                 'loadFiles', or 'laboratory'). Returns null if no tab matches.
     */
    const renderContent = () => {
        switch (selectedTab) {
            case 'introduction':
                return <Introduction currentSession={currentSession} setCurrentSession={setCurrentSession}/> ;
            case 'loadFiles':
                return <Loader currentSession={currentSession} setCurrentSession={setCurrentSession} setSelectedTab={setSelectedTab}
                               storedFiles={storedFiles} setStoredFiles={setStoredFiles} setSelectedFilesColumnRX={setSelectedFilesColumnRX}
                                selectedFilesColumnRX={selectedFilesColumnRX} selectedFilesColumnTX={selectedFilesColumnTX} setSelectedFilesColumnTX={setSelectedFilesColumnTX}/>;
            case 'laboratory':
                return <Laboratory currentSession={currentSession} setCurrentSession={setCurrentSession} setReliaWidgets={setReliaWidgets} reliaWidgets={reliaWidgets}/> ;
            default:
                return null;
        }
    };

    /**
     * Fetches and updates user-specific data and stored files information.
     *
     * This function performs two primary tasks:
     * 1. It makes an HTTP GET request to the '/user/poll' endpoint to retrieve current user data,
     *    such as locale, redirection URL, session ID, and user ID. This data is then used to update
     *    the component's state.
     * 2. It makes a second GET request to the '/files/' endpoint to fetch a list of files stored
     *    for the current user session. It updates the component's state with the list of files,
     *    and extracts receiver and transmitter-specific files to manage their respective states.
     */
    const getUserData = () => {
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/poll`, {
                method: 'GET'
            })
            .then((response) => {
                if (response.ok) {  // Check if response is ok
                    return response.json();
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then((data) => {
                if (data.locale && data.locale != i18n.language) {
                    i18n.changeLanguage(data.locale);
                }
                
                // Update the userData state with the retrieved data
                setUserData(data);
            })
            .catch((error) => {
                console.error('Fetch error:', error.message);
            });

            fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/files/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then(data => {
                if (data.success) {
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
            })
            .catch(error => {
                console.error('Error:', error.message);
            });
        }



    /**
     * Cancels the current lab task based on the task identifier.
     *
     * This function is responsible for sending a POST request to the '/scheduler/user/tasks/{taskIdentifier}'
     * endpoint with the action 'delete' to cancel the task that is currently associated with the user's session.
     * It is typically invoked when a change in the user's interaction flow necessitates the cancellation of
     * an ongoing or queued task in the lab environment.
     *
     * After the cancellation request is successfully processed, the function retrieves updated user data
     * and potentially updates the UI or internal state to reflect the cancellation.
     *
     */
    const cancelTask = () => {
        const jsonData = {
            action: "delete",
        };

        fetch(`${process.env.REACT_APP_API_BASE_URL}/scheduler/user/tasks/${currentSession.taskIdentifier}`, {
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

        /**
         * Fetches and displays the library of files for the user.
         *
         * This function makes an HTTP GET request to the '/files/' endpoint to retrieve a list of files
         * available in the user's library. Upon a successful response, it processes the data to extract
         * and log the files, along with metadata related to 'receiver' and 'transmitter'.
         *
         * Note: This function is primarily used for debugging.
         */

        const showLibrary = () => {
        // Make a GET request to '/files/' to fetch the list of files
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/files/`, {
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
                    <a className={"btn btn-primary"} href={userData.redirect_to}><i className="bi bi-arrow-left"></i>&nbsp;{t("loader.upload.go-back")}</a>
                </Col>
                <Col className={"header-container"}>
                    <h1 className={"relia-title"}>SDR Lab (RELIA) - {process.env.DEVICE_NAME}</h1>
                </Col>
                <Col className={"button-container"} >
                     {/*<a onClick={() => showLibrary()} className={"btn btn-primary"}>Show Library</a>*/}
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
