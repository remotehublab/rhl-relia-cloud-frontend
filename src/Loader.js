/**
 * This React component file defines a set of components and functionality for uploading, selecting,
 * and sending gnr files to an SDR device. It consists of the following components:
 *
 * - `Uploader`: Handles file upload functionality, allowing users to select files for transmission.
 * - `Selector`: Displays a list of uploaded files and provides options to select which files are receivers and transmitters.
 * - `Sender`: Hosts a button that initiates the process of sending selected files to the SDR device.
 * - `Loader`: The top-level component that manages state, interactions between child components, and file upload and transmission logic.
 */
import React, { useState } from 'react';

/**
 * Uploader Component
 * @param {Array} uploadedFiles - An array of uploaded files.
 * @param {Function} setUploadedFiles - A function to update the uploaded files.
 *
 * @returns {JSX.Element} The rendered Selector component.
 */
function Uploader({ uploadedFiles, setUploadedFiles }) {
  const [selectedFile, setSelectedFile] = useState(null);

  /**
   * handleFileChange function is responsible for updating the selectedFile state when a file is chosen using the file input.
   * It extracts the selected file from the event object and sets it as the new value of the selectedFile state variable,
   * allowing it to be used for further processing, such as file upload.
   */
  const handleFileChange = (event) => {
    // Update the selectedFile state with the chosen file
    setSelectedFile(event.target.files[0]);
  };

  /**
 * handleUpload Function
 *
 * This function handles the file upload logic when the "Uploader" button is clicked. It checks if a file
 * is selected, updates the state with the chosen file
 * If no file is selected, it logs a message to indicate that no file was selected.
 */
const handleUpload = () => {
  if (selectedFile) {
    // Add the selected file to the uploadedFiles state with an initial selectedColumn value of null.
    setUploadedFiles([...uploadedFiles, { file: selectedFile, selectedColumn: null }]);
    console.log('Uploading file:', selectedFile);
    // TODO: Additional file upload logic probably here.
  } else {
    // Log a message if no file is selected.
    console.log('No file selected.');
  }
};

  return (
  <div>
    {/* File input */}
    <input type="file" onChange={handleFileChange} style={{ display: 'block' }} />

    {/* Uploader button, TODO: has some css to display better, might change this to the CSS file */}
    <button onClick={handleUpload} style={{ display: 'block' }}>Upload</button>
  </div>
);
}

/**
 * Selector Component
 *
 * @param {Array} uploadedFiles - An array of uploaded files.
 * @param {Function} handleSelect - A function to handle the selection of receivers and transmitters.
 *
 * @returns {JSX.Element} The rendered Selector component.
 */
function Selector({ uploadedFiles, handleSelect }) {
  return (
    <div>
      <h2>Uploaded Files:</h2>
      {/* Represents an HTML table to display the uploaded files and selection options. */}
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Select Receiver</th>
            <th>Select Transmitter</th>
          </tr>
        </thead>
        <tbody>
          {/* This is a JavaScript expression inside curly braces {}
          that maps over the uploadedFiles array to generate table rows for each uploaded file. */}
          {uploadedFiles.map((file, index) => (
            <tr key={index}>
              <td>{file.file.name}</td>
              <td>
                <input
                  type="radio"
                  name="receiver"
                  onChange={() => handleSelect(index, 'TX')}
                />
              </td>
              <td>
                <input
                  type="radio"
                  name="transmiter"
                  onChange={() => handleSelect(index, 'RX')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Sender component that hosts a button that sends the files to Sdr Device
 * @param selectedFileColumnRX - RX file
 * @param selectedFileColumnTX - TX file
 * TODO: figure out type of the files
 * @param {Function} handleSendToSDR      - Function that does the upload process
 * @returns {JSX.Element} - The rendered Sender component.
 */
function Sender({ selectedFileColumnRX, selectedFileColumnTX, handleSendToSDR }) {

  return (
    <div>
      <button onClick={() => handleSendToSDR(selectedFileColumnRX, selectedFileColumnTX)}>Send to Sdr Device</button>
    </div>
  );
}

/**
 * Loader Component
 *
 * @returns {JSX.Element} The rendered Loader component.
 */
export default function Loader() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFileColumnRX, setSelectedFileColumnTX] = useState(null);
  const [selectedFileColumnTX, setSelectedFileColumnRX] = useState(null);

  /**
   * handleSelect Function
   *
   * Handles the selection of receivers and transmitters for uploaded files.
   *
   * @param {number} index - The index of the file in the `uploadedFiles` array.
   * @param {string} column - The selected column identifier ('TX' or 'RX') for the receiver or transmitter.
   */
  const handleSelect = (index, column) => {
    //  creates a new array updatedFiles by spreading the contents of the uploadedFiles array.
    //  This step ensures that we're creating a new array to avoid directly modifying the state.
    const updatedFiles = [...uploadedFiles];
    updatedFiles[index].selectedColumn = column;

    setUploadedFiles(updatedFiles);

    if (column === 'RX') {
      setSelectedFileColumnRX(updatedFiles[index]);
    } else if (column === 'TX') {
      setSelectedFileColumnTX(updatedFiles[index]);
    }
  };

  const handleSendToSDR = (rxFile, txFile) => {
    // TODO: implement this
    console.log("Sending " + rxFile + " and " + txFile + " to SDR!");
  }
  return (
    <section>
      <Uploader uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
      <Selector uploadedFiles={uploadedFiles} handleSelect={handleSelect} />
      <div>
        <h2>Selected File -  Receiver:</h2>
        {selectedFileColumnRX ? <p>{selectedFileColumnRX.file.name}</p> : <p>No file selected.</p>}
      </div>
      <div>
        <h2>Selected File - Transmitter:</h2>
        {selectedFileColumnTX ? <p>{selectedFileColumnTX.file.name}</p> : <p>No file selected.</p>}
      </div>
      <Sender selectedFileColumnTX={selectedFileColumnTX} selectedFileColumnRX={selectedFileColumnRX} handleSendToSDR={handleSendToSDR}/>
    </section>
  );
}
