import $ from 'jquery';
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
	}

	redraw () {
		var self = this;
		self.options = {
			width: 400, height: 120,
			min: self.minNumberSinkVal,
			max: self.maxNumberSinkVal,
			minorTicks: 5,
			bars: 'vertical', // Required for Material Bar Charts.          	
		};
	}

	handleResponseData(data) {
		var self = this;
		var params = data.params;
		var Data = data.data.streams['0'];

		self.minNumberSinkVal = params.xmin;
		self.maxNumberSinkVal = params.xmax;
		self.number_name = params.name;
		//console.log(data.block_type);
		//console.log(data.type);
		// console.log(Data[0]);


		$.each(Data, function (pos, value) {
			Data[pos] = parseFloat(value);
		});

		var formattedData = [['Label', 'Value', { role: 'annotation' }], [self.number_name, Data[0], Data[0]]];

		var dataTable = window.google.visualization.arrayToDataTable(formattedData);
		self.chart.draw(dataTable, self.options);
		//console.log(DataArray);
	}
}

export default ReliaNumberSink;
