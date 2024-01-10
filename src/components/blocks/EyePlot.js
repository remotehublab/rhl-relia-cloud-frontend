import $ from 'jquery';
import { t } from '../../i18n';
import ReliaWidget from './ReliaWidget';

export class ReliaEyePlot extends ReliaWidget {
	constructor($divElement, deviceIdentifier, blockIdentifier, taskIdentifier) {
		super($divElement, deviceIdentifier, blockIdentifier, taskIdentifier);
		var self = this;

		/*$.get(self.url).done(function (data) {
			var nconnections = data.params.nconnections;	
		});*/

		self.$div.html(
			"<div class=\"time-chart\" style=\"width: 100%; height: 300px\"></div>\n" +
			"<div class=\"Checkbox_TimeSink_OnOffSignal row\">" +
			"<div class=\"col\">" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-grid-checkbox\" checked>" + t("widgets.general.grid") + "</label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-autoscale-checkbox\" checked>" + t("widgets.general.autoscale") + "</label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-axis-labels-checkbox\" checked>" + t("widgets.general.axis-labels") + "</label>&nbsp;" +


			"</div>" +

			"<div class=\"col\">" +
			"<button class=\"button zoom-in-button\"><i class=\"bi bi-zoom-in\"></i></button>" +
			"<button class=\"button zoom-out-button\"><i class=\"bi bi-zoom-out\"></i></button>" +
			"<button class=\"button pause-play-button\"><i class=\"bi bi-pause-btn\"></i></button>" +
			"<input class=\"textbox time-ymin-textbox\" type=\"text\" size=\"4\" value=\"ymin\">" +
			"<input class=\"textbox time-ymax-textbox\" type=\"text\" size=\"4\" value=\"ymax\">" +
			"</div>" +


			"<div style='display: none'>" +
			"<br>" +
			"<p>" + t("widgets.eye-plot.add-noise") + "</p>" +
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
		self.$autoscaleCheckbox = self.$div.find(".time-sink-autoscale-checkbox");
		self.$axisLabelsCheckbox = self.$div.find(".time-sink-axis-labels-checkbox");

		self.maxValueRealChannels = [0, 0, 0, 0, 0]
		self.minValueRealChannels = [0, 0, 0, 0, 0]
		self.maxValueImagChannels = [0, 0, 0, 0, 0]
		self.minValueImagChannels = [0, 0, 0, 0, 0]


		self.maxTimeSink = 1;
		self.minTimeSink = 1;
		//self.zoomOutTimeSink=1;
		self.titleTimeSink = '';
		self.colorsTimeSink = [];
		self.verticalnameTimeSink = " ";
		self.yLabelTimeSink = " ";
		self.yUnitTimeSink = " ";
		self.pausePlayTimeSink = true;
		self.yminTimeSink = -1;
		self.ymaxTimeSink = 1;
		self.zoomStep = 0;
		self.zoomFactor = 0;

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

		self.$div.find(".zoom-in-button").click(function () {
			self.zoomFactor += 1;
			self.$div.find(".time-sink-autoscale-checkbox").prop('checked', false);
		});
		self.$div.find(".zoom-out-button").click(function () {
			self.zoomFactor -= 1;
			self.$div.find(".time-sink-autoscale-checkbox").prop('checked', false);
		});
		self.$div.find(".pause-play-button").click(function () {
			self.pausePlayTimeSink ^= true;
		});


		self.$timeYvalMaximumText = self.$div.find(".time-ymax-textbox");
		$(".time-ymax-textbox").keypress(function (event) {
			if (event.which == 13) {
				self.maxTimeSink = self.$timeYvalMaximumText.val();
				self.$div.find(".time-sink-autoscale-checkbox").prop('checked', false);
				//console.log(textboxValue);
			}
		});

		self.$timeYvalMinimumText = self.$div.find(".time-ymin-textbox");
		$(".time-ymin-textbox").keypress(function (event) {
			if (event.which == 13) {
				self.minTimeSink = self.$timeYvalMinimumText.val();
				self.$div.find(".time-sink-autoscale-checkbox").prop('checked', false);
			}
		})

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



		self.chart = new window.google.visualization.LineChart($constChartDiv[0]);
	}

	redraw () {
		var self = this;

		var GridColor = '#808080';
		if (self.$gridCheckbox.is(':checked')) {
			GridColor = '#808080';
		}
		else {
			GridColor = '#ffffff';
		}

		/*	var ZoomIn_factor;
				if($("#time-sink-grid-checkbox").is(':checked'))  {
					GridColor = '#808080'; }
				else { 
					GridColor = '#ffffff'; }/**/


		self.options = {
			title: t('widgets.general.time'),
			curveType: 'function',
			legend: { position: 'bottom' },
			hAxis: {
				title: t('widgets.general.time-milliseconds'),
				gridlines: {
					color: GridColor,
				}
			},
			vAxis: {

				viewWindow: {
					//min: self.minTimeSink*1.0*(self.zoomOutTimeSink/self.zoomInTimeSink),
					//max: self.maxTimeSink*1.0*(self.zoomOutTimeSink/self.zoomInTimeSink)
					min: self.minTimeSink * 1.0 + self.zoomFactor * self.zoomStep,
					max: self.maxTimeSink * 1.0 - self.zoomFactor * self.zoomStep
				},/**/

				title: t('widgets.general.amplitude'),
				gridlines: {
					color: GridColor,
				}
			},
			explorer: {
				actions: ['dragToZoom', 'rightClickToReset'],
				axis: 'horizontal',
				keepInBounds: true,
				maxZoomIn: 100.0,
			},
			colors: ['#0000FF', '#FF0000', '#008000', '#000000', '#00FFFF', '#FF00FF'],
		};
	}

	handleResponseData(data) {
		var self = this;
		var params = data.params;

		// console.log(params);
		// console.log(data.data);

		var realData = data.data.streams['0']['real'];

		$.each(realData, function (pos, value) {
			realData[pos] = parseFloat(value);
		});


		var columns = [t("widgets.general.point")];
		var formattedData = [
			columns
		];


		self.options['series'] = {};

		var counter = 0;


		columns.push("Real 1", "Real 2", "Real 1", "Real 2", "Real 1", "Real 2", "Real 1", "Real 2", "Real 1", "Real 2");
		self.options.series[counter] = '#e2431e';
		counter++;

		// console.log(self.options);

		var Number2plot = params.nop

		var timePerSample = 1000.0 / params.srate; // in milliseconds
		var eyePlotDelay = params.time_delay


		self.minTimeSinkRe = realData[0];
		self.maxTimeSinkRe = realData[0];

		for (var pos = 0; pos < Number2plot; ++pos) {
			var currentRow = [pos * timePerSample];
			currentRow.push(realData[pos]);
			currentRow.push(realData[pos + eyePlotDelay * 1]);
			currentRow.push(realData[pos + eyePlotDelay * 2]);
			currentRow.push(realData[pos + eyePlotDelay * 3]);
			currentRow.push(realData[pos + eyePlotDelay * 4]);
			currentRow.push(realData[pos + eyePlotDelay * 5]);
			currentRow.push(realData[pos + eyePlotDelay * 6]);
			currentRow.push(realData[pos + eyePlotDelay * 7]);
			currentRow.push(realData[pos + eyePlotDelay * 8]);
			currentRow.push(realData[pos + eyePlotDelay * 9]);

			formattedData.push(currentRow);
		}

		var dataTable = window.google.visualization.arrayToDataTable(formattedData);

		self.chart.draw(dataTable, self.options);

		if (self.$autoscaleCheckbox.is(':checked')) {
			self.maxTimeSink = Math.max.apply(Math, realData);
			self.minTimeSink = Math.min.apply(Math, realData);

			self.zoomStep = 0;
			self.zoomFactor = 0;
			//console.log(tempmax);
		}
		else self.zoomStep = 0.07 * Math.abs(self.minTimeSink - self.maxTimeSink);
	}

	translatedName() {
		return t("widgets.eye-plot.name");
	}
}


export default ReliaEyePlot;
