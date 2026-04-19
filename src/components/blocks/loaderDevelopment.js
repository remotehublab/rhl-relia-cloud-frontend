import $ from 'jquery';

import { t } from '../../i18n';

import ReliaConstellationSink from './ConstellationSink.js';
import ReliaTimeSink from './TimeSink.js';
import ReliaVectorSink from './VectorSink.js';
import ReliaVariableRange from './VariableRange.js';
import ReliaHistogramSink from './HistogramSink.js';
import ReliaCheckBox from './VariableCheckBox.js';
import ReliaPushButton from './VariablePushButton.js';
import ReliaChooser from './VariableChooser.js';
import ReliaNumberSink from './NumberSink.js';
import ReliaEyePlot from './EyePlot.js';
import ReliaFrequencySink from './FrequencySink.js';
import ReliaAutoCorrSink from './AutoCorrSink.js';

var CHECK_DEVICES_TIME_MS = 500;

window.RELIA_WIDGETS_COUNTER = 0;

export class ReliaWidgets {
	constructor($divElement, taskId, currentSessionRef) {
		window.RELIA_WIDGETS_COUNTER = window.RELIA_WIDGETS_COUNTER + 1;
		this.identifier = window.RELIA_WIDGETS_COUNTER;
		this.taskId = taskId;
		this.currentSessionRef = currentSessionRef;
		this.devicesUrl = window.API_BASE_URL + "data/tasks/" + taskId + "/devices";
		this.blocksById = {};
		this.blockStatusesByDevice = {};
		this.unsupportedBlocksByDevice = {};
		this.deviceStatuses = {
			receiver: { state: 'initializing' },
			transmitter: { state: 'initializing' }
		};
		this.loggedTrackedDeviceNameSets = new Set();
		this.loggedWaitingWithVisiblePlotSignatures = new Set();
		this.running = false;
		this.$divElement = $divElement;
		this.blocks = [];
		console.log("new ReliaWidgets() with identifier ", this.identifier, "length:", $divElement.length);
	}

	clean() {
		this.blocksById = {};
		this.blockStatusesByDevice = {};
		this.unsupportedBlocksByDevice = {};
		this.loggedTrackedDeviceNameSets.clear();
		this.loggedWaitingWithVisiblePlotSignatures.clear();
		this.blocks = [];
		this.$divElement.find("#relia-widgets-receiver").empty();
		this.$divElement.find("#relia-widgets-transmitter").empty();
	}

	start() {
		if (!this.running) {
			console.log("Starting ReliaWidgets(id=" + this.identifier + ")");
			this.running = true;
			this.setDeviceStatus('receiver', 'initializing');
			this.setDeviceStatus('transmitter', 'initializing');
			this.process();
		}
	}

	stop() {
		console.log("Stopping ReliaWidgets(id=" + this.identifier + ")");
		if (this.running) {
			this.running = false;

			for (var i = 0; i < this.blocks.length; i++) {
				var block = this.blocks[i];
				block.stop();
			}
		}
	}

	getAssistantContext() {
		const receiverPlots = [];
		const transmitterPlots = [];

		for (var i = 0; i < this.blocks.length; i++) {
			const block = this.blocks[i];
			if (!block || !block.getAiContext) {
				continue;
			}

			const snapshot = block.getAiContext();
			if (!snapshot) {
				continue;
			}

			if (this.getDeviceType(block.deviceIdentifier) === 'receiver') {
				receiverPlots.push(snapshot);
			} else {
				transmitterPlots.push(snapshot);
			}
		}

		return {
			receiverPlots,
			transmitterPlots,
			deviceStatuses: this.getDeviceStatuses()
		};
	}

	getDeviceStatuses() {
		return {
			receiver: this.deviceStatuses.receiver.state,
			transmitter: this.deviceStatuses.transmitter.state
		};
	}

	getDeviceType(deviceIdentifier) {
		return deviceIdentifier.endsWith(':r') ? 'receiver' : 'transmitter';
	}

	getDeviceNameForType(deviceType) {
		const assignedInstanceName = this.currentSessionRef.current && this.currentSessionRef.current.assignedInstanceName;
		if (!assignedInstanceName) {
			return null;
		}

		return assignedInstanceName + ":" + deviceType[0];
	}

	getTrackedDeviceNames(deviceType) {
		const trackedDeviceNames = new Set();
		const currentDeviceName = this.getDeviceNameForType(deviceType);

		if (currentDeviceName) {
			trackedDeviceNames.add(currentDeviceName);
		}

		[
			Object.keys(this.blocksById),
			Object.keys(this.blockStatusesByDevice),
			Object.keys(this.unsupportedBlocksByDevice)
		].forEach((deviceNames) => {
			deviceNames.forEach((deviceName) => {
				if (this.getDeviceType(deviceName) === deviceType) {
					trackedDeviceNames.add(deviceName);
				}
			});
		});

		const trackedDeviceNamesList = Array.from(trackedDeviceNames);
		if (trackedDeviceNamesList.length > 1) {
			const signature = deviceType + ":" + trackedDeviceNamesList.slice().sort().join("|");
			if (!this.loggedTrackedDeviceNameSets.has(signature)) {
				console.debug("ReliaWidgets detected multiple tracked device names for one side", {
					taskId: this.taskId,
					deviceType: deviceType,
					currentDeviceName: currentDeviceName,
					trackedDeviceNames: trackedDeviceNamesList
				});
				this.loggedTrackedDeviceNameSets.add(signature);
			}
		}

		return trackedDeviceNamesList;
	}

	getTrackedDeviceData(deviceType) {
		const deviceNames = this.getTrackedDeviceNames(deviceType);
		const statuses = [];
		const unsupportedBlocks = [];

		deviceNames.forEach((deviceName) => {
			statuses.push(...Object.values(this.blockStatusesByDevice[deviceName] || {}));
			unsupportedBlocks.push(...(this.unsupportedBlocksByDevice[deviceName] || []));
		});

		return {
			deviceNames,
			statuses,
			unsupportedBlocks
		};
	}

	hasTrackedSnapshotForDeviceType(deviceType) {
		return this.getTrackedDeviceData(deviceType).statuses.some((status) => status.state === 'rendered' || status.hasSnapshot);
	}

	logWaitingForDataWithVisiblePlot(deviceType, deviceNames, statuses) {
		const $deviceContainer = this.$divElement.find("#relia-widgets-" + deviceType);
		if (!$deviceContainer.find('svg, canvas').length) {
			return;
		}

		const blockStatuses = [];
		deviceNames.forEach((deviceName) => {
			Object.entries(this.blockStatusesByDevice[deviceName] || {}).forEach(([blockName, status]) => {
				blockStatuses.push({
					deviceName,
					blockName,
					state: status.state,
					hasSnapshot: !!status.hasSnapshot,
					error: status.error || null
				});
			});
		});

		const signature = JSON.stringify({
			deviceType,
			blockStatuses
		});
		if (this.loggedWaitingWithVisiblePlotSignatures.has(signature)) {
			return;
		}

		console.debug('ReliaWidgets waiting_for_data while plot DOM exists', {
			taskId: this.taskId,
			deviceType,
			deviceNames,
			blockStatuses
		});
		this.loggedWaitingWithVisiblePlotSignatures.add(signature);
	}

	getStatusMessage(state) {
		switch (state) {
			case 'initializing':
				return t("runner.widget-status.initializing");
			case 'waiting_for_block':
				return t("runner.widget-status.waiting-for-block");
			case 'waiting_for_data':
				return t("runner.widget-status.waiting-for-data");
			case 'retrying':
				return t("runner.widget-status.retrying");
			case 'failed':
				return t("runner.widget-status.failed");
			default:
				return '';
		}
	}

	getStatusClass(state) {
		switch (state) {
			case 'retrying':
				return 'alert alert-warning';
			case 'failed':
				return 'alert alert-danger';
			default:
				return 'alert alert-info';
		}
	}

	ensureDeviceStatusElement(deviceType) {
		const $deviceContainer = this.$divElement.find("#relia-widgets-" + deviceType);
		let $status = $deviceContainer.find(".relia-device-status");
		if (!$status.length) {
			$status = $("<div class='relia-device-status alert alert-info text-start mt-2' role='status'></div>");
			$deviceContainer.prepend($status);
		}
		return $status;
	}

	setDeviceStatus(deviceType, state, messageOverride = null) {
		this.deviceStatuses[deviceType] = {
			state: state
		};

		const $status = this.ensureDeviceStatusElement(deviceType);
		if (state === 'rendered') {
			$status.hide();
			return;
		}

		$status.removeClass('alert-info alert-warning alert-danger')
			.addClass(this.getStatusClass(state))
			.text(messageOverride || this.getStatusMessage(state))
				.show();
	}

	setDeviceStatusPreservingSnapshot(deviceType, state, messageOverride = null) {
		if (this.hasTrackedSnapshotForDeviceType(deviceType)) {
			this.setDeviceStatus(deviceType, 'rendered');
			return;
		}

		this.setDeviceStatus(deviceType, state, messageOverride);
	}

	registerBlockState(deviceName, blockName, widgetStatus) {
		if (!this.blockStatusesByDevice[deviceName]) {
			this.blockStatusesByDevice[deviceName] = {};
		}

		this.blockStatusesByDevice[deviceName][blockName] = widgetStatus;
		this.refreshDeviceTypeStatus(this.getDeviceType(deviceName));
	}

	refreshDeviceTypeStatus(deviceType) {
		const { deviceNames, statuses, unsupportedBlocks } = this.getTrackedDeviceData(deviceType);

		if (statuses.some((status) => status.state === 'rendered' || status.hasSnapshot)) {
			this.setDeviceStatus(deviceType, 'rendered');
			return;
		}

		if (!statuses.length) {
			if (unsupportedBlocks.length) {
				this.setDeviceStatus(deviceType, 'failed', t("runner.widget-status.unsupported-only"));
			} else {
				this.setDeviceStatus(deviceType, 'waiting_for_block');
			}
			return;
		}

		if (statuses.some((status) => status.state === 'retrying')) {
			this.setDeviceStatus(deviceType, 'retrying');
			return;
		}

		if (statuses.some((status) => status.state === 'failed')) {
			this.setDeviceStatus(deviceType, 'failed');
			return;
		}

		if (statuses.some((status) => status.state === 'waiting_for_data' || status.state === 'initializing')) {
			this.logWaitingForDataWithVisiblePlot(deviceType, deviceNames, statuses);
			this.setDeviceStatus(deviceType, 'waiting_for_data');
			return;
		}

		this.setDeviceStatus(deviceType, 'waiting_for_block');
	}

	refreshDeviceStatus(deviceName) {
		this.refreshDeviceTypeStatus(this.getDeviceType(deviceName));
	}

	refreshAllDeviceStatuses() {
		['receiver', 'transmitter'].forEach((deviceType) => {
			this.refreshDeviceTypeStatus(deviceType);
		});
	}

	addUnsupportedBlockNotice($deviceContents, deviceName, blockName) {
		if (!this.unsupportedBlocksByDevice[deviceName]) {
			this.unsupportedBlocksByDevice[deviceName] = [];
		}

		if (this.unsupportedBlocksByDevice[deviceName].includes(blockName)) {
			return;
		}

		this.unsupportedBlocksByDevice[deviceName].push(blockName);
		const $notice = $("<div class='alert alert-warning text-start mt-2'></div>");
		$notice.text(t("runner.widget-status.unsupported-block") + ": " + blockName);
		$deviceContents.append($notice);
		this.refreshDeviceTypeStatus(this.getDeviceType(deviceName));
	}

	buildBlock(deviceName, $divContents, blockName) {
		const self = this;
		const blockOptions = {
			onStateChange: function (widget, widgetStatus) {
				self.registerBlockState(deviceName, blockName, widgetStatus);
			}
		};

		if (blockName.startsWith("RELIA Constellation Sink")) {
			return new ReliaConstellationSink($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA Time Sink")) {
			return new ReliaTimeSink($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA Vector Sink")) {
			return new ReliaVectorSink($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA Variable Range")) {
			return new ReliaVariableRange($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA Histogram Sink")) {
			return new ReliaHistogramSink($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA Variable CheckBox")) {
			return new ReliaCheckBox($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA Variable PushButton")) {
			return new ReliaPushButton($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA Variable Chooser")) {
			return new ReliaChooser($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA Number Sink")) {
			return new ReliaNumberSink($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA Eye Plot")) {
			return new ReliaEyePlot($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA Frequency Sink")) {
			return new ReliaFrequencySink($divContents, deviceName, blockName, self.taskId, blockOptions);
		} else if (blockName.startsWith("RELIA AutoCorr Sink")) {
			return new ReliaAutoCorrSink($divContents, deviceName, blockName, self.taskId, blockOptions);
		}

		return null;
	}

	process() {
		var self = this;

		if (!self.running) {
			return;
		}

		$.get(self.devicesUrl).done(function (data) {
			if (!self.running) {
				return;
			}

			setTimeout(function () {
				self.process();
			}, CHECK_DEVICES_TIME_MS);

				if (!data.success) {
					console.log("Error loading devices:", data);
					self.setDeviceStatusPreservingSnapshot('receiver', 'retrying');
					self.setDeviceStatusPreservingSnapshot('transmitter', 'retrying');
					return;
				}

			const assignedInstance = self.currentSessionRef.current.assignedInstance;
			const assignedInstanceName = self.currentSessionRef.current.assignedInstanceName;
			console.log("assignedInstance: ", assignedInstance);

			if (assignedInstance === null) {
				self.setDeviceStatus('receiver', 'waiting_for_block');
				self.setDeviceStatus('transmitter', 'waiting_for_block');
				return;
			}

			var devices = ["receiver", "transmitter"];

			$.each(devices, function (pos, deviceType) {
				var $deviceContents;
				var deviceName = assignedInstanceName + ":" + deviceType[0];
				var deviceNameIdentifier = "device-" + deviceName.replaceAll(":", "-").replaceAll(" ", "-").replaceAll("[", "-").replaceAll("]", "-");
				if (!self.blocksById[deviceName]) {
					var $deviceContainer = self.$divElement.find("#relia-widgets-" + deviceType);
					$deviceContents = $("<div id='" + deviceNameIdentifier + "'>" + "</div>");
					$deviceContainer.append($deviceContents);
					self.blocksById[deviceName] = {};
				} else {
					$deviceContents = $("#" + deviceNameIdentifier);
				}

				self.refreshDeviceStatus(deviceName);

				var blocksUrl = window.API_BASE_URL + "data/tasks/" + self.taskId + "/devices/" + deviceName + "/blocks";
				$.get(blocksUrl).done(function (blockData) {
					if (!self.running) {
						return;
					}

						if (!blockData.success) {
							console.log("Error loading blocks:", blockData);
							self.setDeviceStatusPreservingSnapshot(deviceType, 'retrying');
							return;
						}

					if (!blockData.blocks.length) {
						self.refreshDeviceStatus(deviceName);
						return;
					}

					$.each(blockData.blocks, function (post, blockName) {
						if (self.blocksById[deviceName] && !self.blocksById[deviceName][blockName]) {
							var $newDiv = $(
								'<div class="" style="padding: 10px">' +
								'<div style="width: 100%; border: 1px solid black; border-radius: 20px; background: #eee; padding: 10px">' +
								"<h5 class='deviceTitle'></h5>" +
								"<div class=\"block-contents\" style=\"width: 100%\"></div>" +
								'</div>' +
								'</div>'
							);
							$deviceContents.append($newDiv);
							var $divContents = $newDiv.find(".block-contents");
							var block = self.buildBlock(deviceName, $divContents, blockName);
							if (!block) {
								console.log("Unsupported block: ", blockName);
								self.addUnsupportedBlockNotice($deviceContents, deviceName, blockName);
								return;
							}
							$newDiv.find("h5.deviceTitle").text(block.translatedIdentifier());
							self.blocks.push(block);
							self.blocksById[deviceName][blockName] = block;
							block.start();
						} else if (self.blocksById[deviceName]) {
							var existingBlock = self.blocksById[deviceName][blockName];
							if (existingBlock && !existingBlock.running) {
								existingBlock.start();
							}
						}
					});

					self.refreshDeviceStatus(deviceName);
					}).fail(function () {
						if (!self.running) {
							return;
						}
						self.setDeviceStatusPreservingSnapshot(deviceType, 'retrying');
					});
				});
			}).fail(function () {
				if (!self.running) {
					return;
				}
				self.setDeviceStatusPreservingSnapshot('receiver', 'retrying');
				self.setDeviceStatusPreservingSnapshot('transmitter', 'retrying');
				setTimeout(function () {
					self.process();
				}, CHECK_DEVICES_TIME_MS);
		});
	}
}
