import $ from 'jquery';
import useScript from '../../useScript';

export function ReliaConstellationSink ($divElement, deviceIdentifier, blockIdentifier, session_id) {
	var self = this;

	self.$div = $divElement;

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

	self.maxConstSink=1;
	self.minConstSink=1;
	self.zoomInConstSink=1;
    self.zoomOutConstSink=1;
    self.titleConstSink='';
    self.colorsConstSink=[];
    self.verticalnameConstSink=" ";
	self.yLabelConstSink=" ";
	self.yUnitConstSink=" ";
	self.pausePlayConstSink=true;
	self.yminConstSink=-1;
	self.ymaxConstSink=1;
	self.xminConstSink=-1;
	self.xmaxConstSink=1;

	self.$div.find(".zoom-in-button").click(function() {
		self.zoomInConstSink += 1;
	});
	self.$div.find(".zoom-out-button").click(function() {

		self.zoomOutConstSink += 1;
	});
	self.$div.find(".pause-play-button").click(function() {
		self.pausePlayConstSink ^= true;
	});

    self.chart = new window.google.visualization.ScatterChart($constChartDiv[0]);

	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier + "/" + session_id;
	
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
				viewWindow:{
					
					
					min: -3,
					max: 3
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
        		maxZoomIn: 16.0
			},	       	 
//                        lineDashStyle: [4, 2],
			// TODO: Marcos: move colors to series[0].color, so everything is in series
			//colors: self.colorsTimeSink,
          
			
			series: {
        		0: 	{
			    	},
        		1: 	{ 


			   		},
        		2: 	{ 
			   		},
        		3: 	{ 
			   		},
        		4: 	{ 
			    	},
        		5: 	{ 
			   		},
        		6: 	{ 
			   		},
        		7: 	{ 
			   		},
        		8: 	{ 
			   		},
        		9: 	{ 
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
			self.titleConstSink=params.name;
			self.colorsConstSink=params.colors;
			self.Number2plot=params.nop;
			
			
			//Remove all the unused channels from 5 to nconnections
			for (var index = 5; index > nconnections; --index) 
			{
				self.$temp = self.$div.find(".const-sink-real-checkbox-"+index);
				self.$temp.parent().remove();
			}

			//console.log(data.data.block_type);
			//console.log(data.data.type);
			//console.log(params.labels[0].replace(/'/g, ""));

			//var randomArr = Array.from({length: Number2plot}, () => Math.random()*2-1);

			var columns = ["real"];
			var formattedData = [
				columns
			];

			
		    // self.options['series'] = {};

			var enableReal=new Array(nconnections).fill(null);
			var dataout_real = Array.from(Array(self.Number2plot), () => new Array(nconnections));
			var dataout_imag = Array.from(Array(self.Number2plot), () => new Array(nconnections));
			//var realData=new Array(nconnections*Number2plot).fill(null);
			
			if (self.pausePlayConstSink==true){
			
			self.colorsTimeSink=[];
			var chEnabledCounter=0;
			for (var index=1;index<=nconnections;++index)
			{	

        		if(self.$div.find(".const-sink-real-checkbox-"+index).is(':checked'))  {
					dataout_real[chEnabledCounter] = data.data.data.streams[index-1]['real'];
					$.each(dataout_real[chEnabledCounter], function (pos, value) {
						dataout_real[chEnabledCounter][pos] = parseFloat(value);
					});

					dataout_imag[chEnabledCounter] = data.data.data.streams[index-1]['imag'];
					$.each(dataout_imag[chEnabledCounter], function (pos, value) {
						dataout_imag[chEnabledCounter][pos] = parseFloat(value);
					});
					
        			enableReal[index-1] = true; 
        			self.$div.find(".const-sink-real-checkbox-"+index+"-label").text(params.labels[index-1].replace(/'/g, ""));
        			self.options.series[chEnabledCounter].color=params.colors[index-1];
        			// self.options.series[chEnabledCounter].lineWidth=params.widths[index-1];
        			// self.options.series[chEnabledCounter].lineDashStyle=params.styles[index-1];
        			self.options.series[chEnabledCounter].pointShape=params.markers[index-1];
					if (self.options.series[chEnabledCounter].pointShape!="none"){
	        			self.options.series[chEnabledCounter].pointSize=4*params.widths[index-1];
					}
        			
        			//self.colorsTimeSink.push(params.colors[2*index-2]);
        			columns.push(params.labels[index-1]);
        			chEnabledCounter=chEnabledCounter+1;
        			}
        		else { 
        			enableReal[index-1] = false; 
        			//self.options.series[chEnabledCounter].color='#ffffff';
        			//chEnabledCounter=chEnabledCounter+1;
        			//self.colorsTimeSink.push('#ffff00');
        			//realData= new Array(realData.length).fill(null);
        		}
        		
			}
			
			
			if (chEnabledCounter!=0){
			for (var pos = 0; pos < self.Number2plot; ++pos) {

				for (var idx = 0; idx < chEnabledCounter; ++idx){
				    var currentRow=[ dataout_real[idx][pos] ];
                    for (var i = 0; i < idx; ++i)
                        currentRow.push(null);

					currentRow.push(dataout_imag[idx][pos]);

                    for (var i = idx+1; i < chEnabledCounter; ++i)
                        currentRow.push(null);

				    formattedData.push(currentRow);
				}

			}
			console.log(formattedData);
			
			
			var dataTable = window.google.visualization.arrayToDataTable(formattedData);
			self.chart.draw(dataTable, self.options);
			
			if(self.$autoscaleCheckbox.is(':checked'))  {
				self.minTimeSink=Math.min.apply(Math, dataout_real[0]);
				self.maxTimeSink=Math.max.apply(Math, dataout_imag[0]);
			}

			
			}
			}
			
		});
	};

}

export default ReliaConstellationSink;
