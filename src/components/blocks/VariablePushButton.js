import $ from 'jquery';
import useScript from '../../useScript';

export function ReliaVariablePushButton($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<div>" +
		    "<input type=\"submit\" name=\"checkout\" class=\"button press-button\" value=\"On/Off\"> <br>" +
	    "</div>"
	);

	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

	self.stateInitialized = false;
	self.value = false;
	self.flagPressedUnpressed=true;


	self.changePushButton = function() {
		if (self.flagPressedUnpressed==true) 
			self.flagPressedUnpressed=false;
		else self.flagPressedUnpressed=true;
	
		console.log("on push button change:", self.value);

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
	self.$div.find(".press-button").click(self.changePushButton);
	self.changePushButton();

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
			self.choices = params.choices;

			if (!self.stateInitialized) {
				if (params.state) {
//					self.prop('checked', true);
				} else {
//					self.prop('checked', false);
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

export default ReliaVariablePushButton;
