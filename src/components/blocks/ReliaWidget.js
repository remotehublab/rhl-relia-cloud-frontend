import $ from 'jquery';

class ReliaWidget {
    constructor($divElement, deviceIdentifier, blockIdentifier) {
        this.$div = $divElement;
        this.deviceIdentifier = deviceIdentifier;
        this.blockIdentifier = blockIdentifier;
        this.url = window.API_BASE_URL + "data/current/devices/" + deviceIdentifier + "/blocks/" + blockIdentifier;
        this.running = false;
    }

    start() {
        this.running = true;
        this.redraw();
        this.performRequest();
    }

    performRequest() {
        var self = this;

        if (!this.running)
            return;

        $.get(this.url).done(function (response) {
            if (!self.running) {
                // Do not even print the new data
                return;
            }

            if (!response.success) {
                console.log("Error on request" + self.url + ": " + response.message, response);
                return;
            }

            if (response.data == null) {
                return;
            }

            // call redraw just after
            setTimeout(function () {
                self.redraw();
                self.performRequest();
            });

            self.handleResponseData(response.data);
        });
    }

    /*
    * redraw the widget. Optional method.
    */
    redraw () {}

    /*
    * handle the response data from the call to self.url. Mandatory method.
    */
    handleResponseData (response) {
        console.log("ReliaWidget::handleResponseData() called. About to raise an error");
        throw "handleNewData not implemented";
    }

    stop() {
        this.running = false;
    }
}

export default ReliaWidget;