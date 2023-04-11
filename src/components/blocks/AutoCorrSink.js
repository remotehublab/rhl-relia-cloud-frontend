import $ from 'jquery';
import useScript from '../../useScript';

export function ReliaAutoCorrSink($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;
	self.$div = $divElement;

	
	/*$.get(self.url).done(function (data) {
		var nconnections = data.data.params.nconnections;	
	});*/

	self.$div.html(
	    "<div class=\"autoCorr-chart\" style=\"width: 100%; height: 300px\"></div>\n" +
	    "<div class=\"Checkbox_AutoCorrSink_OnOffSignal row\">" +
		"<div class=\"col\">" +
		        "<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox autoCorr-sink-grid-checkbox\" checked> Grid </label>&nbsp;" +
		        "<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox autoCorr-sink-autoscale-checkbox\" checked> Autoscale </label>&nbsp;" +
		        "<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox autoCorr-sink-axis-labels-checkbox\" checked> Axis Labels </label>&nbsp;" +

		        "<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox autoCorr-sink-real-checkbox-1\" checked>&nbsp;<span class=\"autoCorr-sink-real-checkbox-1-label\" style=\"display: inline\">Ch 1 </span></label>&nbsp;" +

		"</div>" +

		"<div class=\"col\">" +
		        "<button class=\"button zoom-in-button\"><i class=\"bi bi-zoom-in\"></i></button>" +
		        //"<button class=\"button autoscale-button\"><i class=\"bi bi-window\"></i></button>" +
		        "<button class=\"button zoom-out-button\"><i class=\"bi bi-zoom-out\"></i></button>" +
		        "<button class=\"button pause-play-button\"><i class=\"bi bi-pause-btn\"></i></button>" +
		        "<input class=\"textbox autoCorr-ymin-textbox\" type=\"text\" size=\"4\" value=\"ymin\">" +
		        "<input class=\"textbox autoCorr-ymax-textbox\" type=\"text\" size=\"4\" value=\"ymax\">" +
		"</div>" +


		"<div style='display: none'>" +
			"<br>" + 
			"<p>Add Noise</p>" +
			//"<input type=\"range\" min=\"0\" max=\"100\" value=\"1\" onchange=\"TimeSink_NoiseSlide(this.value)\" <br>" +
			"<input class=\"noise-slider\" type=\"range\" min=\"0\" max=\"100\" value=\"0\">" +
			"<p class=\"noise-slider-value\" value=\"1\"></p> <br>" +
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
			"  <select class=\"FreqSink_NumberOfPoints2Plot\">" + 
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
	
	var $constChartDiv = self.$div.find(".autoCorr-chart");
	self.$gridCheckbox = self.$div.find(".autoCorr-sink-grid-checkbox");
	self.$autoscaleCheckbox = self.$div.find(".autoCorr-sink-autoscale-checkbox");
	self.$axisLabelsCheckbox = self.$div.find(".autoCorr-sink-axis-labels-checkbox");
	
	//self.$timesinkrealCheckbox = self.$div.find(".time-sink-real-checkbox-1");
	//self.$timesinkimagCheckbox = self.$div.find(".time-sink-imag-checkbox-1");

	self.maxValueRealChannels = [0,0,0,0,0]
	self.minValueRealChannels = [0,0,0,0,0]
	self.maxValueImagChannels = [0,0,0,0,0]
	self.minValueImagChannels = [0,0,0,0,0]

	self.value = false;
	self.choices = {
		"true": "true",
		"false": "false",
	};

	
	//self.$checkboxValue = self.$div.find(".checkbox time-sink-real-checkbox-1");
	//self.$checkboxValue.text(self.choices[self.value]);
	self.dataAvgOut = new Array(512).fill(0);

	
	self.maxAutoCorrSink=1;
	self.minAutoCorrSink=1;
	self.zoomInAutoCorrSink=1;
  self.zoomOutAutoCorrSink=1;
  self.titleAutoCorrSink='';
  self.verticalnameAutoCorrSink=" ";
	self.yLabelAutoCorrSink=" ";
	self.yUnitAutoCorrSink=" ";
	self.pausePlayAutoCorrSink=true;
	self.minVerticalAxis=-1;
	self.maxVerticalAxis=1;
	self.firstAutoCorrRun=true;
	self.avgCounter=0;
	self.zoomStep=0;
	self.zoomFactor=0;
	//self.ymin

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
		self.zoomFactor += 1;
		self.$div.find(".autoCorr-sink-autoscale-checkbox").prop('checked', false);
	});
	self.$div.find(".zoom-out-button").click(function() {
		self.zoomFactor -= 1;
		self.$div.find(".autoCorr-sink-autoscale-checkbox").prop('checked', false);		
	});
	self.$div.find(".pause-play-button").click(function() {
		self.pausePlayAutoCorrSink ^= true;
	});

	self.$autoCorrYvalMaximumText = self.$div.find(".autoCorr-ymax-textbox");
	$(".autoCorr-ymax-textbox").keypress(function(event) {
    if (event.which == 13) {
      self.maxAutoCorrSink = self.$autoCorrYvalMaximumText.val();
      self.$div.find(".autoCorr-sink-autoscale-checkbox").prop('checked', false);
      //console.log(textboxValue);
    }
  });

	self.$autoCorrYvalMinimumText = self.$div.find(".autoCorr-ymin-textbox");
	$(".autoCorr-ymin-textbox").keypress(function(event) {
    if (event.which == 13) {
      self.minAutoCorrSink = self.$autoCorrYvalMinimumText.val();
      self.$div.find(".autoCorr-sink-autoscale-checkbox").prop('checked', false);
    }
  });


	//This commented code is to add noise slider
	/*
	self.noiseFactor = 0;
	self.$timeSinkNoiseSlider = self.$div.find(".noise-slider"); // <input>
	self.$timeSinkNoiseSliderValue = self.$div.find(".noise-slider-value"); // <p>

	self.changeTimeSinkNoiseSlider = function () {
		self.$timeSinkNoiseSliderValue.text(self.$timeSinkNoiseSlider.val());
  		self.noiseFactor = self.$timeSinkNoiseSlider.val()*(self.maxTimeSinkRe-self.minTimeSinkRe)/100;
	};
	self.changeTimeSinkNoiseSlider();

	self.$timeSinkNoiseSlider.change(self.changeTimeSinkNoiseSlider);*/

	//This commented code is to add pause button
	/*self.$div.find(".pause-button").click(function() {
		if (self.flagPauseRun==true) self.flagPauseRun=false;
		else self.flagPauseRun=true;
	});*/
	//self.$flagPauseRun="Run";

	//self.$TimeSinkPauseButton = document.getElementById("myButton1");	

	/*function RunPausePressed(el){
		if (el.value=='Pause') self.$flagPauseRun='Run';
		if (el.value=='Run') self.$flagPauseRun='Pause';
	}/**/
	

	//self.$div.find(".time-sink-real-checkbox-1").closest("label").text('ssdss');
	//self.$div.find(".time-sink-real-checkbox-1").prop('checked', true);
	self.chart = new window.google.visualization.ColumnChart($constChartDiv[0]);

	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

	self.redraw = function() {

		var GridColor='#808080';
		if(self.$gridCheckbox.is(':checked'))  {
				GridColor = '#808080'; }
		else { 
				GridColor = '#ffffff'; }
		
		
		if(self.$axisLabelsCheckbox.is(':checked')){		
			self.titleVAxis=self.yLabelAutoCorrSink + " (" + self.yUnitAutoCorrSink + ")";
			self.titleHAxis='lag';
		}
		else{
			self.titleVAxis=' ';
			self.titleHAxis=' ';
		}
				
	/*	var ZoomIn_factor;
			if($("#time-sink-grid-checkbox").is(':checked'))  {
				GridColor = '#808080'; }
			else { 
				GridColor = '#ffffff'; }/**/
				

		self.options = {
			title: self.titleAutoCorrSink,
			curveType: 'function',
			legend: { position: 'right' },
			hAxis: {
				title: self.titleHAxis,
				gridlines: {
				color: GridColor,
				//title: self.yunit,
			}
			},
			vAxis: {
				viewWindow:{
					min: self.minAutoCorrSink*1.0 + self.zoomFactor*self.zoomStep,
					max: self.maxAutoCorrSink*1.0 - self.zoomFactor*self.zoomStep
				},/**/
				title: self.titleVAxis,
				gridlines: {
				color: GridColor,
				}
	       	 },
			explorer: { 
        		actions: ['dragToZoom', 'rightClickToReset'],
        		axis: 'horizontal',
        		keepInBounds: true,
        		maxZoomIn: 16.0
			},	       	 
//                        lineDashStyle: [4, 2],
			// TODO: Marcos: move colors to series[0].color, so everything is in series
			//colors: self.colorsTimeSink,
          
			
			series: {
        		0: 	{
			    	},
			}
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

			var nconnections=params.nconnections;
			self.fac_size=params.fac_size;
			
			self.titleAutoCorrSink=params.title;
			self.centerFrequency=params.fc;
			self.bandwidth=params.bw;
			self.ymin=params.ymin;
			self.ymax=params.ymax;
			self.average=params.average
			
			//self.colorsFreqSink=params.colors;
			self.yLabelAutoCorrResSink=params.label;
			self.yUnitAutoCorrResSink=params.units
			
			
			//Remove all the unused channels from 5 to nconnections
			//console.log(data.data.block_type);
			//console.log(data.data.type);
			//console.log(params.labels[0].replace(/'/g, ""));
			//console.log(data.data.data.streams[0].real);
			console.log(params);


			//var randomArr = Array.from({length: Number2plot}, () => Math.random()*2-1);


			var columns = ["Point"];
			var formattedData = [
				columns
			];
			
		    // self.options['series'] = {};

			columns.push("Real");
			var dataout=new Array(self.fac_size).fill(0);

			//int[][] matrixxx = new dataType[5][1024];
			//var realData=new Array(nconnections*Number2plot).fill(null);
			
			if (self.pausePlayAutoCorrSink==true){
			
			dataout = data.data.data.streams[0]['real'];
			$.each(dataout, function (pos, value) {
						dataout[pos] = parseFloat(value);
					});
					//console.log(dataout[0]);					
					
			if (self.avgCounter<params.fac_decimation){
			$.each(self.dataAvgOut, function(rowIndex, row) {
    				self.dataAvgOut[rowIndex]+= dataout[rowIndex];
			});

			self.avgCounter+=1;
			//for (var avgCounter=0;avgCounter<1;++avgCounter){	
				
			}
			else{

			if(self.$autoscaleCheckbox.is(':checked'))  {
				self.maxAutoCorrSink=Math.max.apply(Math, self.dataAvgOut)/params.fac_decimation;
				self.minAutoCorrSink=Math.min.apply(Math, self.dataAvgOut)/params.fac_decimation;
				console.log(self.maxAutoCorrSink)	
				self.zoomStep=0;
				self.zoomFactor=0;
				//console.log(tempmax);
			}
			else self.zoomStep=0.07*Math.abs(self.minAutoCorrSink-self.maxAutoCorrSink);


			self.avgCounter=0;	
			console.log(self.maxAutoCorrSink)
			for (var pos = 0; pos < self.fac_size	; ++pos) {
					var currentRow = [pos];
					currentRow.push(self.dataAvgOut[pos]/params.fac_decimation);
					self.dataAvgOut[pos]=0;
					//console.log(ttemp)	
		
				formattedData.push(currentRow);
			}
			//console.log(formattedData);
			var dataTable = window.google.visualization.arrayToDataTable(formattedData);
			self.chart.draw(dataTable, self.options);
			



			}
			}
			
		});
	};

}

export default ReliaAutoCorrSink;
