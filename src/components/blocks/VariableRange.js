import $ from 'jquery';
import { t } from '../../i18n';
import ReliaWidget from './ReliaWidget';

export class ReliaVariableRange extends ReliaWidget {
	constructor($divElement, deviceIdentifier, blockIdentifier) {
		super($divElement, deviceIdentifier, blockIdentifier);

		var self = this;

		self.$div.html(
			"<div>" +
			"<input class=\"slider\" type=\"range\" min=\"0\" max=\"10\" >" +
			"<p class=\"slider-value\" value=\"1\"></p> <br>" +
			"</div>"
		);

		self.value = 0;

		self.$slider = self.$div.find(".slider"); // <input>
		self.$sliderValue = self.$div.find(".slider-value"); // <p>

		self.changeSlider = function () {
			self.value = self.$slider.val();
			self.$sliderValue.text(self.value);

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
		self.changeSlider();

		self.$slider.change(self.changeSlider);

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
		self.$slider.attr("min", params.min);
		self.$slider.attr("max", params.max);
	}

	translatedName() {
		return t("widgets.variable-range.name");
	}
}

export default ReliaVariableRange;
