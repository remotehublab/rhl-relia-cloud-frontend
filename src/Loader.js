/**
  Inner component for the relia webapp, part of the loadFiles tab
   defines a set of components and functionality for uploading, selecting,
   and sending gnr files to the SDR device.
   Todo:
     = Add missing translations
 */

// react stuff
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
    Form
} from 'react-bootstrap';
import './Loader.css';



/**
 * Loader Component
 * @param {Object} currentSession - Holds the data for the current user session
 * @param {Function} setCurrentSession - Function to set the current user session.
 * @param {Function} setSelectedTab - Function to set the selected tab (intro/files/lab).
 * @param {Object[]} storedFiles - Array with the stored files.
 * @param {Function} setStoredFiles - Function to set the stored files.
 * @param {Object[]} selectedFilesColumnRX - Array with the stored files that are selected as RX files.
 * @param {Function} setSelectedFilesColumnRX - Function to set the selected files for the RX array.
 * @param {Object} selectedFilesColumnTX - Array with the stored files that are selected as TX files.
 * @param {Function} setSelectedFilesColumnTX - Function to set the selected files for the TX array.
 *
 * @returns {JSX.Element} The rendered Loader component.
 */
function Loader({
    currentSession,
    setCurrentSession,
    setSelectedTab,
    storedFiles,
    setStoredFiles,
    selectedFilesColumnRX,
    setSelectedFilesColumnRX,
    selectedFilesColumnTX,
    setSelectedFilesColumnTX
}) {


    // inner container that hold the send to device button, implemented separately, so it can be dynamically rendered
    const [senderComponent, setSenderComponent] = useState(<Container />);

    // effect hook that updates the container object  if we ever have more then one file
    useEffect(() => {
    if (selectedFilesColumnTX.length > 0 && selectedFilesColumnRX.length > 0) {
      setSenderComponent(
        <Container className={"sender-container"}>
          <Row>
            <Col md={{ span: 6, offset: 3 }} className={"loader-col"}>
              <Button className={"loader-button"} onClick={() => manageTask()}>
                {t("loader.select.send-to-sdr-devices")}
              </Button>
            </Col>
          </Row>
        </Container>
      );
    } else {
      setSenderComponent(<Container />);
    }
    sendMetaData();
  }, [selectedFilesColumnTX, selectedFilesColumnRX]);

    /**
     * handleFileChange function is responsible for updating the selectedFiles state
     * when one or more files are chosen using the file input.
     * It checks if any files are selected, updates the state with the chosen files,
     * and adds them to the storedFiles state
     * If no files are selected, it logs a message to indicate that no files were selected.
     * It also makes a call to the backend to send the new files to the server
     */
    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            const newUploadedFiles = Array.from(event.target.files);
            const formData = new FormData();
            const files = event.target.files;

            // Add each file to the form data.
            for (let i = 0; i < files.length; i++) {
                formData.append('file-' + i, files[i]);
            }

            // Now, send the formData using Fetch.
            fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/files/`, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    const newFileNames = [];
                    for (const newFile of newUploadedFiles) {
                        // TODO: add check for unique files
                        newFileNames.push(newFile.name);
                    }
                    setStoredFiles([...storedFiles, ...newFileNames]);
                }).catch(error => {
                    console.error('Error uploading files:', error);
                });

        } else {
            // Log a message if no files are selected.
            console.log('No files selected.');
        }
    };


    /**
     * Handle the selection of receivers (RX) and transmitters (TX) for an uploaded file.
     *
     * @param {string} column - The type of the file (RX/TX).
     * @param {string} fileName - name of the file
     */
    const handleSelect = ( column, fileName) => {
        if (column === 'RX') {
            if (selectedFilesColumnRX.includes(fileName)) {
                const newColumnRX = selectedFilesColumnRX.filter(file => file !== fileName);
                setSelectedFilesColumnRX(newColumnRX);
            } else {
                setSelectedFilesColumnRX([...selectedFilesColumnRX, fileName]);
            }
        } else if (column === 'TX') {
            if (selectedFilesColumnTX.includes(fileName)) {
                setSelectedFilesColumnTX(selectedFilesColumnTX.filter(file => file !== fileName));
            } else {
                setSelectedFilesColumnTX([...selectedFilesColumnTX, fileName]);
            }
        } else {
            console.log(column + " is not a valid column");
        }

    };

    /**
     * Removes a selected file from both the server and the client-side state.
     *
     * This function sends a DELETE request to the server for the specified file.
     * Upon successful deletion from the server, it updates the client-side state to reflect
     * the removal. This includes removing the file from the lists of selected files for
     * both RX (receiver) and TX (transmitter) and from the overall stored files.
     *
     * @param {string} fileName - The name of the file to be removed.
     *
     * Usage:
     * This function is triggered when the delete button next to a file is clicked.
     * It is crucial for maintaining the synchronization between the server's and client's
     * perception of which files are available and selected for the operations of the SDR (Software Defined Radio) device.
     *
     */
    const handleRemove = (fileName) => {
        // update backend
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/files/${fileName}`, {
                method: 'DELETE'
        }).then((response) => {
            if (response.status === 200) {
                return response.json();
            }
        }).then((data) => {
            // Update the userData state with the retrieved data
            if (data.success) {
                console.log("removed file from server");
                setSelectedFilesColumnRX(selectedFilesColumnRX.filter(file => file !== fileName));
                setSelectedFilesColumnTX(selectedFilesColumnTX.filter(file => file !== fileName));
                setStoredFiles(storedFiles.filter(file => file !== fileName));
            } else {
                console.log("failed to remove file");
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
     * Sends metadata about selected transmitter and receiver files to the server.
     *
     * This function gathers the names of the files selected as transmitters (TX) and receivers (RX),
     * and sends this information as JSON data to the server. It's part of the process of setting up
     * tasks for SDR (Software Defined Radio) operations, where the server needs to know which files
     * are intended for transmission and which for reception.
     *
     * The function iterates over `selectedFilesColumnRX` and `selectedFilesColumnTX` arrays,
     * populating `receiverFileNames` and `transmitterFileNames` respectively. These arrays are then
     * used to form a JSON object which is sent to the server via a POST request to the '/files/metadata' endpoint.
     *
     * @requires selectedFilesColumnRX - Array of file names selected as receivers (RX).
     * @requires selectedFilesColumnTX - Array of file names selected as transmitters (TX).
     *
     */
     const sendMetaData = () => {
            const receiverFileNames = [];
            const transmitterFileNames = [];

            selectedFilesColumnRX.forEach(function(file) {
                receiverFileNames.push(file);
            });

            selectedFilesColumnTX.forEach(function(file) {
                transmitterFileNames.push(file);
            });

            const jsonData = {
                receiver: receiverFileNames,
                transmitter: transmitterFileNames,
            };

            fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/files/metadata/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData),
            }).then(response => response.json()).then(data => {
                console.log("data sent! (" + jsonData +")");
            }).catch(error => {
                console.error('Error sending metadata:', error);
            });
        };

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
            }
        }).then((data) => {
            if (data.success) {
                const newSession = {
                    "taskIdentifier": data.taskIdentifier,
                    "status": data.status,
                    "message": data.message,
                    "assignedInstance": null,
                    "assignedInstanceName": t("runner.no-instance-yet"),
                    "renderingWidgets": currentSession.renderingWidgets,
                }
                setCurrentSession(newSession);
                Object.assign(currentSession, newSession);
                console.log(currentSession);
                setTimeout(checkStatus, 1000 );
                setSelectedTab("laboratory");
            } else {
                console.error('Failed to create task:', data.message);
            }
        });
    };


    return (
      <Container>
        <Col md={{span: 8, offset: 2}}>
          <Row>
            <Col>
              <Container>
                  <Row>
                    <Col md={{span: 6, offset: 3}} className={"form-col"}>
                      <Form.Control type="file" accept=".grc" onChange={handleFileChange}  multiple />
                    </Col>
                  </Row>
              </Container>
            </Col>
          </Row>
          <Row>
            <Col>
              <Container>
                  <Row>
                    <Col xs={7} md={5} className={"file-name-col fw-bold"}>
                        {t("loader.upload.file-name")}
                    </Col>
                    <Col xs={2} md={3} className={"radio-col fw-bold"}>
                      Rx
                    </Col>
                    <Col xs={2} md={3} className={"radio-col fw-bold"}>
                      Tx
                    </Col>
                    <Col xs={1}  className={"remove-col fw-bold"}>
                      {t("loader.upload.delete")}
                    </Col>
                  </Row>
                    {storedFiles.map((fileName)=> (
                  <Row key={fileName}>
                    <Col xs={7} md={5} className={"file-col"}>
                      <span  className={"file-name-col"}>
                        {fileName}
                      </span>
                    </Col>
                    <Col xs={2} md={3} className={"radio-col"}>
                      <Form.Check
                        name="receiver"
                        onChange={() => handleSelect('RX',fileName)}
                        checked={selectedFilesColumnRX.includes(fileName)}
                      />
                    </Col>
                    <Col xs={2} md={3} className={"radio-col"}>
                      <Form.Check
                        name="transmitter"
                        onChange={() => handleSelect('TX', fileName)}
                        checked={selectedFilesColumnTX.includes(fileName)}
                      />
                    </Col>
                    <Col xs={1}  className={"remove-col"}>
                      <Button variant="danger" size="sm" onClick={() => handleRemove(fileName)}><i className="bi bi-x-lg"></i></Button>
                    </Col>
                  </Row>
                ))}
              </Container>
            </Col>
          </Row>
          <Row>
            <Col>
                {senderComponent}
            </Col>
          </Row>
        </Col>
      </Container>
  );
}

export default withTranslation()(Loader);
