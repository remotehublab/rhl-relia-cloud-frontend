import $ from 'jquery';
import useScript from '../../useScript';

export function ReliaTimeSink($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<div class=\"time-chart\" style=\"width: 100%; height: 300px\"></div>\n" +
	    "<div class=\"Checkbox_TimeSink_OnOffSignal row\">" +
		"<div class=\"col\">" +
		        "<input type=\"checkbox\" class=\"checkbox time-sink-grid-checkbox\" checked> Grid &nbsp;" +
		        "<input type=\"checkbox\" class=\"checkbox time-sink-real-checkbox\" checked> Real &nbsp;" +
		        "<input type=\"checkbox\" class=\"checkbox time-sink-imag-checkbox\" checked> Imag &nbsp;" +
		"</div>" +

		"<div class=\"col\">" +
		        "<button class=\"button zoom-in-button\"><i class=\"bi bi-zoom-in\"></i></button>" +
		        "<button class=\"button autoscale-button\"><i class=\"bi bi-window\"></i></button>" +
		        "<button class=\"button zoom-out-button\"><i class=\"bi bi-zoom-out\"></i></button>" +
		"</div>" +


		"<div style='display: none'>" +
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
		"</div>" +
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
			console.log(params);
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

export default ReliaTimeSink;
