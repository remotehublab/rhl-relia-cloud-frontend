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
	var devicesUrl = window.API_BASE_URL + "data/current/devices";
	self.blocks = [];

	$.get(devicesUrl).done(function (data) {
		if (!data.success) {
			console.log("Error loading devices:", data);
			return;
		}

		var devices = data.devices;
		$.each(devices, function (pos, deviceName) {
           		var $deviceContents;
            // window.BLOCKS = {
            //     deviceName1: [block1, block2...],
            //     deviceName2: [block3, block4...],
            // }
            var deviceNameIdentifier = "device-" + deviceName.replaceAll(":", "-").replaceAll(" ", "-").replaceAll("[", "-").replaceAll("]", "-");
			if (!window.BLOCKS.has(deviceName)) {
    				$deviceContents = $("<div id='" + deviceNameIdentifier + "' class='col-6'><center><h2>Device:" + deviceName + "</h2></center><br>" + "</div>");
				$divElement.append($deviceContents);
				window.BLOCKS.set(deviceName, []);
				window.TIMES.set(deviceName, []);
			} else {
    				$deviceContents = $("#" + deviceNameIdentifier);
            		}
            
			for (let j = 0; j < window.TIMES.get(deviceName).length; j++) {
				window.TIMES.get(deviceName)[j] -= 1;
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
					if (!window.BLOCKS.get(deviceName).includes(blockName)) {
                        // console.log("Block", blockName, " found at ", deviceName, "was NOT included, so we include it now");
						window.BLOCKS.get(deviceName).push(blockName);
						window.TIMES.get(deviceName).push(10);
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
							constellationSink.redraw();	
						} else if (blockName.startsWith("RELIA Time Sink")) {
							var timeSink = new ReliaTimeSink($divContents, deviceName, blockName);
							self.blocks.push(timeSink);
							timeSink.redraw();
						} else if (blockName.startsWith("RELIA Vector Sink")) {
							var vectorSink = new ReliaVectorSink($divContents, deviceName, blockName);
							self.blocks.push(vectorSink);
							vectorSink.redraw();
						} else if (blockName.startsWith("RELIA Variable Range")) {
							var variableRange = new ReliaVariableRange($divContents, deviceName, blockName);
							self.blocks.push(variableRange);
							variableRange.redraw();
						} else if (blockName.startsWith("RELIA Histogram Sink")) {
							var histogramSink = new ReliaHistogramSink($divContents, deviceName, blockName);
							self.blocks.push(histogramSink);
							histogramSink.redraw();
						} else if (blockName.startsWith("RELIA Variable CheckBox")) {
							var checkBox = new ReliaCheckBox($divContents, deviceName, blockName);
							self.blocks.push(checkBox);
							checkBox.redraw();
						} else if (blockName.startsWith("RELIA Variable PushButton")) {
							var pushbutton = new ReliaPushButton($divContents, deviceName, blockName);
							self.blocks.push(pushbutton);
							pushbutton.redraw();
						} else if (blockName.startsWith("RELIA Variable Chooser")) {
							var chooser = new ReliaChooser($divContents, deviceName, blockName);
							self.blocks.push(chooser);
							chooser.redraw();
						} else if (blockName.startsWith("RELIA Number Sink")) {
							var numbersink = new ReliaNumberSink($divContents, deviceName, blockName);
							self.blocks.push(numbersink);
							numbersink.redraw();
						} else if (blockName.startsWith("RELIA Eye Plot")) {
							var eyeplot = new ReliaEyePlot($divContents, deviceName, blockName);
							self.blocks.push(eyeplot);
							eyeplot.redraw();
						} else if (blockName.startsWith("RELIA Frequency Sink")) {
							var frequencysink = new ReliaFrequencySink($divContents, deviceName, blockName);
							self.blocks.push(frequencysink);
							frequencysink.redraw();
						};
						// $("#all-together").load(window.location.href + " #all-together");
					}
				});
			});
		});
	});
}
