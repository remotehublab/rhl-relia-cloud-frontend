import $ from 'jquery';
import useScript from '../../useScript';

export function ReliaVariableChooser($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<h3>Variable CheckBox " + blockIdentifier + " of " + deviceIdentifier + "</h3>" +
	    "<div>" +
		"<form>" +
		"  <select class=\"Chooser_Input\">" + 
		"  </select>" + 
		"</form>" +
	    "</div>"
	);

	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

	self.$chooserInput = self.$div.find(".Chooser_Input");
	self.$chooserInput.append( '<option value="'+1+'">'+'Option '+1+'</option>' );

	self.stateInitialized = false;
	self.value = false;
	self.choices = {
		"true": "true",
		"false": "false",
	};

	self.changeChooser = function () {
	
		console.log("on chooser change:", self.value);

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
			self.choices = params.choices;

			if (!self.stateInitialized) {
				if (params.state) {
					self.$checkbox.prop('checked', true);
				} else {
					self.$checkbox.prop('checked', false);
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
