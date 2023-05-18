import $ from 'jquery';
import useScript from '../../useScript';
import ReliaWidget from './ReliaWidget';


export class ReliaNumberSink extends ReliaWidget {
	constructor($divElement, deviceIdentifier, blockIdentifier) {
		super($divElement, deviceIdentifier, blockIdentifier);

		var self = this;

		self.$div.html(
			"<div class=\"number-chart\" style=\"width: 900px; height: 500px\"></div>\n"
		);
		var $constChartDiv = self.$div.find(".number-chart");
		self.minNumberSinkVal = 0;
		self.maxNumberSinkVal = 1;
		//window.google.charts.load('current', { 'packages': ['corechart', 'gauge'] });
		//window.google.charts.setOnLoadCallback(drawChart);
		self.chart = new window.google.visualization.BarChart($constChartDiv[0]);


		self.redraw = function () {

			self.options = {
				width: 400, height: 120,
				min: self.minNumberSinkVal,
				max: self.maxNumberSinkVal,
				minorTicks: 5,
				bars: 'vertical', // Required for Material Bar Charts.          	
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

				self.minNumberSinkVal = params.xmin;
				self.maxNumberSinkVal = params.xmax;
				self.number_name = params.name;
				//console.log(data.data.block_type);
				//console.log(data.data.type);
				console.log(Data[0]);


				$.each(Data, function (pos, value) {
					Data[pos] = parseFloat(value);
				});

				var formattedData = [['Label', 'Value', { role: 'annotation' }], [self.number_name, Data[0], Data[0]]];

				var dataTable = window.google.visualization.arrayToDataTable(formattedData);
				self.chart.draw(dataTable, self.options);
				//console.log(DataArray);
			});
		};
	}
}

export default ReliaNumberSink;
