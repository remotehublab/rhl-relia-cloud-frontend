import './App.css';
import './Loader.css';
import $ from 'jquery';
import React, { useEffect, useState }  from 'react';
import { Dimensions } from 'react-native';
import Collapsible from 'react-collapsible';
import { BsChevronDown } from "react-icons/bs";
import { ReliaWidgets } from "./components/blocks/loader.js";
import ReactDOM from 'react-dom/client';
import  { Redirect, useNavigate } from 'react-router-dom';
import RHL_logo from './components/images/RHL_logo.png';
import LabsLand_logo from './components/images/LabsLand_logo.png';
import Background_logo from './components/images/Background.png';
  
var transmitterName = '';
var transmitterContents = '';
var receiverName = '';
var receiverContents = '';
var userid = '';

const TIMEFRAME_MS = 30000;
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
    $(".container").css("padding-bottom", "+=20");

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
    <div className="App" style={{ backgroundColor: '#e7f3fe', height: '100%', minHeight: '100vh' }}>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200&display=swap" rel="stylesheet" /> 
    <div className="invisible">{JSON.stringify(poll_call())}</div>
    <div className="invisible">{JSON.stringify(getTransactions())}</div>
    <div className="invisible">{JSON.stringify(getCurrentTasks())}</div>
    <div className="invisible">{JSON.stringify(getErrorMessages())}</div>

    <div class="heading">
        RELIA
    </div>

    <div class="container">

        <br />
        <br />
        <br />

        <div class="row">
          <Collapsible trigger={<div id="space"><div>Upload Tasks</div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#6eb9f7' }}>
            <Main />
          </Collapsible>
        </div>

	<div class="row">
          <Collapsible trigger={<div id="space2"><div>Submit Tasks</div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#3da2f5' }}>
            <div id="body2">
            <br />
            <div class="row">
              <div class="column">
                Most Recent Transmitter Files
                <div id="appTransmitter"></div>
	      </div>

              <div class="column">
                Most Recent Receiver Files
                <div id="appReceiver"></div>
              </div>
            </div>

            <div class="col-xs-12 col-sm-4 offset-sm-4">
              <form onSubmit={handleUserAPI}><div>
	        <button class="btn btn-lg btn-primary" id="runButton" disabled>Run the files</button>
              </div></form>
              <br />
	    </div>
            </div>
          </Collapsible>
	</div>

        <div class="row">
          <Collapsible trigger={<div id="space3"><div>Delete Tasks</div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#0d8bf2' }}>
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
          <Collapsible trigger={<div id="space4"><div>Search Task Status</div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#0a6fc2' }}>
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
          <Collapsible trigger={<div id="space5"><div>Most Recent Tasks</div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#085391' }}>
            <div id="currentTasks"></div>
          </Collapsible>
        </div>
        
        <div class="row">
          <Collapsible trigger={<div id="space6"><div>Most Recent Error Messages</div><div><BsChevronDown /></div></div>} triggerStyle={{ color: '#FFFFFF', background: '#053861' }}>
            <div id="errorMessages"></div>
          </Collapsible>
        </div>

    </div>

    <div class="footer">
         <img src={RHL_logo} alt={"Remote Hub Lab, University of Washington"} style={{width: 0.1 * width, aspectRatio: 1.5536159601, resizeMode: 'contain'}} />
         <img src={LabsLand_logo} alt={"The LabsLand Network"} style={{width: 0.1 * width, aspectRatio: 1.69142857143, resizeMode: 'contain'}} />
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
        <div class="column">
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
      </div>
      <br />
      </div>
    );
  }
}

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
      "altId": "None",
   };

   fetch('/user/route/' + userid, {
      method: 'POST',
      body: JSON.stringify(object),
   }).then((response) => response.json())
   .then((responseJson) => {
      if (responseJson.success) {
         window.location.href = '/loaderDevelopment/' + responseJson.altIdentifier;
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
         tasksToRender.push(<div>{"Task " + responseJson.ids[i] + " is " + responseJson.statuses[i] + " with" + receiver_string + "and" + transmitter_string + ".\n"}</div>);
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
