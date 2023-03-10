import $ from 'jquery';
import useScript from '../../useScript';
import slugify from 'react-slugify';

window.reliaVariableChooserIdentifierNumber = 0;

export function ReliaVariableChooser($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<div>" +
	    "</div>"
	);

	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

	window.reliaVariableChooserIdentifierNumber = window.reliaVariableChooserIdentifierNumber + 1;

	self.radioButtonName = "radio-device-" + slugify(deviceIdentifier) + "-block-" + slugify(blockIdentifier) + "-number-" + window.reliaVariableChooserIdentifierNumber;

	self.$chooserInput = self.$div.find("div");

	self.stateInitialized = false;

	// whenever we initialize this widget, it will obtain the options and labels
	// and it will be filled as in:
	// {
	// 	option1: label1,
	// 	option2: label2,
	// }
	self.choices = {};


	self.changeChooser = function () {
		var checked = self.$chooserInput.find("input:checked");
		if (checked.length == 0)
			// no checked option
			return;
		
		var value = checked.attr("value");
	
		console.log("on chooser change:", value);

		$.ajax({
			type: "POST",
			url: self.url, 
			data: JSON.stringify({
				"value": value
			}),
			contentType: "application/json",
			dataType: "json"
		}).done(function () {
			// TBD
		});
	};
	self.changeChooser();

	self.$chooserInput.change(self.changeChooser);

	self.redraw = function () {
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

			console.log(data.data);

			var params = data.data.params;

			// params.labels: ["Square", "Cosine"]
			// params.options: [ 1, 2 ]
			$.each(params.labels, function (index, label) {
				var correspondingOption = params.options[index];
				if (self.$chooserInput.find('input[value="' + correspondingOption + '"]').length == 0) {
					var optionIdentifier = self.radioButtonName + "-" + correspondingOption;
					self.choices[correspondingOption] = label;
					self.$chooserInput.append(
						'<div class="form-check">' +
						'<input class="form-check-input" name="' + self.radioButtonName + '" type="radio" id="' + optionIdentifier + '" value="' + correspondingOption + '">' +
						'<label class="form-check-label" for="' + optionIdentifier + '">' +
							label +
						'</label>' +
						'</div>'
					);
				}
			});

			if (!self.stateInitialized) {
				if (params.state) {
					self.$chooserInput.find("input").prop("checked", false);
					self.$chooserInput.find('input[value="' + params.state + '"]').prop("checked", true);
				} else {
					self.$chooserInput.find("input").prop("checked", false);
				}
				self.stateInitialized = true;
			}
		});
	};

	$.ajax({
		type: "POST",
		url: self.url, 
		data: JSON.stringify({
			"forceUploadData": true
		}),
		contentType: "application/json",
		dataType: "json"
	}).done(function () {
		// TBD
	});

}

export default ReliaVariableChooser;
