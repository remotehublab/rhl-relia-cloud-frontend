import $ from 'jquery';
import useScript from '../../useScript';

export function ReliaConstellationSink ($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<div class=\"const-chart\" style=\"width: 100%; height: 300px\"></div>\n" +
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

export default ReliaConstellationSink;
