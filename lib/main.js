'use strict';
/**
 * Main package module.
 *
 * @module caf_paypal/main
 *
 */
/* eslint-disable max-len */

/**
 * @external caf_components/gen_plug_ca
 * @see {@link https://cafjs.github.io/api/caf_components/module-caf_components_gen_plug_ca.html}
 */

/**
 * @external caf_components/gen_plug
 * @see {@link https://cafjs.github.io/api/caf_components/module-caf_components_gen_plug.html}
 */


/**
 * @external caf_components/gen_proxy
 * @see {@link https://cafjs.github.io/api/caf_components/module-caf_components_gen_proxy.html}
 */


/* eslint-enable max-len */

exports.plug = require('./plug_paypal.js');
exports.plug_ca = require('./plug_ca_paypal.js');
exports.proxy = require('./proxy_paypal.js');
