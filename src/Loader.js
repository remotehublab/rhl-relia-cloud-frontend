import './App.css';
import './Loader.css';
import $ from 'jquery';
import React, { useEffect, useState }  from 'react';
import Main from './components/main';
import { ReliaWidgets } from "./components/blocks/loader.js";
import ReactDOM from 'react-dom/client';
import  { Redirect, useNavigate } from 'react-router-dom';
  
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

    return () => {
      let script = document.getElementById('googleChartsScript');
      if (script) {
        script.remove();
      }
    }
  }, [google]);

  return (
    <div className="App">
    Loader environment (Brian)
    <div className="invisible">{JSON.stringify(getAuthentication())}</div>
    <div className="invisible">{JSON.stringify(getTransactions())}</div>
    <br />
    Most Recent Transmitter Files
    <div id="app2"></div>
    Most Recent Receiver Files
    <div id="app3"></div>
    <div><Main /></div>
    <div id="all-together"></div>
	
    <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossOrigin="anonymous"></script>
    </div>
  );
};

function loadUI () {
    var widgets = new ReliaWidgets($("#all-together"));
}

function getAuthentication() {
   const navigate = useNavigate();
   return fetch('/user/auth')
   .then((response) => response.json())
   .then((responseJson) => {
      if (responseJson.auth == false) {
         console.log('Time to move');
         navigate('/login')
      }
      return responseJson;
   })
   .catch((error) => {
     console.error(error);
   });
}

function getTransactions() {
   const PrettyPrintJson = ({data}) => (<div><pre>{JSON.stringify(data, null, 2)}</pre></div>);
   return fetch('/user/transactions')
   .then((response) => response.json())
   .then((responseJson) => {
      if (responseJson.success == false) {
         console.log("Uh oh... are you sure you are logged in?");
      }
      const root = ReactDOM.createRoot(document.getElementById("app2"));
      let listLinks = [];
      for (let i = 0; i < responseJson.transmitter_files.length; i++) {
         const url_link = '/user/transactions/' + responseJson.username + '/transmitter/' + responseJson.transmitter_files[i];
         listLinks.push(<div><a href= {url_link} download> {responseJson.transmitter_files[i]} </a><br /></div>);
      }
      root.render(listLinks);
      const root2 = ReactDOM.createRoot(document.getElementById("app3"));
      let listLinks2 = [];
      for (let i = 0; i < responseJson.receiver_files.length; i++) {
         const url_link = '/user/transactions/'  + responseJson.username + '/receiver/' + responseJson.receiver_files[i];
         listLinks2.push(<div><a href= {url_link} download> {responseJson.receiver_files[i]} </a><br /></div>);
      }
      root2.render(listLinks2);
      return responseJson
   })
   .catch((error) => {
     console.error(error);
   });
}

  
export default Loader;
