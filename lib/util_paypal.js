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
const paypal = require('@paypal/checkout-server-sdk');
const caf_comp = require('caf_components');
const myUtils = caf_comp.myUtils;
const assert = require('assert');

const DOLLARS_PER_UNIT = exports.DOLLARS_PER_UNIT = 0.1;

exports.price = (units, fixExpense, expensePerDollar) => {
    const truncateToCents = (x) => Math.round(x*100)/100;
    const expenses = (x) => fixExpense + expensePerDollar * x;
    const dollars = units * DOLLARS_PER_UNIT;
    /* Force that the delta pays for all the expenses, i.e.:
     *
     *  (dollars+t1)*expensePerDollar + fixExpense = t1
     */
    const t1 = expenses(dollars)/(1 - expensePerDollar);
    return truncateToCents(dollars + t1);
};

exports.getOrder = async (payPalClient, id) => {
    const request = new paypal.orders.OrdersGetRequest(id);
    const order = await payPalClient.execute(request);
    if (!order || (order.statusCode !== 200) || !order.result) {
        throw new Error(`getOrder: Missing transaction ${id}`);
    } else {
        return order.result;
    }
};

exports.captureOrder = async (payPalClient, id) => {
    const request = new paypal.orders.OrdersCaptureRequest(id);
    request.requestBody({});
    const capture = await payPalClient.execute(request);
    if (!capture || (capture.statusCode !== 201) || !capture.result) {
        throw new Error(`captureOrder: Missing transaction ${id}`);
    } else {
        return capture.result;
    }
};

exports.createClient = (clientId, clientSecret, isSandbox) => {
    const payPalEnv = isSandbox ?
        new paypal.core.SandboxEnvironment(clientId, clientSecret) :
        new paypal.core.LiveEnvironment(clientId, clientSecret);

    return new paypal.core.PayPalHttpClient(payPalEnv);
};

exports.makeRequest = (user, units, value) => {
    const valueCents = Math.floor(value*100);
    const costUnitsTotalCents = Math.floor(units*DOLLARS_PER_UNIT*100);
    const transactionCostsCents = valueCents - costUnitsTotalCents;
    assert(transactionCostsCents >= 0);

    value = valueCents/100;
    const costUnitsTotal = costUnitsTotalCents/100;
    const transactionCosts = transactionCostsCents/100;

    const request = new paypal.orders.OrdersCreateRequest();

    request.prefer('return=representation');

    request.requestBody({
        intent: 'CAPTURE',
        application_context: {
            shipping_preference: 'NO_SHIPPING'
        },
        purchase_units: [{
            reference_id: `${user}_` + myUtils.uniqueId(),
            amount: {
                currency_code: 'USD',
                value: value.toFixed(2),
                breakdown: {
                    item_total: {
                        currency_code: 'USD',
                        value: costUnitsTotal.toFixed(2)
                    },
                    handling: {
                        currency_code: 'USD',
                        value: transactionCosts.toFixed(2)
                    }
                }
            },
            items: [
                {
                    name: 'Units',
                    quantity: units.toString(),
                    category: 'DIGITAL_GOODS',
                    unit_amount: {
                        currency_code: 'USD',
                        value: DOLLARS_PER_UNIT.toFixed(2)
                    }
                }
            ]
        }]
    });

    return request;
};

exports.extractInfo = (result) => {
    const purchase = result.purchase_units[0];
    const user = purchase.reference_id.split('_')[0];
    const units = parseFloat(purchase.items[0].quantity);
    const value = parseFloat(purchase.amount.value);
    assert(units*DOLLARS_PER_UNIT < value);
    return [purchase, user, units, value];
};
