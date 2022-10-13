import $ from 'jquery';
import useScript from './useScript';

function Relia() {

}

export function ReliaWidgets($divElement) {
	var self = this;
	var devicesUrl = window.API_BASE_URL + "data/current/devices";
	self.blocks = [];

	$.get(devicesUrl).done(function (data) {
		if (!data.success) {
			// TODO
			console.log("Error loading devices:", data);
			return;
		}

		var devices = data.devices;
		$.each(devices, function (pos, deviceName) {
			var blocksUrl = window.API_BASE_URL + "data/current/devices/" + deviceName + "/blocks";
			$.get(blocksUrl).done(function (data) {
				if (!data.success) {
					// TODO
					console.log("Error loading blocks:", data);
					return;
				}
				$.each(data.blocks, function (post, blockName) {
					var $newDiv = $("<div></div>");
					$divElement.append($newDiv);
					console.log("Loading...", deviceName, blockName);
					if (blockName.startsWith("RELIA Constellation Sink")) {
						var constellationSink = new ReliaConstellationSink($newDiv, deviceName, blockName);
						self.blocks.push(constellationSink);
						constellationSink.redraw();
						
					} else if (blockName.startsWith("RELIA Time Sink")) {
						var timeSink = new ReliaTimeSink($newDiv, deviceName, blockName);
						self.blocks.push(timeSink);
						timeSink.redraw();
					} else if (blockName.startsWith("RELIA Vector Sink")) {
						var vectorSink = new ReliaVectorSink($newDiv, deviceName, blockName);
						self.blocks.push(vectorSink);
						vectorSink.redraw();
					};
				});
			});
		});
	});
}

function ReliaTimeSink($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<h3>Time Sink " + blockIdentifier + " of " + deviceIdentifier + "</h3>" +
	    "<div class=\"time-chart\" style=\"width: 900px; height: 500px\"></div>\n" +
	    "<div class=\"Checkbox_TimeSink_OnOffSignal\">" +
	        "<input type=\"checkbox\" class=\"checkbox time-sink-grid-checkbox\" checked> Grid<br>" +
	        "<input type=\"checkbox\" class=\"checkbox time-sink-real-checkbox\" checked> Real<br>" +
	        "<input type=\"checkbox\" class=\"checkbox time-sink-imag-checkbox\" checked> Imag<br>" +

	        "<input type=\"submit\" name=\"checkout\" class=\"button zoom-in-button\" value=\"Zoom In\"> <br>" +
	        "<input type=\"submit\" name=\"checkout\" class=\"button zoom-out-button\" value=\"Zoom Out\"> <br>" +
	        "<input type=\"submit\" name=\"checkout\" class=\"button autoscale-button\" value=\"Zoom AutoScale\"> <br>" +
		"<br>" + 
		"<p>Add Noise</p>" +
	        //"<input type=\"range\" min=\"0\" max=\"100\" value=\"1\" onchange=\"TimeSink_NoiseSlide(this.value)\" <br>" +
	        "<input class=\"noise-slider\" type=\"range\" min=\"0\" max=\"100\" value=\"0\">" +
		"<p class=\"noise-slider-value\" value=\"1\"></p> <br>" +
		    "<input type=\"submit\" name=\"checkout\" class=\"button pause-button\" value=\"Pause/Run\"> <br>" +
		"<p>Amplitude</p>" +
	        //"<input type=\"range\" min=\"0\" max=\"100\" value=\"1\" onchange=\"TimeSink_NoiseSlide(this.value)\" <br>" +
	        "<input class=\"amplitude-slider\" type=\"range\" min=\"0\" max=\"100\" >" +
		"<p class=\"amplitude-slider-value\" value=\"1\"></p> " +
		"<p>Offset</p>" +
	        //"<input type=\"range\" min=\"0\" max=\"100\" value=\"1\" onchange=\"TimeSink_NoiseSlide(this.value)\" <br>" +
	        "<input class=\"offset-slider\" type=\"range\" min=\"0\" max=\"100\" >" +
		"<p class=\"offset-slider-value\" value=\"1\"></p> " +
		"<br>" + 



		"<form>" +
		"  <select class=\"TimeSink_NumberOfPoints2Plot\">" + 
		"    <option value=\"1024\"selected=\"selected\">1024 points</option>" + 
		"    <option value=\"64\" >64 points</option>" + 
		"    <option value=\"128\">128 points</option>" + 
		"    <option value=\"256\">256 points</option>" + 
		"    <option value=\"512\">512 points</option>" + 
		"    <option value=\"2048\">2048 points</option>" + 
		"    <option value=\"4096\">4096 points</option>" + 
		"  </select>" + 
		"</form>" +
	    "</div>"
	);
	
	var $constChartDiv = self.$div.find(".time-chart");
	self.$gridCheckbox = self.$div.find(".time-sink-grid-checkbox");
	self.$timesinkrealCheckbox = self.$div.find(".time-sink-real-checkbox");
	self.$timesinkimagCheckbox = self.$div.find(".time-sink-imag-checkbox");
	self.$nop2plot = self.$div.find(".TimeSink_NumberOfPoints2Plot");
	
	self.maxTimeSinkRe=1;
	self.minTimeSinkRe=1;
	self.zoomInTimeSink=1;
    self.zoomOutTimeSink=1;
    self.flagPauseRun=true;

//
	//self.redraw = function() {
	self.dynamicAmplitudeTimeVal = 0;
	self.$timeSinkAmplitudeSlider = self.$div.find(".amplitude-slider"); // <input>
	//self.$div.find(".frequency-slider").slider("option","max",10);	
	self.$timeSinkAmplitudeSliderValue = self.$div.find(".amplitude-slider-value"); // <p>

	self.changeTimeSinkAmplitudeSlider = function () {
		self.$timeSinkAmplitudeSliderValue.text(self.$timeSinkAmplitudeSlider.val());
  		self.dynamicAmplitudeTimeVal = self.$timeSinkAmplitudeSlider.val();

		$.ajax({
			type: "POST",
			url: self.url, 
			data: JSON.stringify({
				"dynamicAmplitudeTimeVal": self.dynamicAmplitudeTimeVal
			}),
			contentType: "application/json",
			dataType: "json"
		}).done(function () {
			// TBD
		});
	};
	self.changeTimeSinkAmplitudeSlider();

	self.$timeSinkAmplitudeSlider.change(self.changeTimeSinkAmplitudeSlider);
//
	//self.redraw = function() {
	self.dynamicOffsetTimeVal = 0;
	self.$timeSinkOffsetSlider = self.$div.find(".offset-slider"); // <input>
	//self.$div.find(".frequency-slider").slider("option","max",10);	
	self.$timeSinkOffsetSliderValue = self.$div.find(".offset-slider-value"); // <p>

	self.changeTimeSinkOffsetSlider = function () {
		self.$timeSinkOffsetSliderValue.text(self.$timeSinkOffsetSlider.val());
  		self.dynamicOffsetTimeVal = self.$timeSinkOffsetSlider.val();

		$.ajax({
			type: "POST",
			url: self.url, 
			data: JSON.stringify({
				"dynamicOffsetTimeVal": self.dynamicOffsetTimeVal
			}),
			contentType: "application/json",
			dataType: "json"
		}).done(function () {
			// TBD
		});
	};
	self.changeTimeSinkOffsetSlider();

	self.$timeSinkOffsetSlider.change(self.changeTimeSinkOffsetSlider);
//

	self.$div.find(".zoom-in-button").click(function() {
		self.zoomInTimeSink += 1;
	});
	self.$div.find(".zoom-out-button").click(function() {

		self.zoomOutTimeSink += 1;
	});
	self.$div.find(".autoscale-button").click(function() {
		self.zoomInTimeSink = 1;
		self.zoomOutTimeSink = 1;
	});

	self.noiseFactor = 0;
	self.$timeSinkNoiseSlider = self.$div.find(".noise-slider"); // <input>
	self.$timeSinkNoiseSliderValue = self.$div.find(".noise-slider-value"); // <p>

	self.changeTimeSinkNoiseSlider = function () {
		self.$timeSinkNoiseSliderValue.text(self.$timeSinkNoiseSlider.val());
  		self.noiseFactor = self.$timeSinkNoiseSlider.val()*(self.maxTimeSinkRe-self.minTimeSinkRe)/100;
	};
	self.changeTimeSinkNoiseSlider();

	self.$timeSinkNoiseSlider.change(self.changeTimeSinkNoiseSlider);
	
	self.$div.find(".pause-button").click(function() {
		if (self.flagPauseRun==true) self.flagPauseRun=false;
		else self.flagPauseRun=true;
	});/**/
	//self.$flagPauseRun="Run";

	//self.$TimeSinkPauseButton = document.getElementById("myButton1");	

	/*function RunPausePressed(el){
		if (el.value=='Pause') self.$flagPauseRun='Run';
		if (el.value=='Run') self.$flagPauseRun='Pause';
	}/**/
	


	self.chart = new window.google.visualization.LineChart($constChartDiv[0]);

	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

	self.redraw = function() {

		var GridColor='#808080';
			if(self.$gridCheckbox.is(':checked'))  {
				GridColor = '#808080'; }
			else { 
				GridColor = '#ffffff'; }
				
	/*	var ZoomIn_factor;
			if($("#time-sink-grid-checkbox").is(':checked'))  {
				GridColor = '#808080'; }
			else { 
				GridColor = '#ffffff'; }/**/
				

		self.options = {
			title: 'Time',
			curveType: 'function',
			legend: { position: 'bottom' },
			hAxis: {
				title: 'Time (milliseconds)',
				gridlines: {
				color: GridColor,
			}
			},
			vAxis: {
				viewWindow:{
					min: self.minTimeSinkRe*(self.zoomOutTimeSink/self.zoomInTimeSink),
					max: self.maxTimeSinkRe*(self.zoomOutTimeSink/self.zoomInTimeSink)
				},
				title: 'Amplitude',
				gridlines: {
				color: GridColor,
			}
	       },
		explorer: {
			actions: ['dragToZoom', 'rightClickToReset'],
			axis: 'horizontal',
			keepInBounds: true,
			maxZoomIn: 4.0,
		},
		colors: ['#e2431e', '#000000'],
		};
	
	
		$.get(self.url).done(function (data) {
			setTimeout(function () {
				self.redraw();
			});

			if (!data.success) {
				console.log("Error: " + data.message);
				return;
			}

			if (data.data == null) {
				console.log("No data");
				return;
			}

			var params = data.data.params;

			//console.log(data.data.block_type);
			//console.log(data.data.type);
			//console.log(params);
			//console.log(data.data.data);

			var realData = data.data.data.streams['0']['real'];
			
			var imagData = data.data.data.streams['0']['imag'];
			$.each(realData, function (pos, value) {
				realData[pos] = parseFloat(value);
			});
			$.each(imagData, function (pos, value) {
				imagData[pos] = parseFloat(value);
			});

			var enableReal;
        	if(self.$timesinkrealCheckbox.is(':checked'))  {
        		enableReal = true; }
        	else { 
        		enableReal = false; 
        		realData= new Array(realData.length).fill(null);
        	}
        		
			var enableImag;
        	if(self.$timesinkimagCheckbox.is(':checked'))  {
        		enableImag = true; }
        	else { 
        		enableImag = false; 
//        	 	imagData=Array(realData.length).fill(null);
        	 }
			if (!enableReal && !enableImag) {
				console.log("Error: activate real or imag");
				return;
			}
        		
			var columns = ["Point"];
		        self.options['series'] = {};

			var counter = 0;

			if (enableReal) {
				columns.push("Real");
				self.options.series[counter] = '#e2431e';
				counter++;
			}	
			if (enableImag) {
				columns.push("Imag");
				self.options.series[counter] = '#1c91c0';
			}

			console.log(self.options);

			var formattedData = [
				columns
			];
			
			var Number2plot = self.$nop2plot.val();
			var randomArr = Array.from({length: Number2plot}, () => Math.random()*2-1);

			var timePerSample = 1000.0 / params.srate; // in milliseconds


			self.minTimeSinkRe=realData[0];
			self.maxTimeSinkRe=realData[0];
			self.$min_TimeSink_Im=imagData[0];
			self.$max_TimeSink_Im=imagData[0];
			
			for (var pos = 0; pos < Number2plot	; ++pos) {
				var currentRow = [pos * timePerSample];
				if (enableReal){
					currentRow.push(realData[pos]+self.noiseFactor*randomArr[pos]);
					if(realData[pos] <self.minTimeSinkRe)
						self.minTimeSinkRe=realData[pos]; 
					if(realData[pos] >self.maxTimeSinkRe)
						self.maxTimeSinkRe=realData[pos] ;
				}
				if (enableImag)
					currentRow.push(imagData[pos]+self.noiseFactor*randomArr[pos]);
					if(imagData[pos] <self.$min_TimeSink_Im)
						self.$min_TimeSink_Im=imagData[pos]; 
					if(imagData[pos] >self.$max_TimeSink_Im)
						self.$max_TimeSink_Im=imagData[pos] ;

				formattedData.push(currentRow);
			}

			var dataTable = window.google.visualization.arrayToDataTable(formattedData);
			if( self.flagPauseRun==true)
				self.chart.draw(dataTable, self.options);
		});
	};

}

function ReliaConstellationSink ($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<h3>Constellation Sink " + blockIdentifier + " of " + deviceIdentifier + "</h3>" +
	    "<div class=\"const-chart\" style=\"width: 900px; height: 500px\"></div>\n" +
	    "<div class=\"Checkbox_ConstSink_OnOffSignal\">" +
	        "<input type=\"checkbox\" class=\"checkbox const-sink-grid-checkbox\" checked> Grid<br>" +
		    "<input type=\"submit\" name=\"checkout\" class=\"button pause-button\" value=\"Pause/Run\"> <br>" +
		
		"<form>" +
		"  <select class=\"ConstSink_NumberOfPoints2Plot\">" + 
		"    <option value=\"16\">16 points</option>" + 
		"    <option value=\"32\" >32 points</option>" + 
		"    <option value=\"64\">64 points</option>" + 
		"    <option value=\"128\">128 points</option>" + 
		"    <option value=\"256\"selected=\"selected\">256 points</option>" + 
		"    <option value=\"512\">512 points</option>" + 
		"    <option value=\"1024\">1024 points</option>" + 
		"  </select>" + 
		"</form>" +
	    "</div>"
	);

	var $constChartDiv = self.$div.find(".const-chart");
	self.$gridCheckbox = self.$div.find(".const-sink-grid-checkbox");
	self.$nop2plot = self.$div.find(".ConstSink_NumberOfPoints2Plot");
    self.flagPauseRun=true;

	self.$div.find(".pause-button").click(function() {
		if (self.flagPauseRun==true) self.flagPauseRun=false;
		else self.flagPauseRun=true;
	});/**/


    self.chart = new window.google.visualization.ScatterChart($constChartDiv[0]);

	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

	self.redraw = function() {
	
	var GridColor='#808080';
        	if(self.$gridCheckbox.is(':checked'))  {
        		GridColor = '#808080'; }
        	else { 
        		GridColor = '#ffffff'; }
        		
	var ZoomIn_factor;
        	if(self.$gridCheckbox.is(':checked'))  {
        		GridColor = '#808080'; }
        	else { 
        		GridColor = '#ffffff'; }
        		
	self.options = {
		title: 'Constellation Plot',
		pointSize: 3,
		curveType: 'function',
		legend: { position: 'bottom' },
		hAxis: {
			title: 'In - phase',
			gridlines: {
        		color: GridColor,
      		}
			
		},
		vAxis: {
			title: 'Quadrature',
			gridlines: {
        		color: GridColor,
      		}
        	},
        explorer: {
        	actions: ['dragToZoom', 'rightClickToReset'],
        	axis: 'horizontal',
        	keepInBounds: true,
        	maxZoomIn: 4.0,
        },
	};
	
	
		$.get(self.url).done(function (data) {
			setTimeout(function () {
				self.redraw();
			});

			if (!data.success) {
				console.log("Error: " + data.message);
				return;
			}

			if (data.data == null) {
				console.log("No data");
				return;
			}

			var params = data.data.params;

			//console.log(data.data.block_type);
			//console.log(data.data.type);
			//console.log(params);
			//console.log(data.data.data);

			var realData = data.data.data.streams['0']['real'];
			var imagData = data.data.data.streams['0']['imag'];
			$.each(realData, function (pos, value) {
				realData[pos] = parseFloat(value);
			});
			$.each(imagData, function (pos, value) {
				imagData[pos] = parseFloat(value);
			});

			var formattedData = [
				["", ""]
			];

			var Number2plot = self.$nop2plot.val();

			for (var pos = 0; pos < Number2plot; ++pos) {
				formattedData.push([ realData[pos], imagData[pos]]);
			}

			var dataTable = window.google.visualization.arrayToDataTable(formattedData);
			if( self.flagPauseRun==true)
				self.chart.draw(dataTable, self.options);
		});
	};

}




function ReliaVectorSink($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<h3>Frequency Sink " + blockIdentifier + " of " + deviceIdentifier + "</h3>" +
	    "<div class=\"vector-chart\" style=\"width: 900px; height: 500px\"></div>\n" +
	    "<div class=\"Checkbox_VectorSink_OnOffSignal\">" +
	        "<input type=\"checkbox\" class=\"checkbox vector-sink-grid-checkbox\" checked> Grid<br>" +
		"<br>" + 
		"<p>Center Frequency</p>" +
	        //"<input type=\"range\" min=\"0\" max=\"100\" value=\"1\" onchange=\"TimeSink_NoiseSlide(this.value)\" <br>" +
	        "<input class=\"frequency-slider\" type=\"range\" min=\"0\" max=\"100\" >" +
		"<p class=\"frequnecy-slider-value\" value=\"1\"></p> <br>" +
		"<br>" + 
	        "<input type=\"submit\" name=\"checkout\" class=\"button zoom-in-button-Vector\" value=\"Zoom In\"> <br>" +
	        "<input type=\"submit\" name=\"checkout\" class=\"button zoom-out-button-Vector\" value=\"Zoom Out\"> <br>" +
	        "<input type=\"submit\" name=\"checkout\" class=\"button autoscale-button-Vector\" value=\"Zoom AutoScale\"> <br>" +
		    "<input type=\"submit\" name=\"checkout\" class=\"button pause-button\" value=\"Pause/Run\"> <br>" +
		    "<input type=\"submit\" name=\"checkout\" class=\"button Inc-Average-button\" value=\"Average +\"> <br>" +
		    "<input type=\"submit\" name=\"checkout\" class=\"button Dec-Average-button\" value=\"Average -\"> <br>" +
	    "</div>"
	);
	
	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

	var $constChartDiv = self.$div.find(".vector-chart");
	self.$gridCheckbox = self.$div.find(".vector-sink-grid-checkbox");
	
	self.minVectorSink=1;
	self.minVectorSink=1;
	self.zoomfactor=0;    
	self.flagPauseRun=true;
    self.averageCounter=1;
    self.averageInput=1;
    self.averageBuffer=Array(1024).fill(0);

	//self.redraw = function() {
	self.frequencyFactor = 0;
	self.$vectorSinkFrequencySlider = self.$div.find(".frequency-slider"); // <input>
	//self.$div.find(".frequency-slider").slider("option","max",10);	
	self.$vectorSinkFrequencySliderValue = self.$div.find(".frequnecy-slider-value"); // <p>

	self.changeVectorSinkFrequencySlider = function () {
		self.$vectorSinkFrequencySliderValue.text(self.$vectorSinkFrequencySlider.val());
  		self.frequencyFactor = self.$vectorSinkFrequencySlider.val();

		$.ajax({
			type: "POST",
			url: self.url, 
			data: JSON.stringify({
				"frequencyFactor": self.frequencyFactor
			}),
			contentType: "application/json",
			dataType: "json"
		}).done(function () {
			// TBD
		});
	};
	self.changeVectorSinkFrequencySlider();

	self.$vectorSinkFrequencySlider.change(self.changeVectorSinkFrequencySlider);


	self.$div.find(".Inc-Average-button").click(function() {
		self.averageInput += 1;
	});

	self.$div.find(".Dec-Average-button").click(function() {
		self.averageInput -= 1;
		if (self.averageInput<1) self.averageInput = 1;
	});

	self.$div.find(".zoom-in-button-Vector").click(function() {
		if(self.maxVectorSinkRe -self.minVectorSinkRe>2){
	
			self.zoomfactor -= 1;
			if(self.zoomfactor>0) // to zoom outs
			{	self.maximumView=Math.ceil(self.maxVectorSinkRe + (self.maxVectorSinkRe -self.minVectorSinkRe)*Math.pow(2,self.zoomfactor)/8);
				self.minimumView=Math.floor(self.minVectorSinkRe - (self.maxVectorSinkRe -self.minVectorSinkRe)*Math.pow(2,self.zoomfactor)/8);
			}
			if(self.zoomfactor==0) 
			{	self.maximumView=Math.ceil(self.maxVectorSinkRe);
				self.minimumView=Math.floor(self.minVectorSinkRe);
			}
			if(self.zoomfactor<0) // to zoom in
				var temp=(self.maxVectorSinkRe -self.minVectorSinkRe)/(2*Math.pow(2,Math.abs(self.zoomfactor)));
			{	self.maximumView=Math.ceil(self.maxVectorSinkRe - temp);
				self.minimumView=Math.floor(self.minVectorSinkRe + temp);
			}
		}
		else self.zoomfactor=0
	});
	self.$div.find(".zoom-out-button-Vector").click(function() {
		self.zoomfactor += 1;
		if(self.zoomfactor>0)   // to zoom outs
		{	self.maximumView=Math.ceil(self.maxVectorSinkRe + (self.maxVectorSinkRe -self.minVectorSinkRe)*Math.pow(2,self.zoomfactor)/8);
			self.minimumView=Math.floor(self.minVectorSinkRe - (self.maxVectorSinkRe -self.minVectorSinkRe)*Math.pow(2,self.zoomfactor)/8);
		}
		if(self.zoomfactor==0) 
		{	self.maximumView=Math.ceil(self.maxVectorSinkRe);
			self.minimumView=Math.floor(self.minVectorSinkRe);
		}
		if(self.zoomfactor<0)  // to zoom in
		{	var temp=(self.maxVectorSinkRe -self.minVectorSinkRe)/(2*Math.pow(2,Math.abs(self.zoomfactor)));
			self.maximumView=Math.ceil(self.maxVectorSinkRe - temp);
			self.minimumView=Math.floor(self.minVectorSinkRe + temp);
		}
		
	});


	self.$div.find(".autoscale-button-Vector").click(function() {
		self.zoomfactor=0
		self.maximumView=Math.ceil(self.maxVectorSinkRe);
		self.minimumView=Math.floor(self.minVectorSinkRe);
	});

	self.$div.find(".pause-button").click(function() {
		if (self.flagPauseRun==true) self.flagPauseRun=false;
		else self.flagPauseRun=true;
	});/**/


	self.chart = new window.google.visualization.LineChart($constChartDiv[0]);

	self.redraw = function() {

		var GridColor='#808080';
			if(self.$gridCheckbox.is(':checked'))  {
				GridColor = '#808080'; }
			else { 
				GridColor = '#ffffff'; }
				

		self.options = {
			title: 'Power Spectra',
			curveType: 'function',
			legend: { position: 'bottom' },
			hAxis: {
				title: 'freq (Hz)',
				gridlines: {
				color: GridColor,
			}
			},
			vAxis: {
				viewWindow:{
					/*min: self.minVectorSinkRe*(self.zoomOutVectorSink/self.zoomInVectorSink),
					max: self.maxVectorSinkRe*(self.zoomOutVectorSink/self.zoomInVectorSink)/**/
					min: self.minimumView,
					max: self.maximumView
				},
				title: 'decibels (dB)',
				gridlines: {
				color: GridColor,
			}
	       },
		explorer: {
			actions: ['dragToZoom', 'rightClickToReset'],
			axis: 'horizontal',
			keepInBounds: true,
			maxZoomIn: 4.0,
		},
		//colors: ['#e2431e', '#000000'],
		};
	
	
		$.get(self.url).done(function (data) {
			setTimeout(function () {
				self.redraw();
			});

			if (!data.success) {
				console.log("Error: " + data.message);
				return;
			}

			if (data.data == null) {
				console.log("No data");
				return;
			}

			var params = data.data.params;
			var max_freqqq=params.x_start+params.x_step*(params.vlen-1)
			self.$vectorSinkFrequencySlider.attr("min",params.x_start);
			self.$vectorSinkFrequencySlider.attr("max",max_freqqq);

			//console.log(data.data.block_type);
			//console.log(data.data.type);
			//console.log(self.frequencyFactor);
			//console.log(data.data.data);/**/

			var realData = data.data.data.streams[0];

			
			if (self.averageCounter<self.averageInput){
			
				self.averageCounter=self.averageCounter+1;
				for (var k=0; k<realData.length;++k){
					self.averageBuffer[k]+=parseFloat(realData[k]);
				}

			}
			else{
				//console.log(self.averageInput);	
				self.minVectorSinkRe=self.averageBuffer[0];
				self.maxVectorSinkRe=self.averageBuffer[0];/**/
				self.averageCounter=0;
				var formattedData = [
					["Point", "Frequency"]
					];

				for (var pos = 0; pos < realData.length; ++pos) {
					formattedData.push([ params.x_start+params.x_step*pos, self.averageBuffer[pos]]);
					if(self.averageBuffer[pos] <self.minVectorSinkRe)
						self.minVectorSinkRe=self.averageBuffer[pos]; 
					if(self.averageBuffer[pos] >self.maxVectorSinkRe)
						self.maxVectorSinkRe=self.averageBuffer[pos] ;
					
				}
				self.averageBuffer=Array(params.vlen).fill(0);

				var dataTable = window.google.visualization.arrayToDataTable(formattedData);
				if( self.flagPauseRun==true)
					self.chart.draw(dataTable, self.options);
				}
		});
	};

}
