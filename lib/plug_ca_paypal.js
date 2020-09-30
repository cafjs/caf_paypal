'use strict';

const json_rpc = require('caf_transport').json_rpc;

/**
 * Manages payment transactions for this CA.
 *
 *
 * @module caf_paypal/plug_ca_paypal
 * @augments external:caf_components/gen_plug_ca
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genPlugCA = caf_comp.gen_plug_ca;

exports.newInstance = async function($, spec) {
    try {
        const that = genPlugCA.create($, spec);
        const owner = json_rpc.splitName($.ca.__ca_getName__())[0];

        that.getPrice = (units) => $._.$.paypal.getPrice(units);

        that.dirtyCreateOrder = (units) =>
            $._.$.paypal.createOrder(owner, units, that.getPrice(units));

        that.dirtyCaptureOrder = (id) => $._.$.paypal.captureOrder(id);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
