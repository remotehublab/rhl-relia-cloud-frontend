import $ from 'jquery';
import ReliaWidget from './ReliaWidget';

class ReliaConstellationSink extends ReliaWidget {
	constructor($divElement, deviceIdentifier, blockIdentifier) {
		super($divElement, deviceIdentifier, blockIdentifier);

		var self = this;

		self.$div.html(
			"<div class=\"const-chart\" style=\"width: 100%; height: 300px\"></div>\n" +
			"<div class=\"Checkbox_TimeSink_OnOffSignal row\">" +
			"<div class=\"col\">" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox const-sink-grid-checkbox\" checked> Grid </label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox const-sink-autoscale-checkbox\" checked> Autoscale </label>&nbsp;" +

			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox const-sink-real-checkbox-1\" checked>&nbsp;<span class=\"const-sink-real-checkbox-1-label\" style=\"display: inline\">Data 1 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox const-sink-real-checkbox-2\" checked>&nbsp;<span class=\"const-sink-real-checkbox-2-label\" style=\"display: inline\">Data 2 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox const-sink-real-checkbox-3\" checked>&nbsp;<span class=\"const-sink-real-checkbox-3-label\" style=\"display: inline\">Data 3 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox const-sink-real-checkbox-4\" checked>&nbsp;<span class=\"const-sink-real-checkbox-4-label\" style=\"display: inline\">Data 4 </span></label>&nbsp;" +
			"<label class=\"checkbox\"><input type=\"checkbox\" class=\"checkbox const-sink-real-checkbox-5\" checked>&nbsp;<span class=\"const-sink-real-checkbox-5-label\" style=\"display: inline\">Data 5 </span></label>&nbsp;" +


			"</div>" +

			"<div class=\"col\">" +
			"<button class=\"button zoom-in-button\"><i class=\"bi bi-zoom-in\"></i></button>" +
			//"<button class=\"button autoscale-button\"><i class=\"bi bi-window\"></i></button>" +
			"<button class=\"button zoom-out-button\"><i class=\"bi bi-zoom-out\"></i></button>" +
			"<button class=\"button pause-play-button\"><i class=\"bi bi-pause-btn\"></i></button>" +

			"</div>" +
			"</div>"
		);

		var $constChartDiv = self.$div.find(".const-chart");
		self.$gridCheckbox = self.$div.find(".const-sink-grid-checkbox");
		self.$autoscaleCheckbox = self.$div.find(".const-sink-autoscale-checkbox");

		self.maxConstSink = 1;
		self.minConstSink = 1;
		self.zoomInConstSink = 1;
		self.zoomOutConstSink = 1;
		self.titleConstSink = '';
		self.colorsConstSink = [];
		self.verticalnameConstSink = " ";
		self.yLabelConstSink = " ";
		self.yUnitConstSink = " ";
		self.pausePlayConstSink = true;
		self.yminConstSink = -1;
		self.ymaxConstSink = 1;
		self.xminConstSink = -1;
		self.xmaxConstSink = 1;
		self.zoomStep = 0;
		self.zoomFactor = 0;


		self.$div.find(".zoom-in-button").click(function () {
			self.zoomFactor += 1;
			self.$div.find(".const-sink-autoscale-checkbox").prop('checked', false);
		});
		self.$div.find(".zoom-out-button").click(function () {
			self.zoomFactor -= 1;
			self.$div.find(".const-sink-autoscale-checkbox").prop('checked', false);
		});
		self.$div.find(".pause-play-button").click(function () {
			self.pausePlayConstSink ^= true;
		});

		self.chart = new window.google.visualization.ScatterChart($constChartDiv[0]);
	}

	redraw() {
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
			title: self.titleConstSink,
			pointSize: 3,
			curveType: 'function',
			legend: { position: 'right' },
			hAxis: {
				title: 'In-Phase',
				gridlines: {
					color: GridColor,
				}
			},
			vAxis: {
				/*viewWindow:{
					min: self.minConstSink*1.5*(self.zoomOutConstSink/self.zoomInConstSink),
					max: self.maxConstSink*1.5*(self.zoomOutConstSink/self.zoomInConstSink)
				},/**/

				viewWindow: {
					min: self.yminConstSink * 1.0 + self.zoomFactor * self.zoomStep,
					max: self.ymaxConstSink * 1.0 - self.zoomFactor * self.zoomStep,

				},/**/
				title: 'Quadrature',
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
	};

	handleResponseData(data) {
		var self = this;
		var params = data.params;

		var nconnections = params.nconnections;
		self.titleConstSink = params.name;
		self.colorsConstSink = params.colors;
		self.Number2plot = params.nop;
		self.xminConstSink = params.xmin;
		self.xmaxConstSink = params.xmax;
		//self.yminConstSink=params.ymin;
		//self.ymaxConstSink=params.ymin;

		//Remove all the unused channels from 5 to nconnections
		for (var index = 5; index > nconnections; --index) {
			self.$temp = self.$div.find(".const-sink-real-checkbox-" + index);
			self.$temp.parent().remove();
		}

		//console.log(data.block_type);
		//console.log(data.type);
		//console.log(params.labels[0].replace(/'/g, ""));

		//var randomArr = Array.from({length: Number2plot}, () => Math.random()*2-1);

		var columns = ["real"];
		var formattedData = [
			columns
		];


		// self.options['series'] = {};

		var enableReal = new Array(nconnections).fill(null);
		var dataout_real = Array.from(Array(self.Number2plot), () => new Array(nconnections));
		var dataout_imag = Array.from(Array(self.Number2plot), () => new Array(nconnections));
		//var realData=new Array(nconnections*Number2plot).fill(null);

		if (self.pausePlayConstSink == true) {

			self.colorsTimeSink = [];
			var chEnabledCounter = 0;
			for (var index = 1; index <= nconnections; ++index) {

				if (self.$div.find(".const-sink-real-checkbox-" + index).is(':checked')) {
					dataout_real[chEnabledCounter] = data.data.streams[index - 1]['real'];
					$.each(dataout_real[chEnabledCounter], function (pos, value) {
						dataout_real[chEnabledCounter][pos] = parseFloat(value);
					});

					dataout_imag[chEnabledCounter] = data.data.streams[index - 1]['imag'];
					$.each(dataout_imag[chEnabledCounter], function (pos, value) {
						dataout_imag[chEnabledCounter][pos] = parseFloat(value);
					});

					enableReal[index - 1] = true;
					self.$div.find(".const-sink-real-checkbox-" + index + "-label").text(params.labels[index - 1].replace(/'/g, ""));
					self.options.series[chEnabledCounter].color = params.colors[index - 1];
					// self.options.series[chEnabledCounter].lineWidth=params.widths[index-1];
					// self.options.series[chEnabledCounter].lineDashStyle=params.styles[index-1];
					self.options.series[chEnabledCounter].pointShape = params.markers[index - 1];
					if (self.options.series[chEnabledCounter].pointShape != "none") {
						self.options.series[chEnabledCounter].pointSize = 4 * params.widths[index - 1];
					}

					//self.colorsTimeSink.push(params.colors[2*index-2]);
					columns.push(params.labels[index - 1]);
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


			if (chEnabledCounter != 0) {
				for (var pos = 0; pos < self.Number2plot; ++pos) {

					for (var idx = 0; idx < chEnabledCounter; ++idx) {
						var currentRow = [dataout_real[idx][pos]];
						for (var i = 0; i < idx; ++i)
							currentRow.push(null);

						currentRow.push(dataout_imag[idx][pos]);

						for (var i = idx + 1; i < chEnabledCounter; ++i)
							currentRow.push(null);

						formattedData.push(currentRow);
					}

				}
				//console.log(formattedData);


				var dataTable = window.google.visualization.arrayToDataTable(formattedData);
				self.chart.draw(dataTable, self.options);

				if (self.$autoscaleCheckbox.is(':checked')) {
					//var tempmax_real=new Array(chEnabledCounter).fill(null);
					//var tempmin_real=new Array(chEnabledCounter).fill(null);
					var tempmax_imag = new Array(chEnabledCounter).fill(null);
					var tempmin_imag = new Array(chEnabledCounter).fill(null);
					for (var v = 0; v < chEnabledCounter; ++v) {
						//tempmax_real[v]=Math.max.apply(Math, dataout_real[v]);
						//tempmin_real[v]=Math.min.apply(Math, dataout_real[v]);
						tempmax_imag[v] = Math.max.apply(Math, dataout_imag[v]);
						tempmin_imag[v] = Math.min.apply(Math, dataout_imag[v]);
					}
					//self.xmaxConstSink=Math.max.apply(Math, tempmax_real);
					//self.xminConstSink=Math.min.apply(Math, tempmin_real);
					self.ymaxConstSink = Math.max.apply(Math, tempmax_imag);
					self.yminConstSink = Math.min.apply(Math, tempmin_imag);
					self.zoomStep = 0;
					self.zoomFactor = 0;


				}
				else self.zoomStep = 0.07 * Math.abs(self.yminConstSink - self.ymaxConstSink);
				// console.log(self.yminConstSink, self.ymaxConstSink);
				// console.log(self.zoomStep);


			}
		}
	}
}

export default ReliaConstellationSink;
