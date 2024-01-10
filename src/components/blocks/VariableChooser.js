import $ from 'jquery';
import { t } from '../../i18n';
import slugify from 'react-slugify';
import ReliaWidget from './ReliaWidget';

window.reliaVariableChooserIdentifierNumber = 0;

export class ReliaVariableChooser extends ReliaWidget {
	constructor($divElement, deviceIdentifier, blockIdentifier, taskIdentifier) {
		super($divElement, deviceIdentifier, blockIdentifier, taskIdentifier);
		var self = this;

		self.$div.html(
			"<div>" +
			"</div>"
		);

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

	handleResponseData(data) {
		var self = this;
		var params = data.params;

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
	}

	translatedName() {
		return t("widgets.variable-chooser.name");
	}
}

export default ReliaVariableChooser;
