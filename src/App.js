import './App.css';
import React, { useEffect, useState }  from 'react';
import { ReliaTimeSink, ReliaConstellationSink, ReliaVectorSink} from "./relia.js";

function App() {

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
    Hello!
    <div id="const-demo"></div>
    <div id="const-demo2"></div>
    <div id="time-demo"></div>
    <div id="time-demo2"></div>
    <div id="vector-demo"></div>
	
    <script src="https://code.jquery.com/jquery-2.2.4.min.js" crossorigin="anonymous"></script>
    <script type="text/javascript">
      window.API_BASE_URL = url_for('api.index');
    </script>
    </div>
  );
}

function loadUI () {
  loadReliaTimeSink(); 
  loadReliaConstellationSink();
  //loadReliaVectorSink();
}

function loadReliaTimeSink() {
  var sink = new ReliaTimeSink("time-demo", "my-device-id", "RELIA Time Sink(1)");
  sink.redraw();

  var sink2 = new ReliaTimeSink("time-demo2", "my-device-id", "RELIA Time Sink(1)");
  sink2.redraw();/**/
}

function loadReliaConstellationSink() {
  var sink = new ReliaConstellationSink("const-demo", "my-device-id", "RELIA Constellation Sink(2)");
  sink.redraw();

  /*var sink2 = new ReliaConstellationSink("const-demo2", "my-device-id", "RELIA Constellation Sink(2)");
  sink2.redraw();/**/
}
  
function loadReliaVectorSink() {
  var sink = new ReliaVectorSink("vector-demo", "my-device-id", "RELIA Vector Sink(1)");
  sink.redraw();

  /*var sink2 = new ReliaConstellationSink("const-demo2", "my-device-id", "RELIA Constellation Sink(2)");
  sink2.redraw();/**/
}

export default App;