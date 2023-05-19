import $ from 'jquery';
import ReliaWidget from './ReliaWidget';

export class ReliaVariablePushButton extends ReliaWidget {
	constructor($divElement, deviceIdentifier, blockIdentifier) {
		super($divElement, deviceIdentifier, blockIdentifier);
		var self = this;

		self.$div.html(
			"<div>" +
			"<button class=\"button press-button\">Push</button>" +
			"</div>"
		);

		self.stateInitialized = false;

		self.flagPressedUnpressed = false;

		self.$button = self.$div.find("button");

		self.$button.bind('mousedown touchstart', function () {
			self.flagPressedUnpressed = true;
			self.changePushButton();
		});

		self.$button.bind('mouseup touchend', function () {
			self.flagPressedUnpressed = false;
			self.changePushButton();
		});

		self.changePushButton = function () {
			console.log("on push button change:", self.flagPressedUnpressed);

			$.ajax({
				type: "POST",
				url: self.url,
				data: JSON.stringify({
					"value": self.flagPressedUnpressed
				}),
				contentType: "application/json",
				dataType: "json"
			}).done(function () {
				// TBD
			});
		};
		// self.changePushButton();

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
		if (params.label != undefined && params.label != null)
			self.$button.text(params.label);
	}
}

export default ReliaVariablePushButton;
