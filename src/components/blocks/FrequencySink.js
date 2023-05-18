import $ from 'jquery';
import useScript from '../../useScript';
import ReliaWidget from './ReliaWidget';

export class FrequencySink extends ReliaWidget {
	constructor($divElement, deviceIdentifier, blockIdentifier) {
		super($divElement, deviceIdentifier, blockIdentifier);
		var self = this;

		/*$.get(self.url).done(function (data) {
			var nconnections = data.data.params.nconnections;	
		});*/

		self.$div.html(
			"<div class=\"freq-chart\" style=\"width: 100%; height: 300px\"></div>\n" +
			"<div class=\"Checkbox_FreqSink_OnOffSignal row\">" +
			"<div class=\"col\">" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-grid-checkbox\" checked> Grid </label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-autoscale-checkbox\" checked> Autoscale </label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-axis-labels-checkbox\" checked> Axis Labels </label>&nbsp;" +

			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-real-checkbox-1\" checked>&nbsp;<span class=\"freq-sink-real-checkbox-1-label\" style=\"display: inline\">Ch 1 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-real-checkbox-2\" checked>&nbsp;<span class=\"freq-sink-real-checkbox-2-1-label\" style=\"display: inline\">Ch 2 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-real-checkbox-3\" checked>&nbsp;<span class=\"freq-sink-real-checkbox-3-label\" style=\"display: inline\">Ch 3 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-real-checkbox-4\" checked>&nbsp;<span class=\"freq-sink-real-checkbox-4-label\" style=\"display: inline\">Ch 4 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-real-checkbox-5\" checked>&nbsp;<span class=\"freq-sink-real-checkbox-5-label\" style=\"display: inline\">Ch 5 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-real-checkbox-6\" checked>&nbsp;<span class=\"freq-sink-real-checkbox-6-label\" style=\"display: inline\">Ch 6 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-real-checkbox-7\" checked>&nbsp;<span class=\"freq-sink-real-checkbox-7-label\" style=\"display: inline\">Ch 7 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-real-checkbox-8\" checked>&nbsp;<span class=\"freq-sink-real-checkbox-8-label\" style=\"display: inline\">Ch 8 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-real-checkbox-9\" checked>&nbsp;<span class=\"freq-sink-real-checkbox-9-label\" style=\"display: inline\">Ch 9 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox freq-sink-real-checkbox-10\" checked>&nbsp;<span class=\"freq-sink-real-checkbox-10-label\" style=\"display: inline\">Ch 10 </span></label>&nbsp;" +

			"</div>" +

			"<div class=\"col\">" +
			"<button class=\"button zoom-in-button\"><i class=\"bi bi-zoom-in\"></i></button>" +
			//"<button class=\"button autoscale-button\"><i class=\"bi bi-window\"></i></button>" +
			"<button class=\"button zoom-out-button\"><i class=\"bi bi-zoom-out\"></i></button>" +
			"<button class=\"button pause-play-button\"><i class=\"bi bi-pause-btn\"></i></button>" +
			"<input class=\"textbox freq-ymin-textbox\" type=\"text\" size=\"4\" value=\"ymin\">" +
			"<input class=\"textbox freq-ymax-textbox\" type=\"text\" size=\"4\" value=\"ymax\">" +
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

		var $constChartDiv = self.$div.find(".freq-chart");
		self.$gridCheckbox = self.$div.find(".freq-sink-grid-checkbox");
		self.$autoscaleCheckbox = self.$div.find(".freq-sink-autoscale-checkbox");
		self.$axisLabelsCheckbox = self.$div.find(".freq-sink-axis-labels-checkbox");

		//self.$timesinkrealCheckbox = self.$div.find(".time-sink-real-checkbox-1");
		//self.$timesinkimagCheckbox = self.$div.find(".time-sink-imag-checkbox-1");
		self.$nop2plot = self.$div.find(".FreqSink_NumberOfPoints2Plot");

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
		self.dataAvgOut = new Array(2).fill(0);
		for (var i = 0; i < self.dataAvgOut.length; i++) {
			self.dataAvgOut[i] = new Array(1024).fill(0);
		}

		self.maxFreqSink = 1;
		self.minFreqSink = 1;
		self.zoomInFreqSink = 1;
		self.zoomOutFreqSink = 1;
		self.titleFreqSink = '';
		//self.colorsFreqSink=[];
		self.verticalnameFreqSink = " ";
		self.yLabelFreqSink = " ";
		self.yUnitFreqSink = " ";
		self.pausePlayFreqSink = true;
		self.minVerticalAxis = -1;
		self.maxVerticalAxis = 1;
		self.firstFreqRun = true;
		self.avgCounter = 0;
		self.zoomStep = 0;
		self.zoomFactor = 0;
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

		self.$div.find(".zoom-in-button").click(function () {
			self.zoomFactor += 1;
			self.$div.find(".freq-sink-autoscale-checkbox").prop('checked', false);
		});
		self.$div.find(".zoom-out-button").click(function () {
			self.zoomFactor -= 1;
			self.$div.find(".freq-sink-autoscale-checkbox").prop('checked', false);
		});
		self.$div.find(".pause-play-button").click(function () {
			self.pausePlayFreqSink ^= true;
		});

		self.$freqYvalMaximumText = self.$div.find(".freq-ymax-textbox");
		$(".freq-ymax-textbox").keypress(function (event) {
			if (event.which == 13) {
				self.maxFreqSink = self.$freqYvalMaximumText.val();
				self.$div.find(".freq-sink-autoscale-checkbox").prop('checked', false);
				//console.log(textboxValue);
			}
		});

		self.$freqYvalMinimumText = self.$div.find(".freq-ymin-textbox");
		$(".freq-ymin-textbox").keypress(function (event) {
			if (event.which == 13) {
				self.minFreqSink = self.$freqYvalMinimumText.val();
				self.$div.find(".freq-sink-autoscale-checkbox").prop('checked', false);
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

		self.redraw = function () {

			var GridColor = '#808080';
			if (self.$gridCheckbox.is(':checked')) {
				GridColor = '#808080';
			}
			else {
				GridColor = '#ffffff';
			}


			if (self.$axisLabelsCheckbox.is(':checked')) {
				self.titleVAxis = self.yLabelFreqSink + " (" + self.yUnitFreqSink + ")";
				self.titleHAxis = 'Freq (Hz)';
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
				title: self.titleFreqSink,
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
						min: self.minFreqSink * 1.0 + self.zoomFactor * self.zoomStep,
						max: self.maxFreqSink * 1.0 - self.zoomFactor * self.zoomStep
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

				var nconnections = params.nconnections;
				self.fftsize = params.fftsize;

				self.titleFreqSink = params.name;
				self.centerFrequency = params.fc;
				self.bandwidth = params.bw;
				self.ymin = params.ymin;
				self.ymax = params.ymax;
				self.average = params.average

				//self.colorsFreqSink=params.colors;
				self.yLabelFreqSink = params.label;
				self.yUnitFreqSink = params.units


				//Remove all the unused channels from 5 to nconnections
				for (var index = 10; index > nconnections; --index) {
					self.$temp = self.$div.find(".freq-sink-real-checkbox-" + index);
					self.$temp.parent().remove();
				}

				//console.log(data.data.block_type);
				//console.log(data.data.type);
				//console.log(params.labels[0].replace(/'/g, ""));
				//console.log(params);


				var Number2plot = self.fftsize;
				//var randomArr = Array.from({length: Number2plot}, () => Math.random()*2-1);


				var columns = ["Point"];
				var formattedData = [
					columns
				];

				// self.options['series'] = {};


				var enableReal = new Array(nconnections).fill(null);
				var enableImag = new Array(nconnections).fill(null);
				var dataout = Array.from(Array(self.fftsize), () => new Array(nconnections));
				//var ttemp = Array.from(Array(self.fftsize), () => new Array(nconnections));

				//int[][] matrixxx = new dataType[5][1024];
				//var realData=new Array(nconnections*Number2plot).fill(null);

				if (self.pausePlayFreqSink == true) {

					//self.colorsFreqSink=[];
					var chEnabledCounter = 0;
					for (var index = 1; index <= nconnections; ++index) {
						//console.log(self.options.series[0].pointShape,params.markers[2*index-2]);

						if (self.$div.find(".freq-sink-real-checkbox-" + index).is(':checked')) {
							dataout[chEnabledCounter] = data.data.data.streams[index - 1]['real'];
							$.each(dataout[chEnabledCounter], function (pos, value) {
								dataout[chEnabledCounter][pos] = parseFloat(value);
							});
							//console.log(dataout[0]);					
							enableReal[index - 1] = true;
							self.$div.find(".freq-sink-real-checkbox-" + index + "-label").text(params.labels[index - 1].replace(/'/g, ""));
							self.options.series[chEnabledCounter].color = params.colors[index - 1];
							self.options.series[chEnabledCounter].lineWidth = params.widths[index - 1];
							columns.push(params.labels[index - 1]);
							//console.log(params);


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

					}
					//console.log(ttemp[0][0])	
					if (self.avgCounter < params.average) {
						$.each(self.dataAvgOut, function (rowIndex, row) {
							$.each(row, function (colIndex, value) {
								self.dataAvgOut[rowIndex][colIndex] += dataout[rowIndex][colIndex];
							});
						});

						self.avgCounter += 1;
						//for (var avgCounter=0;avgCounter<1;++avgCounter){	

					}
					else {

						if (self.$autoscaleCheckbox.is(':checked')) {
							var tempmax = new Array(chEnabledCounter).fill(0);
							var tempmin = new Array(chEnabledCounter).fill(0);
							for (var v = 0; v < chEnabledCounter; ++v) {
								tempmax[v] = Math.max.apply(Math, self.dataAvgOut[v]);
								tempmin[v] = Math.min.apply(Math, self.dataAvgOut[v]);
							}
							self.maxFreqSink = Math.max.apply(Math, tempmax) / params.average;
							self.minFreqSink = Math.min.apply(Math, tempmin) / params.average;
							self.zoomStep = 0;
							self.zoomFactor = 0;
							//console.log(tempmax);
						}
						else self.zoomStep = 0.07 * Math.abs(self.minFreqSink - self.maxFreqSink);

						self.avgCounter = 0;
						//console.log(typeof data.data.data.streams[0]['real'])
						if (chEnabledCounter != 0) {
							var freqRes = self.bandwidth / self.fftsize
							for (var pos = 0; pos < self.fftsize; ++pos) {
								var currentRow = [self.centerFrequency - 0.5 * self.bandwidth + pos * freqRes];
								for (var idx = 0; idx < chEnabledCounter; ++idx) {
									//currentRow.push(realData[pos]+self.noiseFactor*randomArr[pos]);
									currentRow.push(self.dataAvgOut[idx][pos] / self.average);
									self.dataAvgOut[idx][pos] = 0;
									//console.log(ttemp)	
								}
								formattedData.push(currentRow);
							}
							//console.log(formattedData);
							var dataTable = window.google.visualization.arrayToDataTable(formattedData);
							self.chart.draw(dataTable, self.options);




						}
					}
				}

			});
		};
	}
}

export default FrequencySink;
