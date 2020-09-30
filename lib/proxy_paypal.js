'use strict';

/**
 *  Proxy that allows a CA to pay using PayPal.
 *
 * @module caf_paypal/proxy_paypal
 * @augments external:caf_components/gen_proxy
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genProxy = caf_comp.gen_proxy;

exports.newInstance = async function($, spec) {
    try {
        const that = genProxy.create($, spec);

        /**
         * Creates a PayPal order to buy units.
         *
         * This is a `dirty` call, i.e., outside the transaction that process
         * the request, and it could externalize and forget about its actions
         * if there are failures or errors.
         *
         * In practice this means that it could create "abandoned" orders that
         * PayPal will eventually garbage collect.
         *
         * @param {number} units The number of units to purchase.
         *
         * @return {Promise<{id: string}>} A promise to an order id.
         *
         * @throws {Error} When it cannot create the order.
         *
         * @memberof! module:caf_paypal/proxy_paypal#
         * @alias dirtyCreateOrder
         */
        that.dirtyCreateOrder = function(units) {
            return $._.dirtyCreateOrder(units);
        };
        /**
         * Captures the funds of an accepted order.
         *
         * This is a `dirty` call, i.e., outside the transaction that process
         * the request, and it could externalize and forget about its actions
         * if there are failures or errors.
         *
         * This call is idempotent, and the caller should retry it until it
         * succeeds.
         *
         * @param {string} id The identifier of the order.
         *
         * @return {Promise<orderType>} A promise to an order id.
         *
         * @throws {Error} When it cannot capture the order.
         *
         * @memberof! module:caf_paypal/proxy_paypal#
         * @alias dirtyCaptureOrder
         */
        that.dirtyCaptureOrder = function(id) {
            return $._.dirtyCaptureOrder(id);
        };

        /**
         * Gets the total cost in dollars.
         *
         * @param {number} units The number of units.
         *
         * @return {number} The total cost in dollars.
         *
         * @memberof! module:caf_paypal/proxy_paypal#
         * @alias getPrice
         */
        that.getPrice = function(units) {
            return $._.getPrice(units);
        };

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
