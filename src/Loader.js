/**
 * This React component file defines a set of components and functionality for uploading, selecting,
 * and sending gnr files to an SDR device. It consists of the following components:
 *
 * - `Uploader`: Handles file upload functionality, allowing users to select files for transmission.
 * - `Selector`: Displays a list of uploaded files and provides options to select which files are receivers and transmitters.
 * - `Sender`: Hosts a button that initiates the process of sending selected files to the SDR device.
 * - `Loader`: The top-level component that manages state, interactions between child components, and file upload and transmission logic.
 *
 *
 * Known bugs:
 *  = because we are using an index to set what file is currently selected in our table in the Selector component,
 *     when we remove an element it messes up with the current indexing and changes which files are selected
 */
import React, { useState } from 'react';

import './Loader.css';
/**
 * Uploader Component
 * @param {Array} uploadedFiles - An array of uploaded files.
 * @param {Function} setUploadedFiles - A function to update the uploaded files.
 * @param setTableIsVisible - A  function to update the flag to control table visibility.
 *
 * @returns {JSX.Element} The rendered Uploader component.
 */
function Uploader({ uploadedFiles, setUploadedFiles, setTableIsVisible }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  /**
   * handleFileChange function is responsible for updating the selectedFiles state
   * when one or more files are chosen using the file input.
   * It extracts the selected files from the event object and sets them as the new value
   * of the selectedFiles state variable, allowing them to be used for further processing, such as file upload.
   */
  const handleFileChange = (event) => {
    // Update the selectedFiles state with the chosen files
    setSelectedFiles([...selectedFiles, ...event.target.files]);
  };

  /**
   * handleUpload Function
   *
   * This function handles the file upload logic when the "Upload" button is clicked.
   * It checks if any files are selected, updates the state with the chosen files,
   * and adds them to the uploadedFiles state with an initial selectedColumn value of null.
   * If no files are selected, it logs a message to indicate that no files were selected.
   */
  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      // Add the selected files to the uploadedFiles state with initial selectedColumn values of null.
      const newUploadedFiles = selectedFiles.map((file) => ({
        file,
        selectedColumn: null,
      }));
      setUploadedFiles([...uploadedFiles, ...newUploadedFiles]);
      console.log('Uploading files:', newUploadedFiles);
      setTableIsVisible(true);
      // TODO: Additional file upload logic probably here.
    } else {
      // Log a message if no files are selected.
      console.log('No files selected.');
    }

    // Clear the selectedFiles state after uploading
    setSelectedFiles([]);
  };

  return (
    <div className="uploader-container">
      {/* I would like to maybe combine the buttons into one */}
      <input className={"loader-button"} type="file"  accept=".grc" onChange={handleFileChange}  multiple />
      <button className={"loader-button"} onClick={handleUpload}>
        Upload
      </button>
    </div>
  );
}
/**
 * Selector Component
 *
 * @param {Array} uploadedFiles - An array of uploaded files.
 * @param {Function} handleSelect - A function to handle the selection of receivers and transmitters.
 * @param {Function} handleRemove - A function to handle row removal.
 * @param {boolean} tableIsVisible - A flag to control table visibility.
 *
 * @returns {JSX.Element} The rendered Selector component.
 */
function Selector({ uploadedFiles, handleSelect, handleRemove, tableIsVisible }) {
  if (tableIsVisible) {
    return (
        <div>
          {/* Represents an HTML table to display the uploaded files and selection options. */}
          <table>
            <thead>
            <tr>
              <th>File</th>
              <th>Select Receiver</th>
              <th>Select Transmitter</th>
              <th>Remove</th>
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
                  <td>
                   <button  className={"loader-button"} onClick={() => handleRemove(index)}>x</button>
                  </td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
    );
  }
}

/**
 * Sender component that hosts a button that sends the files to Sdr Device
 * @param selectedFileColumnRX - RX file
 * @param selectedFileColumnTX - TX file
 * @param {Function} handleSendToSDR      - Function that does the upload process
 * @returns {JSX.Element} - The rendered Sender component.
 */
function Sender({ selectedFileColumnRX, selectedFileColumnTX }) {
  const handleSendToSDR = (rxFile, txFile) => {
    console.log("Sending RX(" + rxFile.file.name + ") and TX(" + txFile.file.name + ") to SDR!");
  }
  return (
    <div className={"sender-container"}>
      <button className={"loader-button"} onClick={() => handleSendToSDR(selectedFileColumnRX, selectedFileColumnTX)}>Send to Sdr Device</button>
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
  const [tableIsVisible, setTableIsVisible] = useState(false);

  /**
   * Handle the selection of receivers (RX) and transmitters (TX) for an uploaded file.
   *
   * @param {number} index - The index of the uploaded file in the array.
   * @param {string} column - The column to which the file should be assigned ('RX' or 'TX').
   */
  const handleSelect = (index, column) => {
    const updatedFiles = [...uploadedFiles];
    updatedFiles[index].selectedColumn = column;
    setUploadedFiles(updatedFiles);
    if (column === 'RX') {
      setSelectedFileColumnRX(updatedFiles[index]);
    } else if (column === 'TX') {
      setSelectedFileColumnTX(updatedFiles[index]);
    }
  };

  /**
   * Handle the removal of an uploaded file from the table.
   *
   * @param {number} indexToRemove - The index of the file to be removed from the array.
   */
  const handleRemove = (indexToRemove) => {
    // Create a new array without the selected row
    const updatedFiles = uploadedFiles.filter((file, index) => index !== indexToRemove);
    setUploadedFiles(updatedFiles);
  };

  return (
    <div className="container">
      <div className="component-container">
        <Uploader uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} tableIsVisible={tableIsVisible} setTableIsVisible={setTableIsVisible}/>
        <Selector uploadedFiles={uploadedFiles} handleSelect={handleSelect} handleRemove={handleRemove} tableIsVisible={tableIsVisible} />
        <Sender selectedFileColumnTX={selectedFileColumnTX} selectedFileColumnRX={selectedFileColumnRX} />
      </div>
    </div>
  );
}

