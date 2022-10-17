import $ from 'jquery';
import useScript from '../../useScript';

export function ReliaVariableRange($divElement, deviceIdentifier, blockIdentifier) {
	var self = this;

	self.$div = $divElement;

	self.$div.html(
	    "<h3>Variable Range " + blockIdentifier + " of " + deviceIdentifier + "</h3>" +
	    "<div>" +
	        "<input class=\"slider\" type=\"range\" min=\"-16000\" max=\"16000\" >" +
		"<p class=\"slider-value\" value=\"1\"></p> <br>" +
	    "</div>"
	);

	self.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;

	self.factor = 0;

	self.$slider = self.$div.find(".slider"); // <input>
	self.$sliderValue = self.$div.find(".slider-value"); // <p>

	self.changeSlider = function () {
  		self.factor = self.$slider.val();
		self.$sliderValue.text(self.factor);

		$.ajax({
			type: "POST",
			url: self.url, 
			data: JSON.stringify({
				"value": self.factor
			}),
			contentType: "application/json",
			dataType: "json"
		}).done(function () {
			// TBD
		});
	};
	self.changeSlider();

	self.$slider.change(self.changeSlider);

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
			var max_freqqq=params.x_start+params.x_step*(params.vlen-1)
			console.log("min", params.x_start, "; max", max_freqqq);
			self.$slider.attr("min",params.x_start);
			self.$slider.attr("max",max_freqqq);
		});
	};
}

export default ReliaVariableRange;
