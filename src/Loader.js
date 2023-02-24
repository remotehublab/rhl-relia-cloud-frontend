import './App.css';
import './Loader.css';
import $ from 'jquery';
import React, { useEffect, useState }  from 'react';
import { ReliaWidgets } from "./components/blocks/loader.js";
import ReactDOM from 'react-dom/client';
import  { Redirect, useNavigate } from 'react-router-dom';
  
var transmitterName = '';
var transmitterContents = '';
var receiverName = '';
var receiverContents = '';
var userid = '';

const TIMEFRAME_MS = 30000;

const Loader = () => {
  window.API_BASE_URL = "/api/";
  const [google] = useState(null);
  const navigate = useNavigate();

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

    const interval = setInterval(() => {
      poll_call(navigate);
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
    <div className="App">
    <div className="invisible">{JSON.stringify(poll_call(navigate))}</div>
    <div className="invisible">{JSON.stringify(getTransactions())}</div>
    <div className="invisible">{JSON.stringify(getCurrentTasks())}</div>
    <div className="invisible">{JSON.stringify(getErrorMessages())}</div>
    <br />

    <div class="container">

	<div class="row">

		<div class="col-xs-12 col-sm-6 col-lg-4 offset-lg-2">
		    Most Recent Transmitter Files
		    <div id="appTransmitter"></div>
		</div>

		<div class="col-xs-12 col-sm-6 col-lg-4">
		    Most Recent Receiver Files
		    <div id="appReceiver"></div>
		</div>
	</div>
	
	<Main />

        <div class="row">
        Search Task Status
        <label> Search Status of Task No. </label> <span><input className="textInput" type="text" id="to_search" name="to_search"/></span>
        <form onSubmit={searchTasks}><div>
	   <button id="searchButton">Search</button>
        </div></form>
        </div>
        <div class="row">
        <div id="currentTasks"></div>
        </div>
        <div class="row">
        <div id="errorMessages"></div>
        </div>

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


  handleUploadGRC_transmitter(ev) {

    const data = new FormData();
    data.append('file', this.uploadInput_transmitter.files[0]);

    fetch('/user/upload/transmitter', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ grcURL: `/${body.file}` });
      });
    });

    setTimeout(window.location.reload(true), 1000);
  }

  handleUploadGRC_receiver(ev) {

    const data = new FormData();
    data.append('file', this.uploadInput_receiver.files[0]);

    fetch('/user/upload/receiver', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ grcURL: `/${body.file}` });
      });
    });

    setTimeout(window.location.reload(true), 1000);
  }

  handleUserAPI(ev) {
    let object = {
       "grc_files": {
          "receiver": {
              "filename": receiverName,
              "content": receiverContents
          },
          "transmitter": {
             "filename": transmitterName,
             "content": transmitterContents
          },
       },
       "priority": 10,
       "session_id": "session_id1"
    };

    fetch('/user/route/' + userid, {
       method: 'POST',
       headers: {'relia-secret': 'password'},
       body: JSON.stringify(object),
    }).then((response) => response.json())
    .then((responseJson) => {
       console.log(responseJson.taskIdentifier);
    });
  }

  handleCancellation(ev) {
    let taskToCancel = document.getElementById('to_cancel').value + "/" + userid;
    let object = {
        "action": "delete",
    };

    fetch('/scheduler/user/tasks/' + taskToCancel, {
       method: 'POST',
       headers: {'relia-secret': 'password'},
       body: JSON.stringify(object),
    }).then((response) => {
       console.log(taskToCancel);
    });

    window.location.reload(true);
  }

  render() {
    return (
      <div>
      <div class="row">
      <div class="col-xs-12 col-sm-6 col-lg-4 offset-lg-2">
      <form onSubmit={this.handleUploadGRC_transmitter}>
        Transmitter File
        <div>
          <input ref={(ref) => { this.uploadInput_transmitter = ref; }} type="file" accept=".grc"/>
        </div>
        <div>
          <button>Upload</button>
        </div>
     </form>
     </div>
     <div class="col-xs-12 col-sm-6 col-lg-4">
     <form onSubmit={this.handleUploadGRC_receiver}>
        Receiver File
        <div>
          <input ref={(ref) => { this.uploadInput_receiver = ref; }} type="file" accept=".grc"/>
        </div>
        <div>
          <button>Upload</button>
        </div>
      </form>
      </div>
      <br />
      <br />
      </div>
      <div class="row">
	<div class="col-xs-12 col-sm-4 offset-sm-4">
        <form onSubmit={this.handleUserAPI}><div>
	   <button class="btn btn-lg btn-primary" id="runButton" disabled>Run the files</button>
        </div></form>
	</div>
      </div>
      <div class="row">
        <label> Cancel Task No. </label> <span><input className="textInput" type="text" id="to_cancel" name="to_cancel"/></span>
        <form onSubmit={this.handleCancellation}><div>
	   <button id="cancelButton">Cancel</button>
        </div></form>
      </div>
      </div>
    );
  }
}

function loadUI() {
    // var widgets = new ReliaWidgets($("#all-together"));
}

async function poll_call(navigate) {
   return fetch('/user/poll')
   .then((response) => response.json())
   .then((responseJson) => {
      if (responseJson.success == false) {
         console.log('Time to move');
         navigate('/login')
      }
      userid = responseJson.user_id;
      return responseJson;
   })
   .catch((error) => {
     console.error(error);
   });
}

async function searchTasks() {
    const navigate = useNavigate();
    await poll_call(navigate);
    let taskToSearch = '/scheduler/user/tasks/' + document.getElementById('to_search').value + '/' + userid;
    return fetch(taskToSearch, {
       method: 'GET',
       headers: {'relia-secret': 'password'}
    })
    .then((response) => response.json())
    .then((responseJson) => {
       if (responseJson.success == false) {
          console.log("Uh oh... are you sure you are logged in?");
       } else {
          alert(responseJson.status);
       }
    })
    .catch((error) => {
       console.log(error);
    });

}

async function getCurrentTasks() {
   const navigate = useNavigate();
   await poll_call(navigate);
   return fetch('/scheduler/user/all-tasks/' + userid, {
      method: 'GET',
      headers: {'relia-secret': 'password'}
   })
   .then((response) => response.json())
   .then((responseJson) => {
      if (responseJson.success == false) {
          console.log("Uh oh... are you sure you are logged in?");
      }
      const rootTasks = ReactDOM.createRoot(document.getElementById("currentTasks"));
      let tasksToRender = [];
      if (responseJson.ids.length > 0) {
         tasksToRender.push(<div><b>All Tasks</b>{"\n"}</div>);
      }
      for (let i = 0; i < responseJson.ids.length; i++) {
         tasksToRender.push(<div>{"Task " + responseJson.ids[i] + " is " + responseJson.statuses[i] + " with receiver " + responseJson.receivers[i] + " and transmitter " + responseJson.transmitters[i] + ".\n"}</div>);
      }
      rootTasks.render(tasksToRender);
      return responseJson
   })
   .catch((error) => {
     console.error(error);
   });
}

async function getErrorMessages() {
   const navigate = useNavigate();
   await poll_call(navigate);
   return fetch('/scheduler/user/error-messages/' + userid, {
       method: 'GET',
       headers: {'relia-secret': 'password'}
   })
   .then((response) => response.json())
   .then((responseJson) => {
     if (responseJson.success == false) {
         console.log("Uh oh... are you sure you are logged in?");
     }
     const rootTasks = ReactDOM.createRoot(document.getElementById("errorMessages"));
     let errorsToRender = [];
     if (responseJson.ids.length > 0) {
         errorsToRender.push(<div><b>Most Recent Error Messages</b>{"\n"}</div>);
     }
     for (let i = 0; i < responseJson.ids.length; i++) {
         errorsToRender.push(<div>{"Task " + responseJson.ids[i] + " encountered the following error: " + responseJson.errors[i] + "\n"}</div>);
     }
     rootTasks.render(errorsToRender);
     return responseJson
   })
   .catch((error) => {
     console.error(error);
   });
}

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
  
export default Loader;
