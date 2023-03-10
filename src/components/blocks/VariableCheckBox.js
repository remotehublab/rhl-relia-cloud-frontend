import $ from 'jquery';
import useScript from '../../useScript';

export function ReliaVariableCheckBox($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<div>" +
	        "<input class=\"checkbox\" type=\"checkbox\">" +
		"<p class=\"checkbox-value\"></p> <br>" +
	    "</div>"
	);

	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

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
	
		console.log("on checkbox change:", self.value);

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

export default ReliaVariableCheckBox;
