import $ from 'jquery';
import useScript from '../../useScript';


export function ReliaVectorSink($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<h3>Frequency Sink " + blockIdentifier + " of " + deviceIdentifier + "</h3>" +
	    "<div class=\"vector-chart\" style=\"width: 900px; height: 500px\"></div>\n" +
	    "<div class=\"Checkbox_VectorSink_OnOffSignal\">" +
	        "<input type=\"checkbox\" class=\"checkbox vector-sink-grid-checkbox\" checked> Grid<br>" +
		"<br>" + 
		"<p>Center Frequency</p>" +
	        //"<input type=\"range\" min=\"0\" max=\"100\" value=\"1\" onchange=\"TimeSink_NoiseSlide(this.value)\" <br>" +
	        "<input class=\"frequency-slider\" type=\"range\" min=\"0\" max=\"100\" >" +
		"<p class=\"frequnecy-slider-value\" value=\"1\"></p> <br>" +
		"<br>" + 
	        "<input type=\"submit\" name=\"checkout\" class=\"button zoom-in-button-Vector\" value=\"Zoom In\"> <br>" +
	        "<input type=\"submit\" name=\"checkout\" class=\"button zoom-out-button-Vector\" value=\"Zoom Out\"> <br>" +
	        "<input type=\"submit\" name=\"checkout\" class=\"button autoscale-button-Vector\" value=\"Zoom AutoScale\"> <br>" +
		    "<input type=\"submit\" name=\"checkout\" class=\"button pause-button\" value=\"Pause/Run\"> <br>" +
		    "<input type=\"submit\" name=\"checkout\" class=\"button Inc-Average-button\" value=\"Average +\"> <br>" +
		    "<input type=\"submit\" name=\"checkout\" class=\"button Dec-Average-button\" value=\"Average -\"> <br>" +
	    "</div>"
	);
	
	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

	var $constChartDiv = self.$div.find(".vector-chart");
	self.$gridCheckbox = self.$div.find(".vector-sink-grid-checkbox");
	
	self.minVectorSink=1;
	self.minVectorSink=1;
	self.zoomfactor=0;    
	self.flagPauseRun=true;
    self.averageCounter=1;
    self.averageInput=1;
    self.averageBuffer=Array(1024).fill(0);

	//self.redraw = function() {
	self.frequencyFactor = 0;
	self.$vectorSinkFrequencySlider = self.$div.find(".frequency-slider"); // <input>
	//self.$div.find(".frequency-slider").slider("option","max",10);	
	self.$vectorSinkFrequencySliderValue = self.$div.find(".frequnecy-slider-value"); // <p>

	self.changeVectorSinkFrequencySlider = function () {
		self.$vectorSinkFrequencySliderValue.text(self.$vectorSinkFrequencySlider.val());
  		self.frequencyFactor = self.$vectorSinkFrequencySlider.val();

		$.ajax({
			type: "POST",
			url: self.url, 
			data: JSON.stringify({
				"frequencyFactor": self.frequencyFactor
			}),
			contentType: "application/json",
			dataType: "json"
		}).done(function () {
			// TBD
		});
	};
	self.changeVectorSinkFrequencySlider();

	self.$vectorSinkFrequencySlider.change(self.changeVectorSinkFrequencySlider);


	self.$div.find(".Inc-Average-button").click(function() {
		self.averageInput += 1;
	});

	self.$div.find(".Dec-Average-button").click(function() {
		self.averageInput -= 1;
		if (self.averageInput<1) self.averageInput = 1;
	});

	self.$div.find(".zoom-in-button-Vector").click(function() {
		if(self.maxVectorSinkRe -self.minVectorSinkRe>2){
	
			self.zoomfactor -= 1;
			if(self.zoomfactor>0) // to zoom outs
			{	self.maximumView=Math.ceil(self.maxVectorSinkRe + (self.maxVectorSinkRe -self.minVectorSinkRe)*Math.pow(2,self.zoomfactor)/8);
				self.minimumView=Math.floor(self.minVectorSinkRe - (self.maxVectorSinkRe -self.minVectorSinkRe)*Math.pow(2,self.zoomfactor)/8);
			}
			if(self.zoomfactor==0) 
			{	self.maximumView=Math.ceil(self.maxVectorSinkRe);
				self.minimumView=Math.floor(self.minVectorSinkRe);
			}
			if(self.zoomfactor<0) // to zoom in
				var temp=(self.maxVectorSinkRe -self.minVectorSinkRe)/(2*Math.pow(2,Math.abs(self.zoomfactor)));
			{	self.maximumView=Math.ceil(self.maxVectorSinkRe - temp);
				self.minimumView=Math.floor(self.minVectorSinkRe + temp);
			}
		}
		else self.zoomfactor=0
	});
	self.$div.find(".zoom-out-button-Vector").click(function() {
		self.zoomfactor += 1;
		if(self.zoomfactor>0)   // to zoom outs
		{	self.maximumView=Math.ceil(self.maxVectorSinkRe + (self.maxVectorSinkRe -self.minVectorSinkRe)*Math.pow(2,self.zoomfactor)/8);
			self.minimumView=Math.floor(self.minVectorSinkRe - (self.maxVectorSinkRe -self.minVectorSinkRe)*Math.pow(2,self.zoomfactor)/8);
		}
		if(self.zoomfactor==0) 
		{	self.maximumView=Math.ceil(self.maxVectorSinkRe);
			self.minimumView=Math.floor(self.minVectorSinkRe);
		}
		if(self.zoomfactor<0)  // to zoom in
		{	var temp=(self.maxVectorSinkRe -self.minVectorSinkRe)/(2*Math.pow(2,Math.abs(self.zoomfactor)));
			self.maximumView=Math.ceil(self.maxVectorSinkRe - temp);
			self.minimumView=Math.floor(self.minVectorSinkRe + temp);
		}
		
	});


	self.$div.find(".autoscale-button-Vector").click(function() {
		self.zoomfactor=0
		self.maximumView=Math.ceil(self.maxVectorSinkRe);
		self.minimumView=Math.floor(self.minVectorSinkRe);
	});

	self.$div.find(".pause-button").click(function() {
		if (self.flagPauseRun==true) self.flagPauseRun=false;
		else self.flagPauseRun=true;
	});/**/


	self.chart = new window.google.visualization.LineChart($constChartDiv[0]);

	self.redraw = function() {

		var GridColor='#808080';
			if(self.$gridCheckbox.is(':checked'))  {
				GridColor = '#808080'; }
			else { 
				GridColor = '#ffffff'; }
				

		self.options = {
			title: 'Power Spectra',
			curveType: 'function',
			legend: { position: 'bottom' },
			hAxis: {
				title: 'freq (Hz)',
				gridlines: {
				color: GridColor,
			}
			},
			vAxis: {
				viewWindow:{
					/*min: self.minVectorSinkRe*(self.zoomOutVectorSink/self.zoomInVectorSink),
					max: self.maxVectorSinkRe*(self.zoomOutVectorSink/self.zoomInVectorSink)/**/
					min: self.minimumView,
					max: self.maximumView
				},
				title: 'decibels (dB)',
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
		//colors: ['#e2431e', '#000000'],
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
			var max_freqqq=params.x_start+params.x_step*(params.vlen-1)
			self.$vectorSinkFrequencySlider.attr("min",params.x_start);
			self.$vectorSinkFrequencySlider.attr("max",max_freqqq);

			//console.log(data.data.block_type);
			//console.log(data.data.type);
			//console.log(self.frequencyFactor);
			//console.log(data.data.data);/**/

			var realData = data.data.data.streams[0];

			
			if (self.averageCounter<self.averageInput){
			
				self.averageCounter=self.averageCounter+1;
				for (var k=0; k<realData.length;++k){
					self.averageBuffer[k]+=parseFloat(realData[k]);
				}

			}
			else{
				//console.log(self.averageInput);	
				self.minVectorSinkRe=self.averageBuffer[0];
				self.maxVectorSinkRe=self.averageBuffer[0];/**/
				self.averageCounter=0;
				var formattedData = [
					["Point", "Frequency"]
					];

				for (var pos = 0; pos < realData.length; ++pos) {
					formattedData.push([ params.x_start+params.x_step*pos, self.averageBuffer[pos]]);
					if(self.averageBuffer[pos] <self.minVectorSinkRe)
						self.minVectorSinkRe=self.averageBuffer[pos]; 
					if(self.averageBuffer[pos] >self.maxVectorSinkRe)
						self.maxVectorSinkRe=self.averageBuffer[pos] ;
					
				}
				self.averageBuffer=Array(params.vlen).fill(0);

				var dataTable = window.google.visualization.arrayToDataTable(formattedData);
				if( self.flagPauseRun==true)
					self.chart.draw(dataTable, self.options);
				}
		});
	};
}

export default ReliaVectorSink;
