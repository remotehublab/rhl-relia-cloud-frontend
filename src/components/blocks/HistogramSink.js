import $ from 'jquery';
import useScript from '../../useScript';
import ReliaWidget from './ReliaWidget';

export class ReliaHistogramSink extends ReliaWidget {
	constructor($divElement, deviceIdentifier, blockIdentifier) {
		super($divElement, deviceIdentifier, blockIdentifier);
		var self = this;

		self.$div.html(
			"<div class=\"time-chart\" style=\"width: 900px; height: 500px\"></div>\n"
		);
		var $constChartDiv = self.$div.find(".time-chart");
		self.minXAxisHistogram = -1;
		self.maxXAxisHistogram = 1;
		self.binHistogram = 100;

		self.chart = new window.google.visualization.Histogram($constChartDiv[0]);

		self.redraw = function () {

			self.options = {
				title: 'Histogram',
				legend: { position: 'none' },
				hAxis: {
					title: 'Bins',
				},
				histogram: {
					bucketSize: 1.0 / self.binHistogram,
					minValue: self.minXAxisHistogram,
					maxValue: self.maxXAxisHistogram,
				},

				vAxis: {
					title: 'Count',
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
				var Data = data.data.data.streams['0'];

				self.minXAxisHistogram = params.xmin;
				self.maxXAxisHistogram = params.xmax;
				self.binHistogram = params.bins;
				//console.log(data.data.block_type);
				//console.log(data.data.type);
				//console.log(Data);


				$.each(Data, function (pos, value) {
					Data[pos] = parseFloat(value);
				});

				var formattedData = [['Voltage Values']];

				for (var pos = 0; pos < params.size_hist; ++pos) {
					formattedData.push([Data[pos]]);
				}

				var dataTable = window.google.visualization.arrayToDataTable(formattedData);
				self.chart.draw(dataTable, self.options);
				//console.log(DataArray);
			});
		};
	}
}

export default ReliaHistogramSink;
