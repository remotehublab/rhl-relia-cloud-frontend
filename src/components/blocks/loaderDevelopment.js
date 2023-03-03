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


export function ReliaWidgets($divElement, device_ids, session_id, type) {
	var self = this;
	self.blocks = [];
        var devicesUrl = window.API_BASE_URL + "data/current/devices/" + session_id;

        $.get(devicesUrl).done(function (data) {
		if (!data.success) {
			console.log("Error loading devices:", data);
			return;
		}

		var devices = data.devices;
                console.log(devices);
		$.each(devices, function (pos, deviceName) {
                  	if (deviceName == device_ids) {
				var $deviceContents = $("<div class=\"row\">" +
					"<h3>" + deviceName + "</h3>" +
				"</div>");
				$divElement.append($deviceContents);
				var blocksUrl = window.API_BASE_URL + "data/current/devices/" + deviceName + "/" + session_id + "/blocks";
                		console.log("Extracted device name")
				$.get(blocksUrl).done(function (data) {
					if (!data.success) {
						console.log("Error loading blocks:", data);
						return;
					}
					$.each(data.blocks, function (post, blockName) {
						var $newDiv = $(
							'<div class="col-xs-12 col-sm-6 col-lg-4" style="padding: 10px">' +
								'<div style="width: 100%; border: 1px solid black; border-radius: 20px; background: #eee; padding: 10px">' +
									"<h5>" + blockName + "</h5>" +
									"<div class=\"block-contents\" style=\"width: 100%\"></div>" +
								'</div>' +
							'</div>');
						$deviceContents.append($newDiv);
						var $divContents = $newDiv.find(".block-contents");
						console.log("Loading...", deviceName, blockName);
						if (blockName.startsWith("RELIA Constellation Sink")) {
							var constellationSink = new ReliaConstellationSink($divContents, deviceName, blockName, session_id);
							self.blocks.push(constellationSink);
							constellationSink.redraw();
						} else if (blockName.startsWith("RELIA Time Sink")) {
							var timeSink = new ReliaTimeSink($divContents, deviceName, blockName, session_id);
							self.blocks.push(timeSink);
							timeSink.redraw();
						} else if (blockName.startsWith("RELIA Vector Sink")) {
							var vectorSink = new ReliaVectorSink($divContents, deviceName, blockName, session_id);
							self.blocks.push(vectorSink);
							vectorSink.redraw();
						} else if (blockName.startsWith("RELIA Variable Range")) {
							var variableRange = new ReliaVariableRange($divContents, deviceName, blockName, session_id);
							self.blocks.push(variableRange);
							variableRange.redraw();
						} else if (blockName.startsWith("RELIA Histogram Sink")) {
							var histogramSink = new ReliaHistogramSink($divContents, deviceName, blockName, session_id);
							self.blocks.push(histogramSink);
							histogramSink.redraw();
						} else if (blockName.startsWith("RELIA Variable CheckBox")) {
							var checkBox = new ReliaCheckBox($divContents, deviceName, blockName, session_id);
							self.blocks.push(checkBox);
							checkBox.redraw();
						} else if (blockName.startsWith("RELIA Variable PushButton")) {
							var pushbutton = new ReliaPushButton($divContents, deviceName, blockName, session_id);
							self.blocks.push(pushbutton);
							pushbutton.redraw();
						} else if (blockName.startsWith("RELIA Variable Chooser")) {
							var chooser = new ReliaChooser($divContents, deviceName, blockName, session_id);
							self.blocks.push(chooser);
							chooser.redraw();
						} else if (blockName.startsWith("RELIA Number Sink")) {
							var numbersink = new ReliaNumberSink($divContents, deviceName, blockName, session_id);
							self.blocks.push(numbersink);
							numbersink.redraw();
						} else if (blockName.startsWith("RELIA Eye Plot")) {
							var eyeplot = new ReliaEyePlot($divContents, deviceName, blockName, session_id);
							self.blocks.push(eyeplot);
							eyeplot.redraw();
						} else if (blockName.startsWith("RELIA Frequency Sink")) {
							var frequencysink = new ReliaFrequencySink($divContents, deviceName, blockName, session_id);
							self.blocks.push(frequencysink);
							frequencysink.redraw();
						};
					});
					if (type == "transmitter") {
						window.TRANSMITTER_DISPLAYED = 1;
					} else if (type == "receiver") {
						window.RECEIVER_DISPLAYED = 1;
					}
				});
			}
		});
	});
}