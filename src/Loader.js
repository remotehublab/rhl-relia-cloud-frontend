/**
  This React component file defines a set of components and functionality for uploading, selecting,
  and sending gnr files to an SDR device. It consists of the following components:

  - `Uploader`: Handles file upload functionality, allowing users to select files for transmission.
  - `Selector`: Displays a list of uploaded files and provides options to select which files are receivers and transmitters.
  - `Sender`: Hosts a button that initiates the process of sending selected files to the SDR device.
  - `Loader`: The top-level component that manages state, interactions between child components, and file upload and transmission logic.

   Todo:
     = Add missing translations



  Known bugs:
   = because we are using an index to set what file is currently selected in our table in the Selector component,
      when we remove an element it messes up with the current indexing and changes which files are selected
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
    Form
} from 'react-bootstrap';
import './Loader.css';



/**
 * Loader Component
 *
 * @returns {JSX.Element} The rendered Loader component.
 */
function Loader({currentSession, setCurrentSession, setSelectedTab, storedFiles, setStoredFiles}) {
    const [selectedFilesColumnRX, setSelectedFilesColumnRX] = useState([]);
    const [selectedFilesColumnTX, setSelectedFilesColumnTX] = useState([]);
    const [senderComponent, setSenderComponent] = useState(<Container />);

    useEffect(() => {
    if (selectedFilesColumnTX.length > 0 || selectedFilesColumnRX.length > 0) {
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
  }, [selectedFilesColumnTX, selectedFilesColumnRX]);

    /**
     * handleFileChange function is responsible for updating the selectedFiles state
     * when one or more files are chosen using the file input.
     * It checks if any files are selected, updates the state with the chosen files,
     * and adds them to the uploadedFiles state
     * If no files are selected, it logs a message to indicate that no files were selected.
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
            fetch('/files/', {
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
     * @param {number} index - The index of the uploaded file in the array.
     * @param {string} column - The column to which the file should be assigned ('RX' or 'TX').
     */
    const handleSelect = (index, column) => {
        if (column === 'RX') {
            if (selectedFilesColumnRX.includes(storedFiles[index])) {
                setSelectedFilesColumnRX(selectedFilesColumnRX.filter(item => item !== storedFiles[index]));
                Object.assign(selectedFilesColumnRX, selectedFilesColumnRX.filter(item => item !== storedFiles[index]));
            } else {
                setSelectedFilesColumnRX([...selectedFilesColumnRX, storedFiles[index]]);
                Object.assign(selectedFilesColumnRX, [...selectedFilesColumnRX, storedFiles[index]]);

            }

        } else if (column === 'TX') {
            if (selectedFilesColumnTX.includes(storedFiles[index])) {
                setSelectedFilesColumnTX(selectedFilesColumnTX.filter(item => item !== storedFiles[index]));
                Object.assign(selectedFilesColumnTX, selectedFilesColumnTX.filter(item => item !== storedFiles[index]));
            } else {
                setSelectedFilesColumnTX([...selectedFilesColumnTX, storedFiles[index]]);
                Object.assign(selectedFilesColumnTX, [...selectedFilesColumnTX, storedFiles[index]]);
            }
        }

        sendMetaData();
    };

    const handleRemove = (indexToRemove) => {
        fetch('/files/' + storedFiles[indexToRemove], {
                method: 'DELETE'
            })
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                }
            })
            .then((data) => {
                // Update the userData state with the retrieved data
                if (data.success) {
                    console.log("removed file from server");
                    setSelectedFilesColumnRX(selectedFilesColumnRX.filter(item => item !== storedFiles[indexToRemove]))
                    Object.assign(selectedFilesColumnRX, selectedFilesColumnRX.filter(item => item !== storedFiles[indexToRemove]));
                    setSelectedFilesColumnTX(selectedFilesColumnTX.filter(item => item !== storedFiles[indexToRemove]));
                    Object.assign(selectedFilesColumnTX, selectedFilesColumnTX.filter(item => item !== storedFiles[indexToRemove]));
                    setStoredFiles(storedFiles.filter((file, index) => index !== indexToRemove));
                    sendMetaData();
                } else {
                    console.log("failed to remove file");
                }
            });



    };


    const checkStatus = () => {
         fetch('/scheduler/user/tasks/' + currentSession.taskIdentifier, {
                    method: 'GET'
                })
                .then((response) => {
                    if (response.status === 200) {
                        return response.json();
                    }
                })
                .then((data) => {
                    if (data.success) {
                        const newSession = {
                            "taskIdentifier": currentSession.taskIdentifier,
                            "status": data.status,
                            "message": data.message,
                            "renderingWidgets": currentSession.renderingWidgets,
                        }
                        setCurrentSession(newSession);
                        Object.assign(currentSession, newSession);
                        console.log("checked status " + currentSession);

                        // TODO: reorder to be the same as keys.py
                        if (
                            // skip completed
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
            console.log(jsonData);

            fetch('/files/metadata', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonData),
            })
            .then(response => response.json())
            .then(data => {
                console.log("data sent!")
            })
            .catch(error => {
                console.error('Error sending metadata:', error);
            });
        };
    // When clicked on the button below the file list,
    // call the new task method explained above, and redirect the user to the “Laboratory” tab.
    const manageTask = () => {

        fetch('/user/tasks/' ,{
                    method: 'POST'
                })
                .then((response) => {
                    if (response.status === 200) {
                        return response.json();
                    }
                })
                .then((data) => {
                    if (data.success) {

                        const newSession = {
                            "taskIdentifier": data.taskIdentifier,
                            "status": data.status,
                            "message": data.message,
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
                    <Col xs={7} md={5} className={"file-name-col"}>
                      File Name
                    </Col>
                    <Col xs={2} md={3} className={"radio-col"}>
                      Tx
                    </Col>
                    <Col xs={2} md={3} className={"radio-col"}>
                      Rx
                    </Col>
                    <Col xs={1}  className={"remove-col"}>
                      Delete
                    </Col>
                  </Row>
                    {storedFiles.map((fileName, index)=> (
                  <Row key={index}>
                    <Col xs={7} md={5} className={"file-col"}>
                      <span  className={"file-name-col"}>
                        {fileName}
                      </span>
                    </Col>
                    <Col xs={2} md={3} className={"radio-col"}>
                      <Form.Check
                        name="receiver"
                        onChange={() => handleSelect(index, 'TX')}
                      />
                    </Col>
                    <Col xs={2} md={3} className={"radio-col"}>
                      <Form.Check
                        name="transmitter"
                        onChange={() => handleSelect(index, 'RX')}
                      />
                    </Col>
                    <Col xs={1}  className={"remove-col"}>
                      <Button variant="danger" size="sm" onClick={() => handleRemove(index)}><i className="bi bi-x-lg"></i></Button>
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