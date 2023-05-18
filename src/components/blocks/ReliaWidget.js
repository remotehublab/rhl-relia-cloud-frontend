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
    }

    performRequest() {
        var self = this;

        $.get(this.url).done(function (response) {
            if (!self.running) {
                // Do not even print the new data
                return;
            }

            if (!response.success) {
                console.log("Error: " + response.message);
                return;
            }

            if (response.data == null) {
                console.log("No data");
                return;
            }

            console.log("ReliaWidget::calling handleNewData()");
            self.handleResponseData(response);
        });
    }

    redraw () {
        console.log("ReliaWidget::redraw() called. About to raise an error");
        throw "redraw not implemented";
    }

    handleResponseData (response) {
        console.log("ReliaWidget::handleResponseData() called. About to raise an error");
        throw "handleNewData not implemented";
    }

    stop() {
        this.running = false;
    }
}

export default ReliaWidget;