import $ from 'jquery';
import { t } from '../../i18n';
import ReliaWidget from './ReliaWidget';

export class ReliaTimeSink extends ReliaWidget {
	constructor($divElement, deviceIdentifier, blockIdentifier, taskIdentifier) {
		super($divElement, deviceIdentifier, blockIdentifier, taskIdentifier);
		var self = this;

		/*$.get(self.url).done(function (data) {
			var nconnections = data.data.params.nconnections;	
		});*/

		self.$div.html(
			"<div class=\"time-chart\" style=\"width: 100%; height: 300px\"></div>\n" +
			"<div class=\"Checkbox_TimeSink_OnOffSignal row\">" +
			"<div class=\"col\">" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-grid-checkbox\" checked> " + t('widgets.general.grid') + " </label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-autoscale-checkbox\" checked> " + t('widgets.general.autoscale') + " </label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-axis-labels-checkbox\" checked> " + t('widgets.general.axis-labels') + " </label>&nbsp;" +

			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-real-checkbox-1\" checked>&nbsp;<span class=\"time-sink-real-checkbox-1-label\" style=\"display: inline\">Real 1 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-imag-checkbox-1\" checked>&nbsp;<span class=\"time-sink-imag-checkbox-1-label\" style=\"display: inline\">Imag 1 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-real-checkbox-2\" checked>&nbsp;<span class=\"time-sink-real-checkbox-2-label\" style=\"display: inline\">Real 2 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-imag-checkbox-2\" checked>&nbsp;<span class=\"time-sink-imag-checkbox-2-label\" style=\"display: inline\">Imag 2 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-real-checkbox-3\" checked>&nbsp;<span class=\"time-sink-real-checkbox-3-label\" style=\"display: inline\">Real 3 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-imag-checkbox-3\" checked>&nbsp;<span class=\"time-sink-imag-checkbox-3-label\" style=\"display: inline\">Imag 3 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-real-checkbox-4\" checked>&nbsp;<span class=\"time-sink-real-checkbox-4-label\" style=\"display: inline\">Real 4 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-imag-checkbox-4\" checked>&nbsp;<span class=\"time-sink-imag-checkbox-4-label\" style=\"display: inline\">Imag 4 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-real-checkbox-5\" checked>&nbsp;<span class=\"time-sink-real-checkbox-5-label\" style=\"display: inline\">Real 5 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox time-sink-imag-checkbox-5\" checked>&nbsp;<span class=\"time-sink-imag-checkbox-5-label\" style=\"display: inline\">Imag 5 </span></label>&nbsp;" +


			"</div>" +

			"<div class=\"col\">" +
			"<button class=\"button zoom-in-button\"><i class=\"bi bi-zoom-in\"></i></button>" +
			//"<button class=\"button autoscale-button\"><i class=\"bi bi-window\"></i></button>" +
			"<button class=\"button zoom-out-button\"><i class=\"bi bi-zoom-out\"></i></button>" +
			"<button class=\"button pause-play-button\"><i class=\"bi bi-pause-btn\"></i></button>" +
			"<input class=\"textbox time-ymin-textbox\" type=\"text\" size=\"4\" value=\"ymin\">" +
			"<input class=\"textbox time-ymax-textbox\" type=\"text\" size=\"4\" value=\"ymax\">" +

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
			"  <select class=\"TimeSink_NumberOfPoints2Plot\">" +
			"    <option value=\"64\" >" + t("widgets.general.pointTranslation", {count: 64}) + "</option>" +
			"    <option value=\"128\">" + t("widgets.general.pointTranslation", {count: 128}) + "</option>" +
			"    <option value=\"256\">" + t("widgets.general.pointTranslation", {count: 256}) + "</option>" +
			"    <option value=\"512\">" + t("widgets.general.pointTranslation", {count: 512}) + "</option>" +
			"    <option value=\"1024\" selected=\"selected\">" + t("widgets.general.pointTranslation", {count: 1024}) + "</option>" +
			"    <option value=\"2048\">" + t("widgets.general.pointTranslation", {count: 2048}) + "</option>" +
			"    <option value=\"4096\">" + t("widgets.general.pointTranslation", {count: 4096}) + "</option>" +
			"  </select>" +
			"</form>" +
			"</div>" +
			"</div>"
		);

		var $constChartDiv = self.$div.find(".time-chart");
		self.$gridCheckbox = self.$div.find(".time-sink-grid-checkbox");
		self.$autoscaleCheckbox = self.$div.find(".time-sink-autoscale-checkbox");
		self.$axisLabelsCheckbox = self.$div.find(".time-sink-axis-labels-checkbox");

		//self.$timesinkrealCheckbox = self.$div.find(".time-sink-real-checkbox-1");
		//self.$timesinkimagCheckbox = self.$div.find(".time-sink-imag-checkbox-1");
		self.$nop2plot = self.$div.find(".TimeSink_NumberOfPoints2Plot");

		self.maxValueRealChannels = [0, 0, 0, 0, 0]
		self.minValueRealChannels = [0, 0, 0, 0, 0]
		self.maxValueImagChannels = [0, 0, 0, 0, 0]
		self.minValueImagChannels = [0, 0, 0, 0, 0]

		self.value = false;
		self.choices = {
			"true": "true",
			"false": "false",
		};


		//self.$checkboxValue = self.$div.find(".checkbox time-sink-real-checkbox-1");
		//self.$checkboxValue.text(self.choices[self.value]);

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


		if (self.$axisLabelsCheckbox.is(':checked')) {
			self.titleVAxis = self.yLabelTimeSink + " (" + self.yUnitTimeSink + ")";
			self.titleHAxis = t('widgets.general.time-milliseconds');
		}
		else {
			self.titleVAxis = ' ';
			self.titleHAxis = ' ';
		}

		/*	var ZoomIn_factor;
				if($("#time-sink-grid-checkbox").is(':checked'))  {
					GridColor = '#808080'; }
				else { 
					GridColor = '#ffffff'; }/**/


		self.options = {
			title: self.titleTimeSink,
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
				viewWindow: {
					//min: self.minTimeSink*1.0*(self.zoomOutTimeSink/self.zoomInTimeSink),
					//max: self.maxTimeSink*1.0*(self.zoomOutTimeSink/self.zoomInTimeSink)
					min: self.minTimeSink * 1.0 + self.zoomFactor * self.zoomStep,
					max: self.maxTimeSink * 1.0 - self.zoomFactor * self.zoomStep
				},/**/
				/*viewWindow:{
					
					
					min: -3,
					max: 3
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
				maxZoomIn: 100.0
			},
			//                        lineDashStyle: [4, 2],
			// TODO: Marcos: move colors to series[0].color, so everything is in series
			//colors: self.colorsTimeSink,


			series: {
				0: {
				},
				1: {


				},
				2: {
				},
				3: {
				},
				4: {
				},
				5: {
				},
				6: {
				},
				7: {
				},
				8: {
				},
				9: {
				},

			}
		};
	}

	handleResponseData (data) {
		var self = this;
		var params = data.params;

		var nconnections = params.nconnections;
		self.titleTimeSink = params.name;
		self.colorsTimeSink = params.colors;
		self.yLabelTimeSink = params.ylabel;
		self.yUnitTimeSink = params.yunit

		//Remove all the unused channels from 5 to nconnections
		for (var index = 5; index > nconnections; --index) {
			self.$temp = self.$div.find(".time-sink-real-checkbox-" + index);
			self.$temp.parent().remove();
			self.$temp = self.$div.find(".time-sink-imag-checkbox-" + index);
			self.$temp.parent().remove();
		}

		//console.log(data.block_type);
		//console.log(data.type);
		//console.log(params.labels[0].replace(/'/g, ""));
		//console.log(params.markers[0]);
		//console.log(self.zoomStep,self.zoomFactor,self.minTimeSink,self.maxTimeSink,self.zoomStep);
		//console.log(data.data.streams[0]['real']);

		var Number2plot = self.$nop2plot.val();
		//var randomArr = Array.from({length: Number2plot}, () => Math.random()*2-1);

		var timePerSample = 1000.0 / params.srate; // in milliseconds

		var columns = [t("widgets.general.point")];
		var formattedData = [
			columns
		];

		// self.options['series'] = {};


		var enableReal = new Array(nconnections).fill(null);
		var enableImag = new Array(nconnections).fill(null);
		var dataout = Array.from(Array(Number2plot), () => new Array(2 * nconnections));
		//var realData=new Array(nconnections*Number2plot).fill(null);

		if (self.pausePlayTimeSink == true) {

			self.colorsTimeSink = [];
			var chEnabledCounter = 0;
			for (var index = 1; index <= nconnections; ++index) {
				//console.log(self.options.series[0].pointShape,params.markers[2*index-2]);

				if (self.$div.find(".time-sink-real-checkbox-" + index).is(':checked')) {
					dataout[chEnabledCounter] = data.data.streams[index - 1]['real'];
					$.each(dataout[chEnabledCounter], function (pos, value) {
						dataout[chEnabledCounter][pos] = parseFloat(value);
					});
					enableReal[index - 1] = true;
					self.$div.find(".time-sink-real-checkbox-" + index + "-label").text(params.labels[2 * index - 2].replace(/'/g, ""));
					self.options.series[chEnabledCounter].color = params.colors[2 * index - 2];
					self.options.series[chEnabledCounter].lineWidth = params.widths[2 * index - 2];
					self.options.series[chEnabledCounter].lineDashStyle = params.styles[2 * index - 2];
					self.options.series[chEnabledCounter].pointShape = params.markers[2 * index - 2];
					if (self.options.series[chEnabledCounter].pointShape != "none") {
						self.options.series[chEnabledCounter].pointSize = 4 * params.widths[2 * index - 2];
					}

					//self.colorsTimeSink.push(params.colors[2*index-2]);
					chEnabledCounter = chEnabledCounter + 1;
				}
				else {
					enableReal[index - 1] = false;
					//self.options.series[chEnabledCounter].color='#ffffff';
					//chEnabledCounter=chEnabledCounter+1;
					//self.colorsTimeSink.push('#ffff00');
					//realData= new Array(realData.length).fill(null);
				}

				if (self.$div.find(".time-sink-imag-checkbox-" + index).is(':checked')) {
					dataout[chEnabledCounter] = data.data.streams[index - 1]['imag'];
					$.each(dataout[chEnabledCounter], function (pos, value) {
						dataout[chEnabledCounter][pos] = parseFloat(value);
					});
					enableImag[index - 1] = true;
					self.$div.find(".time-sink-imag-checkbox-" + index + "-label").text(params.labels[2 * index - 1].replace(/'/g, ""));
					self.options.series[chEnabledCounter].color = params.colors[2 * index - 1];
					self.options.series[chEnabledCounter].lineWidth = params.widths[2 * index - 1];
					self.options.series[chEnabledCounter].lineDashStyle = params.styles[2 * index - 1];
					self.options.series[chEnabledCounter].pointShape = params.markers[2 * index - 1];
					if (self.options.series[chEnabledCounter].pointShape != "none") {
						self.options.series[chEnabledCounter].pointSize = 4 * params.widths[2 * index - 1];
					}


					chEnabledCounter = chEnabledCounter + 1;
				}
				else {
					enableImag[index - 1] = false;
					//self.options.series[2*index-1].color='#ffffff';
					//chEnabledCounter=chEnabledCounter+1;
					//imagData=Array(realData.length).fill(null);
				}
				/*if (!enableReal[index-1] && !enableImag[index-1]) {
					console.log("Error: activate real or imag");
					return;
				}/**/
				//console.log(enableImag[index-1]);
				// counter = 0;

				if (enableReal[index - 1]) {
					columns.push(params.labels[2 * index - 2]);
					// self.options.series[counter].color = '#3FFF33';
					//counter++;
				}

				if (enableImag[index - 1]) {
					columns.push(params.labels[2 * index - 1]);
					// self.options.series[counter].color = '#1221c0';
					//counter++;
				}

			}
			if (chEnabledCounter != 0) {
				for (var pos = 0; pos < Number2plot; ++pos) {
					var currentRow = [pos * timePerSample];
					for (var idx = 0; idx < chEnabledCounter; ++idx) {
						//currentRow.push(realData[pos]+self.noiseFactor*randomArr[pos]);
						currentRow.push(dataout[idx][pos]);
					}
					formattedData.push(currentRow);
				}
				//console.log(formattedData);
				var dataTable = window.google.visualization.arrayToDataTable(formattedData);
				self.chart.draw(dataTable, self.options);

				if (self.$autoscaleCheckbox.is(':checked')) {
					var tempmax = new Array(chEnabledCounter).fill(null);
					var tempmin = new Array(chEnabledCounter).fill(null);
					for (var v = 0; v < chEnabledCounter; ++v) {
						tempmax[v] = Math.max.apply(Math, dataout[v]);
						tempmin[v] = Math.min.apply(Math, dataout[v]);
					}
					self.maxTimeSink = Math.max.apply(Math, tempmax);
					self.minTimeSink = Math.min.apply(Math, tempmin);
					self.zoomStep = 0;
					self.zoomFactor = 0;
				}
				else self.zoomStep = 0.07 * Math.abs(self.minTimeSink - self.maxTimeSink);


			}
		}
	}

	translatedName() {
		return t("widgets.time-sink.name");
	}
}

export default ReliaTimeSink;
