import './App.css';
import $ from 'jquery';
import React, { useEffect, useState }  from 'react';
import { ReliaWidgets } from "./components/blocks/loaderDevelopment.js";
import ReactDOM from 'react-dom/client';
import  { Redirect, useNavigate, useParams } from 'react-router-dom';

const TIMEFRAME_MS = 1000;
var RECEIVER_FLAG = "";
var TRANSMITTER_FLAG = "";
var COMBINED_FLAG = 0;
var FIVE_SECOND_FLAG = 0;
var TIME_REMAINING = 60;
  
const LoaderDevelopment = () => {
  window.API_BASE_URL = "/api/";
  window.BLOCKS = new Map();
  window.TIMES = new Map();
  const [google] = useState(null);
  const navigate = useNavigate();
  const { userId, taskId, receiverName, transmitterName } = useParams();
  let status = 'queued';

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
          }
        };
        head.appendChild(script);
      }
    }

    let timeToGet = '/scheduler/user/get-task-time/' + taskId + '/' + userId;
    fetch(timeToGet, {
      method: 'GET',
      headers: {'relia-secret': 'password'}
    }).then((response) => response.json())
    .then((responseJson) => {
      TIME_REMAINING = parseInt(responseJson.timeRemaining);
    })
    .catch((error) => {
      console.log(error);
    });

    const interval1 = setInterval(() => {
      if (TIME_REMAINING <= 0) {
        leavePage(navigate, taskId, userId);
      }
      TIME_REMAINING = TIME_REMAINING - 1;
      fetch('/scheduler/user/set-task-time/' + taskId + '/' + userId + '/' + TIME_REMAINING.toString(), {
        method: 'GET',
        headers: {'relia-secret': 'password'}
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("Time updated");
      })
      .catch((error) => {
        console.log(error);
      });
      if (RECEIVER_FLAG != "" && TRANSMITTER_FLAG != "" && COMBINED_FLAG == 0) {
        loadUI(RECEIVER_FLAG, TRANSMITTER_FLAG, taskId, userId);
        COMBINED_FLAG = 1;
      }
      fetch('/scheduler/user/tasks/poll/' + taskId, {
        method: 'GET',
        headers: {'relia-secret': 'password'}
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("Set user as active");
      })
      .catch((error) => {
        console.log(error);
      });
    }, TIMEFRAME_MS);

    const interval2 = setInterval(() => {
      let taskToSearch = '/scheduler/user/tasks/' + taskId + '/' + userId;
      return fetch(taskToSearch, {
        method: 'GET',
        headers: {'relia-secret': 'password'}
      })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.success == false) {
          console.log("Uh oh... are you sure you are logged in?");
        } else {
          status = responseJson.status;
          const status_bar = ReactDOM.createRoot(document.getElementById("statusBar"));
          let status_to_render = [];
          status_to_render.push(<div>Task {taskId} is {status}<br /></div>);
          status_to_render.push(<div>Time Remaining: {TIME_REMAINING} seconds</div>);
          status_bar.render(status_to_render);
          if (RECEIVER_FLAG == "") {
            if (status == "receiver assigned" || status == "receiver still processing" || status == "fully assigned") {
              RECEIVER_FLAG = responseJson.receiver;
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
    }, TIMEFRAME_MS);

    const interval3 = setInterval(() => {
      let taskToSearch = '/scheduler/user/tasks/' + taskId + '/' + userId;
      return fetch(taskToSearch, {
        method: 'GET',
        headers: {'relia-secret': 'password'}
      })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.success == false) {
          console.log("Uh oh... are you sure you are logged in?");
        } else {
          status = responseJson.status;
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
    }, TIMEFRAME_MS);

    return () => {
      let script = document.getElementById('googleChartsScript');
      if (script) {
        script.remove();
      }
    }
  }, [google]);

  const handleNavigate = ev => {
    ev.preventDefault();
    leavePage(navigate, taskId, userId);
  };

  const reschedule = ev => {
    ev.preventDefault();
    fetch('/scheduler/user/complete-tasks/' + taskId + '/' + userId, {
      method: 'GET',
      headers: {'relia-secret': 'password'}
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson.status);
    }).catch((error) => {
      console.log(error);
    });

    let object = {
       "r_filename": receiverName,
       "t_filename": transmitterName,
       "priority": 10
    };

    fetch('/user/route/' + userId, {
       method: 'POST',
       headers: {'relia-secret': 'password'},
       body: JSON.stringify(object),
    }).then((response) => response.json())
    .then((responseJson) => {
       if (responseJson.success) {
          window.location.href = '/loaderDevelopment/' + userId + '/' + responseJson.taskIdentifier + '/' + receiverName + '/' + transmitterName;
       }
    });
  };

  return (
    <div className="App">
    <div id="statusBar"></div>
  
    <div id="all-together" class="row"></div>

    <form onClick={handleNavigate}><div>
    <button class="btn btn-lg btn-primary" id="runButton">Return to File Upload</button>
    </div></form>

    <form onClick={reschedule}><div>
    <button class="btn btn-lg btn-primary" id="runButton">Reschedule</button>
    </div></form>
	
    <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossorigin="anonymous"></script>
    </div>
  );

};

function leavePage(navigate, taskId, userId) {
    fetch('/scheduler/user/complete-tasks/' + taskId + '/' + userId, {
      method: 'GET',
      headers: {'relia-secret': 'password'}
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson.status);
      navigate('/loader')
    }).catch((error) => {
      console.log(error);
    });
}

function loadUI(deviceId_r, deviceId_t, taskId, userId) {
    const interval4 = setInterval(() => {
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
          fetch('/scheduler/user/complete-tasks/' + taskId + '/' + userId, {
            method: 'GET',
            headers: {'relia-secret': 'password'}
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
    }, TIMEFRAME_MS);
}

export default LoaderDevelopment;
