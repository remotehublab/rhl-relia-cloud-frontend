import $ from 'jquery';

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

// how fast it should ask for devices
var CHECK_DEVICES_TIME_MS = 500;

export class ReliaWidgets {
	constructor($divElement) {
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

	start() {
		this.running = true;
		this.process();
	}

	stop() {
		this.running = false;

		for (var i = 0; i < this.blocks.length; i++) {
			var block = this.blocks[i];
			block.stop();
		}
	}

	process() {
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
								'</div>'
							);
							$deviceContents.append($newDiv);
							var $divContents = $newDiv.find(".block-contents");
							// console.log("Loading...", deviceName, blockName);
							var block; // a block inherits from ReliaWidget
							if (blockName.startsWith("RELIA Constellation Sink")) {
								block = new ReliaConstellationSink($divContents, deviceName, blockName);
							} else if (blockName.startsWith("RELIA Time Sink")) {
								block = new ReliaTimeSink($divContents, deviceName, blockName);
							} else if (blockName.startsWith("RELIA Vector Sink")) {
								block = new ReliaVectorSink($divContents, deviceName, blockName);
							} else if (blockName.startsWith("RELIA Variable Range")) {
								block = new ReliaVariableRange($divContents, deviceName, blockName);
							} else if (blockName.startsWith("RELIA Histogram Sink")) {
								block = new ReliaHistogramSink($divContents, deviceName, blockName);
							} else if (blockName.startsWith("RELIA Variable CheckBox")) {
								block = new ReliaCheckBox($divContents, deviceName, blockName);
							} else if (blockName.startsWith("RELIA Variable PushButton")) {
								block = new ReliaPushButton($divContents, deviceName, blockName);
							} else if (blockName.startsWith("RELIA Variable Chooser")) {
								block = new ReliaChooser($divContents, deviceName, blockName);
							} else if (blockName.startsWith("RELIA Number Sink")) {
								block = new ReliaNumberSink($divContents, deviceName, blockName);
							} else if (blockName.startsWith("RELIA Eye Plot")) {
								block = new ReliaEyePlot($divContents, deviceName, blockName);
							} else if (blockName.startsWith("RELIA Frequency Sink")) {
								block = new ReliaFrequencySink($divContents, deviceName, blockName);							
							} else { // Add more blocks here
								console.log("Unsupported block: ", blockName);
								return;
							}
							self.blocks.push(block);
							self.blocksById[deviceName][blockName] = block;
							block.start();
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
}