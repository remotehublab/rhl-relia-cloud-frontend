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
    setSelectedFilesColumnTX,
    manageTask,
    checkStatus,


}) {

    // inner container that hold the send to device button, implemented separately, so it can be dynamically rendered
    const [senderComponent, setSenderComponent] = useState(<Container/>);

    const [fileStatus, setFileStatus] = useState(<a href="https://rhlab.ece.uw.edu/projects/relia/" target="_blank" rel="noopener noreferrer">
            Upload GNU radio files to proceed
        </a>);

    // effect hook that updates the container object  if we ever have more then one file
    useEffect(() => {
    if (selectedFilesColumnTX.length > 0 && selectedFilesColumnRX.length > 0) {
      setSenderComponent(
        <Container className={"sender-container"}>
          <Row>
            <Col md={{ span: 6, offset: 3 }} className={"loader-col"}>
              <Button className={"loader-button"} onClick={() => manageTask(setFileStatus)}>
                {t("loader.select.send-to-sdr-devices")}
              </Button>
            </Col>
          </Row>
        </Container>
      );
      // setFileStatus(<a>Ready to upload</a>);
      setFileStatus(null);
    } else if (selectedFilesColumnTX.length > 0) {
        setFileStatus(<span>Select one RX file to proceed</span>);
        setSenderComponent(<Container/>);
    } else if (selectedFilesColumnRX.length > 0){
        setFileStatus(<span>Select one TX file to proceed</span>);
        setSenderComponent(<Container />);
    } else {
        if (storedFiles.length > 0) {
            setFileStatus(<span>Select one TX file and one RX file to proceed</span>);
        }  else {
            setFileStatus(<span>Upload GNU radio files to proceed</span>);
            //setFileStatus(<span>Upload GNU radio files to proceed. <a href="https://rhlab.ece.uw.edu/projects/relia/" target="_blank" rel="noopener noreferrer">See the docs</a></span>);
        }
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
        // filer non .grc
        const newUploadedFiles = Array.from(event.target.files).filter(file => file.name.toLowerCase().endsWith('.grc'));

        if (newUploadedFiles.length > 0) {
            const formData = new FormData();

            // Add each .grc file to the form data.
            newUploadedFiles.forEach(file => {
                formData.append('file', file);
            });

            setFileStatus(<a>Uploading files, please wait</a>);

            // Now, send the formData using Fetch.
            fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/files/`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                const newFileNames = newUploadedFiles.map(file => file.name);
                setStoredFiles([...storedFiles, ...newFileNames]);
            })
            .catch(error => {
                console.error('Error uploading files:', error);
                setFileStatus(<a>Error uploading files</a>);
            })
            .finally(() => {
                setFileStatus(<a>Please select one RX and one TX file to proceed</a>);
            });
        } else {
            console.log('No .grc files selected.');
        }
    } else {
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
                setSelectedFilesColumnRX([fileName]);
            }
        } else if (column === 'TX') {
            if (selectedFilesColumnTX.includes(fileName)) {
                setSelectedFilesColumnTX(selectedFilesColumnTX.filter(file => file !== fileName));
            } else {
                setSelectedFilesColumnTX([fileName]);
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
              {storedFiles.length != 0  ? (
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
                        type="radio"
                        name="receiver"
                        onChange={() => handleSelect('RX',fileName)}
                        checked={selectedFilesColumnRX.includes(fileName)}
                      />
                    </Col>
                    <Col xs={2} md={3} className={"radio-col"}>
                      <Form.Check
                        type="radio"
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
      ) : (
        <Container></Container>
      )}
        <Container className={"introduction-container"}>
            <Col md={{span: 8, offset: 2}} style={{ display: fileStatus != null ? 'block' : 'none' }}>
               {fileStatus}
            </Col>
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
