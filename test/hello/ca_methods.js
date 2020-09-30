"use strict";

exports.methods = {
    async __ca_init__() {
        this.$.log.debug("++++++++++++++++Calling init");
        this.state.pulses = 0;
        this.state.nCalls = 0;
        this.state.lastResponse = {};
        return [];
    },
    async __ca_pulse__() {
        this.state.pulses = this.state.pulses + 1;
        this.$.log.debug('<<< Calling Pulse>>>' + this.state.pulses);
        if (this.state.lastResponse) {
            this.$.log.debug('Last response: ' +
                             JSON.stringify(this.state.lastResponse));
        }
        return [];
    },
    async createOrder(units) {
        const id = await this.$.paypal.dirtyCreateOrder(units);
        return [null, id];
    },
    async captureOrder(id) {
        try {
            const order = await this.$.paypal.dirtyCaptureOrder(id);
            return [null, order];
        } catch (err) {
            return [err];
        }
    },
    async getPrice(units) {
        return [null, this.$.paypal.getPrice(units)];

    },
    async getState() {
        return [null, this.state];
    }
};
