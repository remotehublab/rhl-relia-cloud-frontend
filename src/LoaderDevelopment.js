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
var TIME_REMAINING = 30;
  
const LoaderDevelopment = () => {
  window.API_BASE_URL = "/api/";
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

    const interval = setInterval(() => {
      if (STEPPER == 1) {
        navigate('/loader')
      }
      STEPPER = STEPPER + 1;
    }, TIMEFRAME_MS);

    const interval2 = setInterval(() => {
      TIME_REMAINING = TIME_REMAINING - 1;
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
              loadUIReceiver(responseJson.transmitter);    
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
    navigate('/loader');
  };

  return (
    <div className="App">
    <div id="statusBar"></div>
  
    <div id="all-together-transmitter" class="row"></div>
    <div id="all-together-receiver" class="row"></div>

    <form onSubmit={handleNavigate}><div>
    <button class="btn btn-lg btn-primary" id="runButton">Return to File Upload</button>
    </div></form>
	
    <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossorigin="anonymous"></script>
    </div>
  );

};

function loadUITransmitter(device_id) {
    var widgets = new ReliaWidgets($("#all-together-transmitter"), device_id);
}

function loadUIReceiver(device_id) {
    var widgets2 = new ReliaWidgets($("#all-together-receiver"), device_id);
}

export default LoaderDevelopment;
