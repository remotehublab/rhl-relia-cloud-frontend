/**
  This code works as an outer layer for the Relia frontend page,
  enabling users to switch from the different segments of the lab
*/
import React, {
    useEffect,
    useRef,
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
    Image,
    Nav
} from 'react-bootstrap';
import './Loader.css';
import Loader from "./Loader";
import Laboratory from "./Laboratory";
import Introduction from "./Introduction";
import { ensureConversationComponent, removeConversationComponent, buildDefaultQuestions, resolveConversationConfig } from './conversations/reliaConversation';
import { buildReliaConversationContext } from './conversations/reliaConversationContext';

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
    const [chartLibraryStatus, setChartLibraryStatus] = useState('loading');
    const [conversationConfig, setConversationConfig] = useState(null);

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
        "assignedInstance": null,
        "assignedInstanceName": "",
        "receiverFilename": null,
        "transmitterFilename": null,
        "cameraUrl": null,
        "renderingWidgets": false,
    });

    const [selectedFilesColumnRX, setSelectedFilesColumnRX] = useState([]);
    const [selectedFilesColumnTX, setSelectedFilesColumnTX] = useState([]);

    const currentSessionRef = useRef(currentSession);
    const reliaWidgetsRef = useRef(reliaWidgets);
    const selectedTabRef = useRef(selectedTab);

    currentSessionRef.current = currentSession;
    reliaWidgetsRef.current = reliaWidgets;
    selectedTabRef.current = selectedTab;



    const [fileStatus, setFileStatus] = useState(<a href="https://rhlab.ece.uw.edu/projects/relia/" target="_blank" rel="noopener noreferrer">
            Upload GNU radio files to proceed
        </a>);

    // Set a global variable for the base API URL.
    window.API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/`;

    useEffect(() => {
        let cancelled = false;
        let timeoutId = null;

        const markReady = () => {
            if (!cancelled) {
                setChartLibraryStatus('ready');
            }
        };

        const markFailed = () => {
            if (!cancelled) {
                setChartLibraryStatus('failed');
            }
        };

        const loadCharts = () => {
            if (window.google && window.google.visualization) {
                markReady();
                return;
            }

            if (!(window.google && window.google.charts)) {
                markFailed();
                return;
            }

            try {
                window.google.charts.load('current', { 'packages': ['corechart'] });
                window.google.charts.setOnLoadCallback(function () {
                    if (window.google && window.google.visualization) {
                        markReady();
                    } else {
                        markFailed();
                    }
                });
                timeoutId = setTimeout(function () {
                    if (!cancelled && !(window.google && window.google.visualization)) {
                        markFailed();
                    }
                }, 10000);
            } catch (error) {
                console.error('Failed to initialize Google Charts', error);
                markFailed();
            }
        };

        if (window.google && window.google.visualization) {
            markReady();
            return function cleanup() {
                cancelled = true;
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
            };
        }

        const head = document.head;
        let script = document.getElementById('googleChartsScript');
        if (!script) {
            script = document.createElement('script');
            script.src = "https://www.gstatic.com/charts/loader.js";
            script.id = 'googleChartsScript';
            script.onload = loadCharts;
            script.onerror = markFailed;
            head.appendChild(script);
        } else {
            loadCharts();
        }

        return function cleanup() {
            cancelled = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, []);


    // Define a useEffect hook to make the fetch call when the component mounts
    useEffect(() => {
        getUserData();
        // Run for now every 5 minutes
        const intervalId = setInterval(getUserData, 5 *  60 * 1000);
        return function cleanup() {
            clearInterval(intervalId);
        };
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
                                selectedFilesColumnRX={selectedFilesColumnRX} selectedFilesColumnTX={selectedFilesColumnTX} setSelectedFilesColumnTX={setSelectedFilesColumnTX}
                                 fileStatus={fileStatus} setFileStatus={setFileStatus} checkStatus={checkStatus} manageTask={manageTask}/> ;
            case 'laboratory':
                return <Laboratory currentSession={currentSession} setCurrentSession={setCurrentSession} setReliaWidgets={setReliaWidgets} reliaWidgets={reliaWidgets}
                                    fileStatus={fileStatus} setFileStatus={setFileStatus} checkStatus={checkStatus} manageTask={manageTask}
                                    chartLibraryStatus={chartLibraryStatus}/> ;
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
        console.log("CALLED getUserData");
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
            // bug here possibly if data is not returned correctly
            .then((data) => {
                if (!data.success) {
                    if (data.redirect_to)
                        window.location.href = data.redirect_to;
                    else
                        window.location.href = "https://relia.rhlab.ece.uw.edu"
                }

                if (data.locale && data.locale !== i18n.language) {
                    i18n.changeLanguage(data.locale);
                }

                // Update the userData state with the retrieved data
                setUserData(data);

                setConversationConfig(data.conversations || null);
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

    useEffect(() => {
        let cancelled = false;

        const mountConversation = async function () {
            const container = document.getElementById('conversation-container');
            if (!container) {
                return;
            }

            if (!conversationConfig) {
                removeConversationComponent(container);
                return;
            }

            const resolvedConfig = await resolveConversationConfig(conversationConfig);
            if (cancelled) {
                return;
            }

            ensureConversationComponent({
                container,
                config: resolvedConfig,
                apiEndpoint: window.location.href,
                defaultQuestions: buildDefaultQuestions(),
                getContextForMessage: function () {
                    return buildReliaConversationContext({
                        selectedTab: selectedTabRef.current,
                        currentSession: currentSessionRef.current,
                        reliaWidgets: reliaWidgetsRef.current
                    });
                }
            });
        };

        mountConversation();

        return function cleanup() {
            cancelled = true;
        };
    }, [conversationConfig, currentSession, reliaWidgets, selectedTab]);



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
     * Initiates a new task for processing and switches the user to the "Laboratory" tab.
     *
     * This function is responsible for starting a new processing task with the server.
     * It sends a POST request to the '/user/tasks/' endpoint to create a new task.
     * Upon successful creation, the task's details are updated in the current session,
     * and the user interface is redirected to the "Laboratory" tab where the task progress
     * can be monitored. This function is an essential part of the workflow in the SDR (Software Defined Radio)
     * operation setup, where it marks the transition from file selection and setup to the actual
     * processing and observation phase in the "Laboratory" tab.
     *
     * On a successful server response, the current session state is updated with the new task's
     * identifier, status, and message. This function also initiates a status check loop by calling
     * `checkStatus` function, which repeatedly checks the status of the newly created task.
     *
     * Usage:
     * This function is typically called when a user has finished setting up files for transmission
     * and reception and is ready to start the processing task. It represents a key action in the
     * workflow of submitting and monitoring tasks in the application.
     *
    */
    const manageTask = () => {

        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/tasks/` ,{
                    method: 'POST'
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            } else {

             // TODO
            console.log('Failed to fetch: Status ' + response.status);
            setFileStatus(<span>Error sending files, please try again</span>);

        }
        }).then((data) => {
            if (data && data.success) {
                const newSession = {
                    "taskIdentifier": data.taskIdentifier,
                    "status": data.status,
                    "message": data.message,
                    "assignedInstance": null,
                    "assignedInstanceName": t("runner.no-instance-yet"),
                    "transmitterFilename": null,
                    "receiverFilename": null,
                    "cameraUrl": null,
                    "renderingWidgets": currentSession.renderingWidgets,
                }
                setCurrentSession(newSession);
                Object.assign(currentSession, newSession);
                console.log(currentSession);
                setTimeout(checkStatus, 1000 );
                setSelectedTab("laboratory");
            } else {
               if (setFileStatus) {
                setFileStatus(<span>Error sending files, please try again</span>);
                }
                console.error('Failed to create task');
            }
        });
    };

    /**
     * Periodically checks the status of the current user task on the server.
     *
     * This function makes GET requests to the server to retrieve the current status of a task
     * identified by `currentSession.taskIdentifier`. It updates the `currentSession` state with
     * the new status, message, and any additional data received from the server.
     *
     * If the task status is one of the intermediate states (like "queued", "receiver-assigned",
     * "fully-assigned", etc.), the function sets a timeout to call itself again, effectively
     * creating a polling mechanism to regularly check for updates until the task reaches a
     * final state (like "completed" or "deleted").
     *
     * @requires currentSession - The current user session object, which contains the taskIdentifier.
     * @modifies currentSession - Updates the currentSession state with the latest task status and message.
     *
     * Usage:
     * This function is used to continuously monitor the progress of a task related to SDR (Software Defined Radio) operations.
     * It is important for keeping the user interface in sync with the task's progress on the server.
     */
    const checkStatus = () => {
         fetch(`${process.env.REACT_APP_API_BASE_URL}/scheduler/user/tasks/${currentSession.taskIdentifier}`, {
            method: 'GET'
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
        }).then((data) => {
            if (data.success) {
                const newSession = {
                    "taskIdentifier": currentSession.taskIdentifier,
                    "status": data.status,
                    "message": data.message,
                    "assignedInstance": data.assignedInstance,
                    "assignedInstanceName": data.assignedInstance,
                    "transmitterFilename": data.transmitterFilename,
                    "receiverFilename": data.receiverFilename,
                    "cameraUrl": data.cameraUrl,
                    "renderingWidgets": currentSession.renderingWidgets,
                }
                setCurrentSession(newSession);
                Object.assign(currentSession, newSession);
                console.log("checked status " + currentSession);
                if (// skip completed
                    data.status === "queued"
                    //  skip deleted
                    || data.status === "receiver-assigned"
                    || data.status === "fully-assigned"
                    || data.status === 'receiver-still-processing'
                    || data.status === "transmitter-still-processing"
                    || data.status === 'receiver-assigned' ) {
                    setTimeout(checkStatus, 1000 );
                }
            } else {
                console.error('Failed to check status:', data.message);
            }
        });
     };
        /**
         * Fetches and displays the library of files for the user.
         *
         * This function makes an HTTP GET request to the '/files/' endpoint to retrieve a list of files
         * available in the user's library. Upon a successful response, it processes the data to extract
         * and log the files, along with metadata related to 'receiver' and 'transmitter'.
         *
         * Note: This function is primarily used for debugging.
         */

    return (
        <Container>

          <Container className={"outer-container"}>
            <Row  className={"images-container"}>
                <Col className={"image-col"}>
                    <a className={"image-col"} href={"https://ece.uw.edu"} target="_blank" rel="noopener noreferrer"><Image src={UW_logo} fluid  className={"image"}/></a>
                </Col>
                <Col className={"image-col"}>
                    <a className={"image-col"} href={"https://rhlab.ece.uw.edu"} target="_blank" rel="noopener noreferrer"><Image  src={RHL_logo} fluid className={"image"}/></a>

                </Col>
                <Col className={"image-col"}>
                    <a className={"image-col"} href={"https://labsland.com"} target="_blank" rel="noopener noreferrer"><Image src={LabsLand_logo} fluid className={"image"}/></a>
                </Col>
            </Row>
            <Row >
                <Col  className={"button-container"}>
                    <a className={"btn btn-primary"} href={userData.redirect_to}><i className="bi bi-arrow-left"></i>&nbsp;{t("loader.upload.go-back")}</a>
                </Col>
                <Col className={"header-container"}>
                    <h1 className={"relia-title"}>SDR Lab (RELIA) - {process.env.REACT_APP_DEVICE_NAME}</h1>
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

          <div id="conversation-container"></div>
      </Container>
  );
}
export default withTranslation()(Outerloader);
