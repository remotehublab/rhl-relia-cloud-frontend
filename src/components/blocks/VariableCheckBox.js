import $ from 'jquery';
import { t } from '../../i18n';
import ReliaWidget from './ReliaWidget';

export class ReliaVariableCheckBox extends ReliaWidget {
	constructor($divElement, deviceIdentifier, blockIdentifier) {
		super($divElement, deviceIdentifier, blockIdentifier);

		var self = this;

		self.$div.html(
			"<div>" +
			"<input class=\"checkbox\" type=\"checkbox\">" +
			"<p class=\"checkbox-value\"></p> <br>" +
			"</div>"
		);

		self.stateInitialized = false;
		self.value = false;
		self.choices = {
			"true": "true",
			"false": "false",
		};

		self.$checkbox = self.$div.find(".checkbox"); // <input>
		self.$checkboxValue = self.$div.find(".checkbox-value"); // <p>

		self.changeCheckBox = function () {
			self.value = self.$checkbox.is(":checked");
			self.$checkboxValue.text(self.choices[self.value]);

			// console.log("on checkbox change:", self.value);

			$.ajax({
				type: "POST",
				url: self.url,
				data: JSON.stringify({
					"value": self.value
				}),
				contentType: "application/json",
				dataType: "json"
			}).done(function () {
				// TBD
			});
		};
		self.changeCheckBox();

		self.$checkbox.change(self.changeCheckBox);

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
		self.choices = params.choices;

		if (!self.stateInitialized) {
			if (params.state) {
				self.$checkbox.prop('checked', true);
			} else {
				self.$checkbox.prop('checked', false);
			}
			self.stateInitialized = true;
		}
	}

	translatedName() {
		return t("widgets.variable-check-box.name");
	}
}

export default ReliaVariableCheckBox;
