import $ from 'jquery';
import useScript from '../../useScript';

export function ReliaVariablePushButton($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
		"<div>" +
			"<button class=\"button press-button\">Push</button>" +
		"</div>"
	);

	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

	self.stateInitialized = false;

	self.flagPressedUnpressed = false;

	self.$button = self.$div.find("button");

	self.$button.bind('mousedown touchstart', function() {
		self.flagPressedUnpressed = true;
		self.changePushButton();
	});

	self.$button.bind('mouseup touchend', function() {
		self.flagPressedUnpressed = false;
		self.changePushButton();
	});

	self.changePushButton = function() {
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
			if (params.label != undefined && params.label != null)
				self.$button.text(params.label);
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

export default ReliaVariablePushButton;
