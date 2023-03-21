import './App.css';
import './Loader.css';
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

var userId = "";
var taskId = "";
var receiverName = "";
var transmitterName = "";
  
const LoaderDevelopment = () => {
  window.API_BASE_URL = "/api/";
  window.BLOCKS = new Map();
  window.TIMES = new Map();
  const [google] = useState(null);
  const navigate = useNavigate();
  const { altIdentifier } = useParams();
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

    (async () => {
      let object0 = {
        "altIdentifier": altIdentifier
      };

      await fetch('/user/decode-alt-identifier', {
        method: 'POST',
        body: JSON.stringify(object0),
      }).then((response) => response.json())
      .then((responseJson) => {
        console.log("Task ID is: " + responseJson.taskId);
        userId = responseJson.userId;
        taskId = responseJson.taskId;
        receiverName = responseJson.receiver;
        transmitterName = responseJson.transmitter;
      })
      .catch((error) => {
        console.log(error);
      });

      let object = {
        "task": taskId
      };

      await fetch('/user/get-task-time', {
        method: 'POST',
        body: JSON.stringify(object),
      }).then((response) => response.json())
      .then((responseJson) => {
        TIME_REMAINING = parseInt(responseJson.timeRemaining);
      })
      .catch((error) => {
        console.log(error);
      });

      const interval1 = setInterval(() => {
        // if (TIME_REMAINING <= 0) {
        //  leavePage(navigate, taskId, userId);
        // }
        TIME_REMAINING = TIME_REMAINING + 1;
        let object = {
          "task": taskId,
          "time": TIME_REMAINING.toString()
        };
        fetch('/user/set-task-time', {
          method: 'POST',
          body: JSON.stringify(object),
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
        let object2 = {
          "task": taskId
        };
        fetch('/user/scheduler-poll', {
          method: 'POST',
          body: JSON.stringify(object2),
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
      }, TIMEFRAME_MS);

      const interval2 = setInterval(() => {
        let object = {
          "task": taskId,
          "user": userId
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
            status = responseJson.status;
            const status_bar = ReactDOM.createRoot(document.getElementById("statusBar"));
            let status_to_render = [];
            status_to_render.push(<div>Task {taskId} is {status}<br /></div>);

            let timeString = "";
            let time_baseline = TIME_REMAINING;
            let days = parseInt(TIME_REMAINING / (24 * 3600));
            if (days > 0) {
              timeString = days.toString() + " days, ";
            }
            TIME_REMAINING = TIME_REMAINING % (24 * 3600);
            let hours = parseInt(TIME_REMAINING / 3600);
            if (hours > 0) {
              timeString = timeString + hours.toString() + " hours, ";
            }
            TIME_REMAINING = TIME_REMAINING % 3600;
            let minutes = parseInt(TIME_REMAINING / 60);
            if (minutes > 0) {
              timeString = timeString + minutes.toString() + " minutes, ";
            }
            TIME_REMAINING = TIME_REMAINING % 60;
            timeString = timeString + TIME_REMAINING.toString() + " seconds";
            status_to_render.push(<div>Time Elapsed: {timeString}</div>);
            TIME_REMAINING = time_baseline;
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
      }, TIMEFRAME_MS);

      return () => {
        let script = document.getElementById('googleChartsScript');
        if (script) {
          script.remove();
        }
      }

    })();
  }, [google]);

  const handleNavigate = ev => {
    ev.preventDefault();
    leavePage(navigate, taskId, userId);
  };

  const reschedule = async (ev) => {
    ev.preventDefault();
    let object0 = {
      "task": taskId,
      "user": userId
    };

    await fetch('/user/deletion', {
      method: 'POST',
      body: JSON.stringify(object0),
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
       "priority": 10,
       "taskId": taskId,
       "altId": altIdentifier,
    };

    FIVE_SECOND_FLAG = 0;
    if (TRANSMITTER_FLAG != "") {
      let t_length = window.TIMES.get(TRANSMITTER_FLAG).length;
      for (let i = 0; i < t_length; i++) {
        window.TIMES.get(TRANSMITTER_FLAG)[i] = 10;
      }
    }
    if (RECEIVER_FLAG != "") {
      let r_length = window.TIMES.get(RECEIVER_FLAG).length;
      for (let j = 0; j < r_length; j++) {
        window.TIMES.get(RECEIVER_FLAG)[j] = 10;
      }
    }

    fetch('/user/route/' + userId, {
       method: 'POST',
       body: JSON.stringify(object),
    }).then((response) => response.json())
    .then((responseJson) => {
       // if (responseJson.success) {
       //   window.location.href = '/loaderDevelopment/' + responseJson.altIdentifier;
       // }
    });
  };

  return (
    <div className="App" style={{ backgroundColor: '#e7f3fe', height: '100%', minHeight: '100vh' }}>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200&display=swap" rel="stylesheet" /> 
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
    let object = {
      "task": taskId
    };
    fetch('/user/complete-tasks', {
      method: 'POST',
      body: JSON.stringify(object),
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
          let object = {
            "task": taskId
          };
          fetch('/user/complete-tasks', {
            method: 'POST',
            body: JSON.stringify(object),
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
