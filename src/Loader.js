import './App.css';
import './Loader.css';
import $ from 'jquery';
import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import i18n from './i18n';
import { withTranslation } from 'react-i18next';
import Collapsible from 'react-collapsible';
import { BsChevronDown, BsFillQuestionCircleFill, BsFillCaretLeftFill, BsFillStopFill, BsPlayFill, BsCloudDownloadFill } from "react-icons/bs";
import { ReliaWidgets } from "./components/blocks/loaderDevelopment.js";
import ReactDOM from 'react-dom/client';
import { Redirect, useNavigate } from 'react-router-dom';
import RHL_logo from './components/images/RHL_logo.png';
import LabsLand_logo from './components/images/LabsLand_logo.png';
import Background_logo from './components/images/Background.png';

var transmitterName = '';
var transmitterContents = '';
var receiverName = '';
var receiverContents = '';
var userid = '';
var taskId = '';
var receiverName = '';
var transmitterName = '';
var altIdentifier_outer = '';
var RECEIVER_FLAG = '';
var TRANSMITTER_FLAG = '';
var TASK_RUNNING = false;
var DISPLAYING_TASK_WIDGETS = false;
var PAGE_TASK_WIDGETS_DISPLAY = "task-widgets-display";
var PAGE_FILE_LOADER = "file-loader";
var ACTIVE_PAGE = PAGE_FILE_LOADER;
var TASK_POLL_INTERVAL = null;
var TASK_STATUS_CHECKING_INTERVAL = null;
var TRANSLATIONS_FUNCTION = function(message){}; // this is horrible and should be somewhere else

var RELIA_WIDGETS = null;

window.API_BASE_URL = "/api/";

const USER_POLL_INTERVAL_MS = 30000;
const TASK_POLL_INTERVAL_MS = 4000;
const TASK_STATUS_INTERVAL_MS = 500;
const width = Dimensions.get('window').width;

const Loader = ({t}) => {
  window.API_BASE_URL = "/api/";
  TRANSLATIONS_FUNCTION = t;
  const [google] = useState(null);

  useEffect(() => {
    if (!google) {
      const head = document.head;
      let script = document.getElementById('googleChartsScript');
      if (!script) {
        script = document.createElement('script');
        script.src = "https://www.gstatic.com/charts/loader.js";
        script.id = 'googleChartsScript';
        script.onload = () => {
          if (window.google && window.google.charts) {
            window.google.charts.load('current', { 'packages': ['corechart'] });
            window.google.charts.setOnLoadCallback(() => loadUI())
          }
        };
        head.appendChild(script);
      } else if (window.google) {
        loadUI();
      }
    }

    $(".container").css("padding-bottom", $(".footer").height());
    $(".container").css("padding-bottom", "+=0");

    const interval = setInterval(() => {
      poll_call();
      // console.log('Polling');
    }, USER_POLL_INTERVAL_MS);

    return () => {
      let script = document.getElementById('googleChartsScript');
      if (script) {
        script.remove();
      }
      clearInterval(interval);
    }
  }, [google]);

  return (
    <div className="App" style={{ backgroundColor: '#E8E8E8', height: '100%', minHeight: '100vh' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200&display=swap" rel="stylesheet" />
      <div className="invisible">{JSON.stringify(poll_call())}</div>
      <div className="invisible">{JSON.stringify(getTransactions())}</div>
      {/* <div className="invisible">{JSON.stringify(getCurrentTasks())}</div>
    <div className="invisible">{JSON.stringify(getErrorMessages())}</div> */}

      <div className="heading">
        <b>RELIA</b>
      </div>

      <div className="container" id="containerLoader">
        <br />
        <br />

        <div className="row">
          <Collapsible trigger={<div id="space"><div>{t('loader.upload.upload-gnu-radio-files')} <div id="inner1" title={t('loader.upload.select-files-to-upload-for-either-the-transmitter-or-the-receiver')}><BsFillQuestionCircleFill /></div> </div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#6eb9f7' }} open={true}>
            <UploadButtons t={t}/>
          </Collapsible>
        </div>

        <div className="row">
          <Collapsible trigger={<div id="space2"><div>{t('loader.select.submit-tasks')} <div id="inner2" title={t("loader.select.select-a-pair-of-previously-uploaded-transmitter-and-receiver-files-to-execute-for-observation")}><BsFillQuestionCircleFill /></div> </div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#3da2f5' }} open={true}>
            <div id="body2">
              <br />
              <div className="row">
                <div className="column">
                  <div className="centered">
                    <div className="align-left">
                      <b>{t("loader.select.most-recent-transmitter-files")}</b>
                      <div id="appTransmitter"></div>
                    </div>
                  </div>
                </div>

                <div className="column">
                  <div className="centered">
                    <div className="align-left">
                    <b>{t("loader.select.most-recent-receiver-files")}</b>
                      <div id="appReceiver"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="true-centered">
                  <form onSubmit={handleUserAPI}><div>
                    <button className="btn btn-lg btn-primary" id="runButton" disabled>{t("loader.select.send-to-sdr-devices")}</button>
                  </div></form>
                  <br />
                </div>
              </div>
            </div>
          </Collapsible>
        </div>
      </div>

      <div className="container" id="containerWindow">
      </div>

      <div className="footer">
        <img src={RHL_logo} alt={"Remote Hub Lab, University of Washington"} style={{ width: 0.074 * width, aspectRatio: 1.5536159601, resizeMode: 'contain' }} />
        <img src={LabsLand_logo} alt={"The LabsLand Network"} style={{ width: 0.074 * width, aspectRatio: 1.69142857143, resizeMode: 'contain' }} />
      </div>

      <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossOrigin="anonymous"></script>
    </div>
  );
};

class UploadButtons extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      grcURL: '',
    };

    this.handleUploadGRC_transmitter = this.handleUploadGRC_transmitter.bind(this);
    this.handleUploadGRC_receiver = this.handleUploadGRC_receiver.bind(this);
  }


  async handleUploadGRC_transmitter(ev) {
    ev.preventDefault();

    const data = new FormData();
    data.append('file', this.uploadInput_transmitter.files[0]);

    await fetch('/user/upload/transmitter', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ grcURL: `/${body.file}` });
      });
    });

    window.location.reload(true);
  }

  async handleUploadGRC_receiver(ev) {
    ev.preventDefault();

    const data = new FormData();
    data.append('file', this.uploadInput_receiver.files[0]);

    await fetch('/user/upload/receiver', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ grcURL: `/${body.file}` });
      });
    });

    window.location.reload(true);
  }

  render() {
    const { t } = this.props;  // Get the t function from props

    return (
      <div id="body1">
        <br />
        <div className="row">
          <div className="column">
            <div className="centered">
              <div className="align-left">
                <b>{t("loader.upload.transmitter-file")}</b>
                <form onSubmit={this.handleUploadGRC_transmitter}>
                  <div>
                    <input ref={(ref) => { this.uploadInput_transmitter = ref; }} type="file" size="15" accept=".grc" />
                  </div>
                  <div>
                    <button>{t('loader.upload.upload')}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="column">
            <div className="centered">
              <div className="align-left">
                <b>{t("loader.upload.receiver-file")}</b>
                <form onSubmit={this.handleUploadGRC_receiver}>
                  <div>
                    <input ref={(ref) => { this.uploadInput_receiver = ref; }} type="file" size="15" accept=".grc" />
                  </div>
                  <div>
                    <button>{t('loader.upload.upload')}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <br />
      </div>
    );
  }
}

function createTaskPollInterval() {
  if (TASK_POLL_INTERVAL != null) {
    clearInterval(TASK_POLL_INTERVAL);
    TASK_POLL_INTERVAL = null;
  }
  TASK_POLL_INTERVAL = setInterval(() => {
    if (ACTIVE_PAGE == PAGE_TASK_WIDGETS_DISPLAY) {
      if (TASK_RUNNING) {
        fetch('/scheduler/user/tasks/poll/' + taskId, {
          method: 'POST',
        })
          .then((response) => response.json())
          .then((responseJson) => {
            if (responseJson.success) {
              // console.log("Set user as active");
            } else {
              // console.log("Did not set user as active");
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        // No task running anymore, stop this interval
        clearInterval(TASK_POLL_INTERVAL);
        TASK_POLL_INTERVAL = null;
      }
    } else {
      // If we are in another page, stop this process
      clearInterval(TASK_POLL_INTERVAL);
      TASK_POLL_INTERVAL = null;
    }
  }, TASK_POLL_INTERVAL_MS);
}

function createTaskStatusInterval() {
  const t = TRANSLATIONS_FUNCTION;

  if (TASK_STATUS_CHECKING_INTERVAL != null) {
    clearInterval(TASK_STATUS_CHECKING_INTERVAL);
    TASK_STATUS_CHECKING_INTERVAL = null;
  }

  TASK_STATUS_CHECKING_INTERVAL = setInterval(() => {
    if (TASK_RUNNING && ACTIVE_PAGE == PAGE_TASK_WIDGETS_DISPLAY) {
      return fetch('/scheduler/user/tasks/' + taskId + '/' + userid, {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.success == false) {
            console.log("Uh oh... are you sure you are logged in?");
          } else {
            if (!TASK_RUNNING || ACTIVE_PAGE != PAGE_TASK_WIDGETS_DISPLAY)
              return;
            var status = responseJson.status;
            if (status == "completed") {
              confirmTaskStopped();
            }
            const status_bar = ReactDOM.createRoot(document.getElementById("statusBar"));
            let status_to_render = [];
            switch (status) {
              case "fully-assigned":
                status_to_render.push(<div>{t('runner.messages.your-gnu-radio-code-is-now-running-in-both-remote-devices')}</div>);
                break;
              case "queued":
                status_to_render.push(<div>{t('runner.messages.waiting-for-a-remote-set-up-to-be-available')}</div>);
                break;
              case "deleted":
                status_to_render.push(<div>{t('runner.messages.your-gnu-radio-code-has-stopped')}</div>);
                break;
              case "error":
                status_to_render.push(<div>{t('runner.messages.there-was-an-error-running-your-gnu-radio-code')}</div>);
                break;
              case "receiver-assigned":
                status_to_render.push(<div>{t('runner.messages.remote-set-up-assigned-waiting-to-start-running-your-gnu-radio-code')}</div>);
                break;
              case "receiver-still-processing":
                status_to_render.push(<div>{t('runner.messages.the-remote-set-up-is-processing-your-GNU-Radio-in-the-receiver-device')}</div>);
                break;
              case "transmitter-still-processing":
                status_to_render.push(<div>{t('runner.messages.the-remote-set-up-is-processing-your-GNU-Radio-in-the-transmitter-device')}</div>);
                break;
            }
            if (status_to_render.length > 0)
              status_bar.render(status_to_render);

            if (RECEIVER_FLAG == "") {
              if (status == "receiver-assigned" || status == "receiver-still-processing" || status == "fully-assigned") {
                RECEIVER_FLAG = responseJson.receiver;
              }
            }
            if (TRANSMITTER_FLAG == "") {
              if (status == "transmitter-still-processing" || status == "fully-assigned") {
                TRANSMITTER_FLAG = responseJson.transmitter;
              }
            }

            if (RECEIVER_FLAG && TRANSMITTER_FLAG) {
              if (!DISPLAYING_TASK_WIDGETS) {
                startWidgets();
                DISPLAYING_TASK_WIDGETS = true;
              }
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      if (TASK_STATUS_CHECKING_INTERVAL != null) {
        clearInterval(TASK_STATUS_CHECKING_INTERVAL);
        TASK_STATUS_CHECKING_INTERVAL = null;
      }
    }
  }, TASK_STATUS_INTERVAL_MS);
}

const TaskWidgetDisplay = () => {
  const t = TRANSLATIONS_FUNCTION;

  let status = 'queued';
  window.API_BASE_URL = "/api/";

  useEffect(() => {

    (async () => {
      createTaskPollInterval();
      createTaskStatusInterval();

      return () => {
        let script = document.getElementById('googleChartsScript');
        if (script) {
          script.remove();
        }
      }

    })();
  }, []);

  const handleNavigate = ev => {
    ev.preventDefault();
    leavePage(taskId, userid);
  };

  const handleReschedule = async (ev) => {
    ev.preventDefault();
    let object = {
      "r_filename": receiverName,
      "t_filename": transmitterName,
      "priority": 10,
      "taskId": taskId,
    };

    const status_bar = ReactDOM.createRoot(document.getElementById("statusBar"));
    let status_to_render = [];
    status_to_render.push(<div>{t('runner.messages.starting-to-run-again-your-gnu-radio-code')}</div>);
    status_bar.render(status_to_render);

    fetch('/user/route/' + userid, {
      method: 'POST',
      body: JSON.stringify(object),
    }).then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.success) {
          startTask();
          createTaskPollInterval();
          createTaskStatusInterval();
        }
      });
  };

  const handleStopTask = async (ev) => {
    ev.preventDefault();
    if (TASK_RUNNING) {
      const status_bar = ReactDOM.createRoot(document.getElementById("statusBar"));
      let status_to_render = [];
      status_to_render.push(<div>{t('runner.messages.stopping')}</div>);
      status_bar.render(status_to_render);

      stopWidgets();

      fetch('/scheduler/user/complete-tasks/' + taskId, {
        method: 'POST',
      })
        .then((response) => response.json())
        .then((responseJson) => {
          confirmTaskStopped();
        }).catch((error) => {
          console.log(error);
        });
    }
  };

  return (
    <div className="App">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200&display=swap" rel="stylesheet" />
      <div id="statusBar">{t('runner.messages.your-gnu-radio-files-are-being-processed-please-wait')}</div>

      <div>
        <button onClick={handleNavigate} className="btn btn-lg btn-secondary">{<BsFillCaretLeftFill />}&nbsp;{t('runner.buttons.return-to-file-upload')}</button> &nbsp;&nbsp;&nbsp;
        <button onClick={handleStopTask} className="btn btn-lg btn-danger" id="stopExecutionButton">{<BsFillStopFill />}&nbsp;{t('runner.buttons.stop')}</button> &nbsp;&nbsp;&nbsp;
        <button onClick={handleReschedule} className="btn btn-lg btn-primary" id="reExecuteButton" hidden>{<BsPlayFill />}&nbsp;{t('runner.buttons.run-again')}</button>
      </div>

      <br /><br />

      <div id="all-together" className="row"></div>

      <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossOrigin="anonymous"></script>
    </div>
  );

};


function loadUI() {
}

async function poll_call() {
  return fetch('/user/poll')
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.success == false) {
        window.location.href = responseJson.redirectTo;
      }
      userid = responseJson.user_id;
      if (responseJson.locale && responseJson.locale != i18n.language) {
        i18n.changeLanguage(responseJson.locale);
      }
      return responseJson;
    })
    .catch((error) => {
      console.error(error);
    });
}

function startTaskUIChanges() {
  const t = TRANSLATIONS_FUNCTION;
  startWidgets();
  $("#stopExecutionButton").prop("disabled", false);
  $("#reExecuteButton").prop("disabled", true);
  $("#statusBar").html(t("runner.messages.your-gnu-radio-files-are-being-processed-please-wait"));
}

function startTask() {
  if (!TASK_RUNNING) {
    TASK_RUNNING = true;
    startTaskUIChanges();
  }
}

/*
* Stop the widgets immediately
*/
function stopWidgets() {
  if (RELIA_WIDGETS != null) {
    RELIA_WIDGETS.stop();
  }
}

function startWidgets() {
  var $targetDiv = $("#all-together");
  if ($targetDiv.length == 0) {
    // if all-together is not loaded, do not create ReliaWidgets with it
    return;
  }
  if (RELIA_WIDGETS == null) {
    RELIA_WIDGETS = new ReliaWidgets($targetDiv);
  }
  RELIA_WIDGETS.start();
}

/*
* Clean the intervals and change buttons for stopTask() when it is stopped on the server side.
*/
function confirmTaskStopped() {
  if (TASK_RUNNING) {
    stopWidgets();

    TASK_RUNNING = false;
    $("#stopExecutionButton").prop("disabled", true);
    $("#reExecuteButton").prop("disabled", false);
    $("#reExecuteButton").prop("hidden", false);
    $("#statusBar").html("Your GNU Radio code is not running anymore. Feel free to run it again");

    if (TASK_STATUS_CHECKING_INTERVAL != null) {
      clearInterval(TASK_STATUS_CHECKING_INTERVAL);
      TASK_STATUS_CHECKING_INTERVAL = null;
    }
  }
}

function handleUserAPI(ev) {
  ev.preventDefault();

  let object = {
    "r_filename": receiverName,
    "t_filename": transmitterName,
    "priority": 10,
    "taskId": "None",
  };

  fetch('/user/route/' + userid, {
    method: 'POST',
    body: JSON.stringify(object),
  }).then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.success) {
        taskId = responseJson.taskIdentifier;
        startTask();
        switch_to_task_widget_display();
        startTaskUIChanges();
      }
    });
}

async function handleCancellation(ev) {
  ev.preventDefault();

  let taskToCancel = document.getElementById('to_cancel').value;
  let object = {
    "task": taskToCancel,
    "user": userid
  };

  await fetch('/user/deletion', {
    method: 'POST',
    body: JSON.stringify(object),
  }).then((response) => {
    console.log(taskToCancel);
  });

  window.location.reload(true);
}

async function searchTasks(ev) {
  ev.preventDefault();

  await poll_call();
  let taskToSearch = document.getElementById('to_search').value;
  let object = {
    "task": taskToSearch,
    "user": userid
  };

  return fetch('/user/search-tasks', {
    method: 'POST',
    body: JSON.stringify(object),
  })
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.success == false) {
        console.log("Uh oh... are you sure you are logged in?");
      } else {
        const status_result = ReactDOM.createRoot(document.getElementById("searchStatus"));
        let value = [];
        value.push(<div><b>Status</b><br />{responseJson.status}</div>);
        status_result.render(value);
      }
    })
    .catch((error) => {
      console.log(error);
    });

}

/*
async function getCurrentTasks() {
   await poll_call();
   let object = {
      "user": userid
   };

   return fetch('/user/get-tasks', {
      method: 'POST',
      body: JSON.stringify(object),
   })
   .then((response) => response.json())
   .then((responseJson) => {
      if (responseJson.success == false) {
          console.log("Uh oh... are you sure you are logged in?");
      }
      const rootTasks = ReactDOM.createRoot(document.getElementById("currentTasks"));
      let tasksToRender = [];
      // if (responseJson.ids.length > 0) {
      // tasksToRender.push(<div><b>All Tasks</b>{"\n"}</div>);
      // }
      for (let i = 0; i < responseJson.ids.length; i++) {
         let receiver_string = " receiver " + responseJson.receivers[i] + " ";
         let transmitter_string = " transmitter " + responseJson.transmitters[i];
         if (responseJson.receivers[i] == "null") {
            receiver_string = " no receiver ";
         }
         if (responseJson.transmitters[i] == "null") {
            transmitter_string = " no transmitter";
         }
         tasksToRender.push(<div>{"Task "}<b>{responseJson.ids[i]}</b>{" is "}<b>{responseJson.statuses[i]}</b>{" with" + receiver_string + "and" + transmitter_string + ".\n"}</div>);
      }
      rootTasks.render(tasksToRender);
      return responseJson
   })
   .catch((error) => {
     console.error(error);
   });
}

async function getErrorMessages() {
   await poll_call();
   let object = {
      "user": userid
   };

   return fetch('/user/error-msgs', {
       method: 'POST',
       body: JSON.stringify(object),
   })
   .then((response) => response.json())
   .then((responseJson) => {
     if (responseJson.success == false) {
         console.log("Uh oh... are you sure you are logged in?");
     }
     const rootTasks = ReactDOM.createRoot(document.getElementById("errorMessages"));
     let errorsToRender = [];
     // if (responseJson.ids.length > 0) {
     // errorsToRender.push(<div><b>Most Recent Error Messages</b>{"\n"}</div>);
     // }
     for (let i = 0; i < responseJson.ids.length; i++) {
         errorsToRender.push(<div>{"Task "}<b>{responseJson.ids[i]}</b>{" encountered the following error: " + responseJson.errors[i] + "\n"}</div>);
     }
     rootTasks.render(errorsToRender);
     return responseJson
   })
   .catch((error) => {
     console.error(error);
   });
}
*/

function getTransactions() {
  return fetch('/user/transactions')
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.success == false) {
        console.log("Uh oh... are you sure you are logged in?");
      }
      const rootTransmitters = ReactDOM.createRoot(document.getElementById("appTransmitter"));
      let listLinksTransmitters = [];
      let listIds = ['box0', 'box1', 'box2', 'box3', 'box4', 'box5', 'box6', 'box7', 'box8', 'box9'];
      for (let i = 0; i < responseJson.transmitter_files.length; i++) {
        const url_link = '/user/transactions/' + responseJson.username + '/transmitter/' + responseJson.transmitter_files[i];
        listLinksTransmitters.push(
          <div className="form-check">
            <input type="checkbox" className="form-check-input" id={listIds[i]} value="0" />
            <label htmlFor={listIds[i]} className="form-check-label">{responseJson.transmitter_files[i]}</label>
            &nbsp;
            <a href={url_link} download> {<BsCloudDownloadFill />} </a>
          </div>
        );
      }
      rootTransmitters.render(listLinksTransmitters);
      const rootReceivers = ReactDOM.createRoot(document.getElementById("appReceiver"));
      let listLinksReceivers = [];
      for (let j = 0; j < responseJson.receiver_files.length; j++) {
        const url_link = '/user/transactions/' + responseJson.username + '/receiver/' + responseJson.receiver_files[j];
        listLinksReceivers.push(
        <div className="form-check">
          <input type="checkbox" className="form-check-input" id={listIds[j + 5]} value="0" />
          <label htmlFor={listIds[j + 5]} className="form-check-label">{responseJson.receiver_files[j]}</label>
          &nbsp;
          <a href={url_link} download> {<BsCloudDownloadFill />}</a>
        </div>);
      }
      rootReceivers.render(listLinksReceivers);
      $(document).on("click change", "input[type='checkbox']", function () {
        let sumTransmitters = 0;
        let sumReceivers = 0;
        for (let k = 0; k < responseJson.transmitter_files.length; k++) {
          let possibleValue = document.querySelector('input[id=' + CSS.escape(listIds[k]) + ']:checked');
          if (possibleValue && possibleValue != 0) {
            sumTransmitters = sumTransmitters + 1;
            transmitterName = responseJson.transmitter_files[k];
            fetch('/user/transactions/' + responseJson.username + '/transmitter/' + responseJson.transmitter_files[k]).then(function (response) {
              response.text().then(function (text) {
                transmitterContents = text;
              });
            });
            console.log(transmitterName);
          }
        }
        for (let l = 0; l < responseJson.receiver_files.length; l++) {
          let possibleValue = document.querySelector('input[id=' + CSS.escape(listIds[l + 5]) + ']:checked');
          if (possibleValue && possibleValue != 0) {
            sumReceivers = sumReceivers + 1;
            receiverName = responseJson.receiver_files[l];
            fetch('/user/transactions/' + responseJson.username + '/receiver/' + responseJson.receiver_files[l]).then(function (response) {
              response.text().then(function (text) {
                receiverContents = text;
              });
            });
            console.log(receiverName);
          }
        }
        if (sumTransmitters == 1 && sumReceivers == 1) {
          $('#runButton').prop('disabled', false);
        } else {
          $('#runButton').prop('disabled', true);
        }
      });
      return responseJson
    })
    .catch((error) => {
      console.error(error);
    });
}

function leavePage(taskId, userId) {
  if (TASK_RUNNING) {
    fetch('/scheduler/user/complete-tasks/' + taskId, {
      method: 'POST',
    })
      .then((response) => response.json())
      .then((responseJson) => {
        confirmTaskStopped();
      }).catch((error) => {
        console.log(error);
      });
  }
  switch_to_loader();
}

function switch_to_task_widget_display() {
  ACTIVE_PAGE = PAGE_TASK_WIDGETS_DISPLAY;
  RECEIVER_FLAG = '';
  TRANSMITTER_FLAG = '';

  let element = document.getElementById("containerLoader");
  let hidden = element.getAttribute("hidden");
  element.setAttribute("hidden", "hidden");

  const container_window = ReactDOM.createRoot(document.getElementById("containerWindow"));
  let window_to_render = [];
  window_to_render.push(<TaskWidgetDisplay />);
  container_window.render(window_to_render);
}

function switch_to_loader() {
  confirmTaskStopped();
  DISPLAYING_TASK_WIDGETS = false;
  ACTIVE_PAGE = PAGE_FILE_LOADER;

  // let element = document.getElementById("containerLoader");
  // let hidden = element.getAttribute("hidden");
  // element.removeAttribute("hidden");

  // const container_window = ReactDOM.createRoot(document.getElementById("containerWindow"));
  // let window_to_render = [];
  // container_window.render(window_to_render);

  window.location.reload(true);
}

export default withTranslation()(Loader);
