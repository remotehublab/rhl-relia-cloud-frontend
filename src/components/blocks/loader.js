import $ from 'jquery';
import useScript from '../../useScript';

import ReliaConstellationSink from './ConstellationSink.js';
import ReliaTimeSink from './TimeSink.js';
import ReliaVectorSink from './VectorSink.js';
import ReliaVariableRange from './VariableRange.js';
import ReliaHistogramSink from './HistogramSink.js';
import ReliaCheckBox from './VariableCheckBox.js';
import ReliaPushButton from './VariablePushButton.js';
import ReliaChooser from './VariableChooser.js';


export function ReliaWidgets($divElement) {
	var self = this;
	var devicesUrl = window.API_BASE_URL + "data/current/devices";
	self.blocks = [];

	$.get(devicesUrl).done(function (data) {
		if (!data.success) {
			// TODO
			console.log("Error loading devices:", data);
			return;
		}

		var devices = data.devices;
		$.each(devices, function (pos, deviceName) {
			var blocksUrl = window.API_BASE_URL + "data/current/devices/" + deviceName + "/blocks";
			$.get(blocksUrl).done(function (data) {
				if (!data.success) {
					// TODO
					console.log("Error loading blocks:", data);
					return;
				}
				$.each(data.blocks, function (post, blockName) {
					var $newDiv = $("<div></div>");
					$divElement.append($newDiv);
					console.log("Loading...", deviceName, blockName);
					if (blockName.startsWith("RELIA Constellation Sink")) {
						var constellationSink = new ReliaConstellationSink($newDiv, deviceName, blockName);
						self.blocks.push(constellationSink);
						constellationSink.redraw();
						
					} else if (blockName.startsWith("RELIA Time Sink")) {
						var timeSink = new ReliaTimeSink($newDiv, deviceName, blockName);
						self.blocks.push(timeSink);
						timeSink.redraw();
					} else if (blockName.startsWith("RELIA Vector Sink")) {
						var vectorSink = new ReliaVectorSink($newDiv, deviceName, blockName);
						self.blocks.push(vectorSink);
						vectorSink.redraw();
					} else if (blockName.startsWith("RELIA Variable Range")) {
						var variableRange = new ReliaVariableRange($newDiv, deviceName, blockName);
						self.blocks.push(variableRange);
						variableRange.redraw();
					} else if (blockName.startsWith("RELIA Histogram Sink")) {
						var histogramSink = new ReliaHistogramSink($newDiv, deviceName, blockName);
						self.blocks.push(histogramSink);
						histogramSink.redraw();
					} else if (blockName.startsWith("RELIA Variable CheckBox")) {
						var checkBox = new ReliaCheckBox($newDiv, deviceName, blockName);
						self.blocks.push(checkBox);
						checkBox.redraw();
					} else if (blockName.startsWith("RELIA Variable PushButton")) {
						var pushbutton = new ReliaPushButton($newDiv, deviceName, blockName);
						self.blocks.push(pushbutton);
						pushbutton.redraw();
					} else if (blockName.startsWith("RELIA Variable Chooser")) {
						var chooser = new ReliaPushButton($newDiv, deviceName, blockName);
						self.blocks.push(chooser);
						chooser.redraw();
					};
				});
			});
		});
	});
}

