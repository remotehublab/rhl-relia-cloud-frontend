import './App.css';
import './Loader.css';
import $ from 'jquery';
import React, { useEffect, useState }  from 'react';
import { Dimensions } from 'react-native';
import Collapsible from 'react-collapsible';
import { BsChevronDown, BsFillQuestionCircleFill } from "react-icons/bs";
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
var COMBINED_FLAG = 0;
var FIVE_SECOND_FLAG = 0;
var STATUS_STATE = 0;
var LEAVE_PAGE = 0;

var renderStats = 0;

window.API_BASE_URL = "/api/";
window.BLOCKS = new Map();
window.TIMES = new Map();

const TIMEFRAME_MS = 30000;
const TIMEFRAME_MS_WINDOW = 1000;
const width = Dimensions.get('window').width;

const Loader = () => {
  window.API_BASE_URL = "/api/";
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
            window.google.charts.load('current', {'packages':['corechart']});
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
      console.log('Polling');
    }, TIMEFRAME_MS);

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
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200&display=swap" rel="stylesheet" /> 
    <div className="invisible">{JSON.stringify(poll_call())}</div>
    <div className="invisible">{JSON.stringify(getTransactions())}</div>
    {/* <div className="invisible">{JSON.stringify(getCurrentTasks())}</div>
    <div className="invisible">{JSON.stringify(getErrorMessages())}</div> */}

    <div class="heading">
        <b>RELIA</b>
    </div>

    <div class="container" id="containerLoader">
        <br />
        <br />

        <div class="row">
          <Collapsible trigger={<div id="space"><div>Upload Tasks <div id="inner1" title="Select files to upload for either the transmitter or the receiver."><BsFillQuestionCircleFill /></div> </div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#6eb9f7' }} open={true}>
            <Main />
          </Collapsible>
        </div>

	<div class="row">
          <Collapsible trigger={<div id="space2"><div>Submit Tasks <div id="inner2" title="Select a pair of previously uploaded transmitter and receiver files to execute for observation."><BsFillQuestionCircleFill /></div> </div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#3da2f5' }} open={true}>
            <div id="body2">
            <br />
            <div class="row">
              <div class="column">
                <div class="centered">
                  <div class="align-left">
                    <b>Most Recent Transmitter Files</b>
                    <div id="appTransmitter"></div>
                  </div>
                </div>
	      </div>

              <div class="column">
                <div class="centered">
                  <div class="align-left">
                    <b>Most Recent Receiver Files</b>
                    <div id="appReceiver"></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div class="true-centered">
                <form onSubmit={handleUserAPI}><div>
	          <button class="btn btn-lg btn-primary" id="runButton" disabled>Execute</button>
                </div></form>
                <br />
              </div>
	    </div>
            </div>
          </Collapsible>
	</div>

        {/* <div class="row">
          <Collapsible trigger={<div id="space3"><div>Delete Tasks <div id="inner3" title="Specify a task to delete using ID. IDs may be examined under the Most Recent Tasks tab."><BsFillQuestionCircleFill /></div> </div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#0d8bf2' }}>
            <div id="body3">
              <br />
              <form onSubmit={handleCancellation}><div>
	        <input className="textInput" type="text" placeholder="Task ID" id="to_cancel" name="to_cancel"/><button id="cancelButton">Delete</button>
              </div></form>
              <br />
            </div>
          </Collapsible>
         </div>

         <div class="row">
          <Collapsible trigger={<div id="space4"><div>Search Task Status <div id="inner4" title="Search for the status of a task using ID. IDs may be examined under the Most Recent Tasks tab."><BsFillQuestionCircleFill /></div> </div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#0a6fc2' }}>
             <div id="body4">
                <br />
                <form onSubmit={searchTasks}><div>
	           <input className="textInput" type="text" id="to_search" placeholder="Task ID" name="to_search"/><button id="searchButton">Search</button>
                </div></form>
                <div id="searchStatus"></div>
                <br />
             </div>
          </Collapsible>
         </div>

         <div class="row">
          <Collapsible trigger={<div id="space5"><div>Most Recent Tasks <div id="inner5" title="View the five most recently constructed tasks. For further tasks and/or details, please contact system administration."><BsFillQuestionCircleFill /></div> </div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#085391' }}>
            <div id="currentTasks"></div>
          </Collapsible>
         </div>
        
         <div class="row">
          <Collapsible trigger={<div id="space6"><div>Most Recent Error Messages <div id="inner6" title="View the most recently generated error messages produced by executed tasks."><BsFillQuestionCircleFill /></div> </div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#053861' }}>
            <div id="errorMessages"></div>
          </Collapsible>
        </div> */}

    </div>

    <div class="container" id="containerWindow">
    </div>

    <div class="footer">
         <img src={RHL_logo} alt={"Remote Hub Lab, University of Washington"} style={{width: 0.075 * width, aspectRatio: 1.5536159601, resizeMode: 'contain'}} />
         <img src={LabsLand_logo} alt={"The LabsLand Network"} style={{width: 0.075 * width, aspectRatio: 1.69142857143, resizeMode: 'contain'}} />
    </div>
	
    <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossOrigin="anonymous"></script>
    </div>
  );
};

class Main extends React.Component {
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
    return (
      <div id="body1">
      <br />
      <div class="row">
        <div class="column">
          <div class="centered">
            <div class="align-left">
              <b>Transmitter File</b>
              <form onSubmit={this.handleUploadGRC_transmitter}>
                <div>
                  <input ref={(ref) => { this.uploadInput_transmitter = ref; }} type="file" size="15" accept=".grc"/>
                </div>
                <div>
                  <button>Upload</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="centered">
            <div class="align-left">
              <b>Receiver File</b>
              <form onSubmit={this.handleUploadGRC_receiver}>
                <div>
                  <input ref={(ref) => { this.uploadInput_receiver = ref; }} type="file" size="15" accept=".grc"/>
                </div>
                <div>
                  <button>Upload</button>
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

const LoaderDevelopment = () => {
  let status = 'queued';
  window.API_BASE_URL = "/api/";
  window.BLOCKS = new Map();
  window.TIMES = new Map();

  useEffect(() => {

    (async () => {
      const interval1 = setInterval(() => {
        // if (TIME_REMAINING <= 0) {
        //  leavePage(taskId, userid);
        // }
        if (RECEIVER_FLAG != "" && TRANSMITTER_FLAG != "" && COMBINED_FLAG == 0) {
          loadUI_window(RECEIVER_FLAG, TRANSMITTER_FLAG, taskId, userid);
          COMBINED_FLAG = 1;
        }
        fetch('/scheduler/user/tasks/poll/' + taskId, {
          method: 'POST',
        })
        .then((response) => response.json())
        .then((responseJson) => {
          if (responseJson.success) {
            console.log("Set user as active");
          } else {
            console.log("Did not set user as active");
          }
        })
        .catch((error) => {
          console.log(error);
        });
      }, TIMEFRAME_MS_WINDOW);

      const interval2 = setInterval(() => {
        if ((FIVE_SECOND_FLAG == 0 || STATUS_STATE == 0) && LEAVE_PAGE == 0) {
          return fetch('/scheduler/user/tasks/' + taskId + '/' + userid, {
            method: 'GET',
          })
          .then((response) => response.json())
          .then((responseJson) => {
            if (responseJson.success == false) {
              console.log("Uh oh... are you sure you are logged in?");
            } else {
              status = responseJson.status;
              if (status == "completed") {
                STATUS_STATE = 1;
              }
              const status_bar = ReactDOM.createRoot(document.getElementById("statusBar"));
              let status_to_render = [];
              status_to_render.push(<div>Your task is {status}<br /></div>);
              status_bar.render(status_to_render);
              if (RECEIVER_FLAG == "") {
                if (status == "receiver assigned" || status == "receiver still processing" || status == "fully assigned") {
                  RECEIVER_FLAG = responseJson.receiver;
                }
              }
              if (TRANSMITTER_FLAG == "") {
                if (status == "transmitter still processing" || status == "fully assigned") {
                  TRANSMITTER_FLAG = responseJson.transmitter;   
                }
              }
            }
          })
          .catch((error) => {
            console.log(error);
          });
        }
      }, TIMEFRAME_MS_WINDOW);

      return () => {
        let script = document.getElementById('googleChartsScript');
        if (script) {
          script.remove();
        }
      }

    })();
  }, [renderStats]);

  const handleNavigate = ev => {
    ev.preventDefault();
    leavePage(taskId, userid);
  };

  const reschedule = async (ev) => {
    ev.preventDefault();
    if (FIVE_SECOND_FLAG == 1) {
      let object = {
        "r_filename": receiverName,
        "t_filename": transmitterName,
        "priority": 10,
        "taskId": taskId,
      };

      FIVE_SECOND_FLAG = 0;
      STATUS_STATE = 0;
      renderStats = renderStats + 1;

      window.BLOCKS.clear();
      window.TIMES.clear();

      fetch('/user/route/' + userid, {
        method: 'POST',
        body: JSON.stringify(object),
      }).then((response) => response.json())
      .then((responseJson) => {
        // if (responseJson.success) {
        //   window.location.href = '/loaderDevelopment/' + responseJson.altIdentifier;
        // }
      });
    }
  };

  return (
    <div className="App">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200&display=swap" rel="stylesheet" /> 
    <div id="statusBar"></div>

    <form><div>
    <button onClick={handleNavigate} class="btn btn-lg btn-primary" id="runButton">Return to File Upload</button> &nbsp;&nbsp;&nbsp;
    <button onClick={reschedule} class="btn btn-lg btn-primary" id="runButton">Reschedule</button>
    </div></form>

    <br /><br />

    <div id="all-together" class="row"></div>
	
    <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossorigin="anonymous"></script>
    </div>
  );

};

function loadUI() {
    // var widgets = new ReliaWidgets($("#all-together"));
}

async function poll_call() {
   return fetch('/user/poll')
   .then((response) => response.json())
   .then((responseJson) => {
      if (responseJson.success == false) {
         console.log('Time to move');
         window.location.href = '/login';
      }
      userid = responseJson.user_id;
      return responseJson;
   })
   .catch((error) => {
     console.error(error);
   });
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
         switch_to_window();
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
          value.push(<div><b>Status</b><br />{ responseJson.status }</div>);
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
         listLinksTransmitters.push(<div><input type="checkbox" id={ listIds[i] } value="0" /><a href= {url_link} download> {responseJson.transmitter_files[i]} </a><br /></div>);
      }
      rootTransmitters.render(listLinksTransmitters);
      const rootReceivers = ReactDOM.createRoot(document.getElementById("appReceiver"));
      let listLinksReceivers = [];
      for (let j = 0; j < responseJson.receiver_files.length; j++) {
         const url_link = '/user/transactions/'  + responseJson.username + '/receiver/' + responseJson.receiver_files[j];
         listLinksReceivers.push(<div><input type="checkbox" id={ listIds[j + 5] } value="0" /><a href= {url_link} download> {responseJson.receiver_files[j]} </a><br /></div>);
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
               fetch('/user/transactions/' + responseJson.username + '/transmitter/' + responseJson.transmitter_files[k]).then(function(response) {
                  response.text().then(function(text) {
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
               fetch('/user/transactions/' + responseJson.username + '/receiver/' + responseJson.receiver_files[l]).then(function(response) {
                  response.text().then(function(text) {
                     receiverContents = text;
                  });
               });
               console.log(receiverName);
            }
         }
         if (sumTransmitters == 1 && sumReceivers == 1) {
            $('#runButton').prop('disabled', false);
            console.log("Enabled");
         } else {
            $('#runButton').prop('disabled', true);
            console.log("Disabled");
         }
      });
      return responseJson
   })
   .catch((error) => {
     console.error(error);
   });
}

function leavePage(taskId, userId) {
    if (FIVE_SECOND_FLAG == 0) {
      fetch('/scheduler/user/complete-tasks/' + taskId, {
        method: 'POST',
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson.status);
      }).catch((error) => {
        console.log(error);
      });
    }
    switch_to_loader();
}

function loadUI_window(deviceId_r, deviceId_t, taskId, userId) {
    const interval4 = setInterval(() => {
      if (LEAVE_PAGE == 0) {
        var widgets = new ReliaWidgets($("#all-together"));
        let relocate_flag = true;
        if (window.TIMES.has(deviceId_t) && window.TIMES.has(deviceId_r)) {
          let t_length = window.TIMES.get(deviceId_t).length;
          let r_length = window.TIMES.get(deviceId_r).length;
          for (let i = 0; i < t_length; i++) {
            if (window.TIMES.get(deviceId_t)[i] > 0) {
              relocate_flag = false;
            }
          }
          for (let j = 0; j < r_length; j++) {
            if (window.TIMES.get(deviceId_r)[j] > 0) {
              relocate_flag = false;
            }
          }
          if (relocate_flag && FIVE_SECOND_FLAG == 0 && !(t_length == 0 && r_length == 0)) {
            fetch('/scheduler/user/complete-tasks/' + taskId, {
              method: 'POST',
            })
            .then((response) => response.json())
            .then((responseJson) => {
              console.log(responseJson.status);
              FIVE_SECOND_FLAG = 1;
            }).catch((error) => {
              console.log(error);
            });
          }
        }
      }
    }, TIMEFRAME_MS_WINDOW);
}

function switch_to_window() {
    LEAVE_PAGE = 0;
    RECEIVER_FLAG = '';
    TRANSMITTER_FLAG = '';

    window.BLOCKS = new Map();
    window.TIMES = new Map();

    let element = document.getElementById("containerLoader");
    let hidden = element.getAttribute("hidden");
    element.setAttribute("hidden", "hidden");

    renderStats = renderStats + 1;

    const container_window = ReactDOM.createRoot(document.getElementById("containerWindow"));
    let window_to_render = [];
    window_to_render.push(<LoaderDevelopment />);
    container_window.render(window_to_render);
}

function switch_to_loader() {
    FIVE_SECOND_FLAG = 0;
    STATUS_STATE = 0;
    COMBINED_FLAG = 0;
    LEAVE_PAGE = 1;

    // let element = document.getElementById("containerLoader");
    // let hidden = element.getAttribute("hidden");
    // element.removeAttribute("hidden");

    // const container_window = ReactDOM.createRoot(document.getElementById("containerWindow"));
    // let window_to_render = [];
    // container_window.render(window_to_render);

    window.location.reload(true);
}
  
export default Loader;
