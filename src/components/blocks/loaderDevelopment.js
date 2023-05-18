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
import ReliaNumberSink from './NumberSink.js';
import ReliaEyePlot from './EyePlot.js';
import ReliaFrequencySink from './FrequencySink.js';

export function ReliaWidgets($divElement) {
	var self = this;
	this.devicesUrl = window.API_BASE_URL + "data/current/devices";
	// this.blocksById = {
	//     deviceName1: [block1, block2...],
	//     deviceName2: [block3, block4...],
	// }
	this.blocksById = {};
	this.running = false;
	this.$divElement = $divElement;
	this.blocks = [];
}

var CHECK_DEVICES_TIME_MS = 1000;

ReliaWidgets.prototype.start = function () {
	this.running = true;
	this.process();
}

ReliaWidgets.prototype.stop = function () {
	this.running = false;

	for (var i = 0; i < this.blocks.length; i++) {
		var block = this.blocks[i];
		console.log("Calling stop on", block);
		block.stop();
	}
}

ReliaWidgets.prototype.process = function () {
	var self = this;

	if (!self.running) {
		return;
	}

	// we are running

	$.get(self.devicesUrl).done(function (data) {
		if (!data.success) {
			console.log("Error loading devices:", data);
			return;
		}

		setTimeout(function () {
			self.process();
		}, CHECK_DEVICES_TIME_MS);

		var devices = data.devices;
		$.each(devices, function (pos, deviceName) {
			var $deviceContents;
			var deviceNameIdentifier = "device-" + deviceName.replaceAll(":", "-").replaceAll(" ", "-").replaceAll("[", "-").replaceAll("]", "-");
			if (!self.blocksById[deviceName]) {
				console.log("device name ", deviceName, " not found in self.blocksById. Creating new block with identifier: ", deviceNameIdentifier);
				$deviceContents = $("<div id='" + deviceNameIdentifier + "' class='col-6'><center><h2>Device: " + deviceName + "</h2></center><br>" + "</div>");
				self.$divElement.append($deviceContents);
				self.blocksById[deviceName] = {};
			} else {
				$deviceContents = $("#" + deviceNameIdentifier);
			}

			var blocksUrl = window.API_BASE_URL + "data/current/devices/" + deviceName + "/blocks";
			$.get(blocksUrl).done(function (data) {
				if (!data.success) {
					console.log("Error loading blocks:", data);
					return;
				}
				// console.log("Listing blocks in ", deviceName);
				$.each(data.blocks, function (post, blockName) {
					// console.log("Block", blockName, " found at ", deviceName);
					if (self.blocksById[deviceName] && !self.blocksById[deviceName][blockName]) {
						// console.log("Block", blockName, " found at ", deviceName, "was NOT included, so we include it now");
						var $newDiv = $(
							'<div class="" style="padding: 10px">' +
							'<div style="width: 100%; border: 1px solid black; border-radius: 20px; background: #eee; padding: 10px">' +
							"<h5>" + blockName + "</h5>" +
							"<div class=\"block-contents\" style=\"width: 100%\"></div>" +
							'</div>' +
							'</div>');
						$deviceContents.append($newDiv);
						var $divContents = $newDiv.find(".block-contents");
						console.log("Loading...", deviceName, blockName);
						if (blockName.startsWith("RELIA Constellation Sink")) {
							var constellationSink = new ReliaConstellationSink($divContents, deviceName, blockName);
							self.blocks.push(constellationSink);
							self.blocksById[deviceName][blockName] = constellationSink;
							constellationSink.start();
						} else if (blockName.startsWith("RELIA Time Sink")) {
							var timeSink = new ReliaTimeSink($divContents, deviceName, blockName);
							self.blocks.push(timeSink);
							self.blocksById[deviceName][blockName] = timeSink;
							timeSink.redraw();
						} else if (blockName.startsWith("RELIA Vector Sink")) {
							var vectorSink = new ReliaVectorSink($divContents, deviceName, blockName);
							self.blocks.push(vectorSink);
							self.blocksById[deviceName][blockName] = vectorSink;
							vectorSink.redraw();
						} else if (blockName.startsWith("RELIA Variable Range")) {
							var variableRange = new ReliaVariableRange($divContents, deviceName, blockName);
							self.blocks.push(variableRange);
							self.blocksById[deviceName][blockName] = variableRange;
							variableRange.redraw();
						} else if (blockName.startsWith("RELIA Histogram Sink")) {
							var histogramSink = new ReliaHistogramSink($divContents, deviceName, blockName);
							self.blocks.push(histogramSink);
							self.blocksById[deviceName][blockName] = histogramSink;
							histogramSink.redraw();	
						} else if (blockName.startsWith("RELIA Variable CheckBox")) {
							var checkBox = new ReliaCheckBox($divContents, deviceName, blockName);
							self.blocks.push(checkBox);
							self.blocksById[deviceName][blockName] = checkBox;
							checkBox.redraw();
						} else if (blockName.startsWith("RELIA Variable PushButton")) {
							var pushbutton = new ReliaPushButton($divContents, deviceName, blockName);
							self.blocks.push(pushbutton);
							self.blocksById[deviceName][blockName] = pushbutton;
							pushbutton.redraw();
						} else if (blockName.startsWith("RELIA Variable Chooser")) {
							var chooser = new ReliaChooser($divContents, deviceName, blockName);
							self.blocks.push(chooser);
							self.blocksById[deviceName][blockName] = chooser;
							chooser.redraw();
						} else if (blockName.startsWith("RELIA Number Sink")) {
							var numbersink = new ReliaNumberSink($divContents, deviceName, blockName);
							self.blocks.push(numbersink);
							self.blocksById[deviceName][blockName] = numbersink;
							numbersink.redraw();
						} else if (blockName.startsWith("RELIA Eye Plot")) {
							var eyeplot = new ReliaEyePlot($divContents, deviceName, blockName);
							self.blocks.push(eyeplot);
							self.blocksById[deviceName][blockName] = eyeplot;
							eyeplot.redraw();
						} else if (blockName.startsWith("RELIA Frequency Sink")) {
							var frequencysink = new ReliaFrequencySink($divContents, deviceName, blockName);
							self.blocks.push(frequencysink);
							self.blocksById[deviceName][blockName] = frequencysink;
							frequencysink.start();
						};
						// $("#all-together").load(window.location.href + " #all-together");
					} else {
						if (self.blocksById[deviceName]) {
							var block = self.blocksById[deviceName][blockName];
							if (block)
								block.start();
						}
					}
				});
			});
		});
	});
}
