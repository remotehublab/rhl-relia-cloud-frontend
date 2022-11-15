import './App.css';
import $ from 'jquery';
import React, { useEffect, useState }  from 'react';
import Main from './components/main';
import { ReliaWidgets } from "./components/blocks/loader.js";
import  { Redirect, useNavigate } from 'react-router-dom';
  
const Loader = () => {
  window.API_BASE_URL = "http://localhost:3000/api/";
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
    <div>{JSON.stringify(getAuthentication())}</div>
    <div><Main /></div>
    <div id="all-together"></div>
	
    <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossorigin="anonymous"></script>
    </div>
  );

};

function loadUI () {
    var widgets = new ReliaWidgets($("#all-together"));
}

function getAuthentication() {
   const navigate = useNavigate();
   return fetch('http://localhost:6003/user/auth')
   .then((response) => response.json())
   .then((responseJson) => {
      if (responseJson.auth == false) {
         console.log('Time to move');
         navigate('/login')
      }
      return JSON.parse(responseJson);
   })
   .catch((error) => {
     console.error(error);
   });
}

  
export default Loader;
