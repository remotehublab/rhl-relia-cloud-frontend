import './App.css';
import $ from 'jquery';
import React, { useEffect, useState }  from 'react';
import { ReliaWidgets } from "./components/blocks/loader.js";
import ReactDOM from 'react-dom/client';
import  { Redirect, useNavigate, useParams } from 'react-router-dom';

const TIMEFRAME_MS = 30000;
const TIMEFRAME2_MS = 1000;
var STEPPER = 0;
var RECEIVER_FLAG = 0;
var TRANSMITTER_FLAG = 0;
var TIME_REMAINING = 60;
var SESSION_ID = '';
  
const LoaderDevelopment = () => {
  window.API_BASE_URL = "/api/";
  window.SCHEDULER_BASE_URL = "/scheduler/";
  window.RECEIVER_DISPLAYED = 0;
  window.TRANSMITTER_DISPLAYED = 0;
  const [google] = useState(null);
  const navigate = useNavigate();
  const { userId, taskId } = useParams();
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

    const interval = setInterval(() => {
      if (TIME_REMAINING <= 0) {
        fetch('/scheduler/user/complete-tasks/' + taskId + '/' + userId, {
          method: 'GET',
          headers: {'relia-secret': 'password'}
        })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson.status);
          navigate('/loader')
        })
        .catch((error) => {
          console.log(error);
        });
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
    }, TIMEFRAME2_MS);

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
          SESSION_ID = responseJson.session_id;
          status = responseJson.status;
          const status_bar = ReactDOM.createRoot(document.getElementById("statusBar"));
          let status_to_render = [];
          status_to_render.push(<div>Task {taskId} is {status}<br /></div>);
          status_to_render.push(<div>Time Remaining: {TIME_REMAINING} seconds</div>);
          status_bar.render(status_to_render);
          if (RECEIVER_FLAG == 0) {
            if (status == "receiver assigned" || status == "receiver still processing" || status == "fully assigned") {
              RECEIVER_FLAG = 1;
              loadUIReceiver(responseJson.receiver);    
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
    }, TIMEFRAME2_MS);

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
          if (TRANSMITTER_FLAG == 0) {
            if (status == "transmitter still processing" || status == "fully assigned") {
              TRANSMITTER_FLAG = 1;
              loadUITransmitter(responseJson.transmitter);    
            }
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
    }, TIMEFRAME2_MS);

    return () => {
      let script = document.getElementById('googleChartsScript');
      if (script) {
        script.remove();
      }
    }
  }, [google]);

  const handleNavigate = ev => {
    ev.preventDefault();
    fetch(window.SCHEDULER_BASE_URL + 'user/complete-tasks/' + taskId + '/' + userId, {
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
  };

  return (
    <div className="App">
    <div id="statusBar"></div>
  
    <div id="all-together-transmitter" class="row"></div>
    <div id="all-together-receiver" class="row"></div>

    <form onClick={handleNavigate}><div>
    <button class="btn btn-lg btn-primary" id="runButton">Return to File Upload</button>
    </div></form>
	
    <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossorigin="anonymous"></script>
    </div>
  );

};

function loadUITransmitter(device_id) {
    const interval5 = setInterval(() => {
      if (window.TRANSMITTER_DISPLAYED == 0) {
        var widgets = new ReliaWidgets($("#all-together-transmitter"), device_id, "transmitter");
      }
    }, TIMEFRAME2_MS);
}

function loadUIReceiver(device_id) {
    const interval5 = setInterval(() => {
      if (window.RECEIVER_DISPLAYED == 0) {
        var widgets2 = new ReliaWidgets($("#all-together-receiver"), device_id, "receiver");
      }
    }, TIMEFRAME2_MS);
}

export default LoaderDevelopment;
