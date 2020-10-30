/*!
Copyright 2020 Caf.js Labs and contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';
/**
 * A plug to manage PayPal transactions.
 *
 *  Properties:
 *
 *       {payPalDir: string=, payPalFile: string, fixExpense: number,
 *        expensePerDollar: number}
 *
 * where:
 *
 * * `payPalDir:` a directory for PayPal config.
 * * `payPalFile`: a json file to configure PayPal. Its contents are of the
 * form `{clientId: string, clientSecret: string}`
 * * `fixExpense`: Fix cost for an order in dollars.
 * * `expensePerDollar`: extra cost in dollars per dollar spent.
 *
 * @module caf_paypal/plug_paypal
 * @augments external:caf_components/gen_plug
 */
// @ts-ignore: augments not attached to a class

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const caf_comp = require('caf_components');
const genPlug = caf_comp.gen_plug;
const paypalUtils = require('./util_paypal');

exports.newInstance = async function($, spec) {
    try {
        $._.$.log && $._.$.log.debug('New PayPal plug');

        const that = genPlug.create($, spec);

        const payPalDir = spec.env.payPalDir ||
              $.loader.__ca_firstModulePath__();

        const loadConfig = function(fileName) {
            try {
                const buf = fs.readFileSync(path.resolve(payPalDir,
                                                         fileName));
                return JSON.parse(buf.toString('utf8'));
            } catch (err) {
                $._.$.log && $._.$.log.debug('PayPal: trying default path ' +
                                             'for ' + fileName);
                return $._.$.loader.__ca_loadResource__(fileName);
            }
        };

        assert.equal(typeof spec.env.fixExpense, 'number',
                     "'spec.env.fixExpense' is not a number");
        assert.equal(typeof spec.env.expensePerDollar, 'number',
                     "'spec.env.expensePerDollar' is not a number");

        assert.equal(typeof spec.env.payPalFile, 'string',
                     "'spec.env.payPalFile' is not a string");
        const payPalConfig = loadConfig(spec.env.payPalFile);

        assert.equal(typeof payPalConfig.clientId, 'string',
                     "'payPalConfig.clientId' is not a string");

        assert.equal(typeof payPalConfig.clientSecret, 'string',
                     "'payPalConfig.clientSecret' is not a string");

        assert.equal(typeof payPalConfig.isSandbox, 'boolean',
                     "'payPalConfig.isSandbox' is not a boolean");

        const payPalClient = paypalUtils.createClient(
            payPalConfig.clientId,
            payPalConfig.clientSecret,
            payPalConfig.isSandbox
        );

        that.getPrice = (units) => {
            return paypalUtils.price(units, spec.env.fixExpense,
                                     spec.env.expensePerDollar);
        };

        that.getClientId = () => payPalConfig.clientId;

        that.createOrder = async (user, units, value) => {
            const request = paypalUtils.makeRequest(user, units, value);
            const order = await payPalClient.execute(request);

            $._.$.log && $._.$.log.debug('createOrder: ' +
                                         JSON.stringify(order.result));

            return order.result;
        };

        that.captureOrder = async (id) => {
            const result = await paypalUtils.getOrder(payPalClient, id);
            switch (result.status) {
            case 'COMPLETED': {
                // make idempotent...
                const [, user, units, value] =
                      paypalUtils.extractInfo(result);
                return {id, user, units, value};
            }
            case 'APPROVED': {
                const [purchase, user, units, value] =
                      paypalUtils.extractInfo(result);
                const capture = await paypalUtils.captureOrder(
                    payPalClient, id
                );
                if (capture.status === 'COMPLETED') {
                    const capturePurchase = capture.purchase_units[0];
                    assert(purchase.reference_id ===
                           capturePurchase.reference_id);

                    const tid = capturePurchase.payments.captures[0].id;

                    $._.$.log && $._.$.log.debug('captureOrder: ' +
                                                 JSON.stringify(capture));

                    return {id, tid, user, units, value};
                } else {
                    throw new Error(`Cannot capture  ${id}`);
                }
            }
            default:
                throw new Error(`Transaction ${id} not approved`);
            }
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
