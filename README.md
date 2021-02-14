# Caf.js

Co-design permanent, active, stateful, reliable cloud proxies with your web app and gadgets.

See https://www.cafjs.com

## Library for managing payment transactions

[![Build Status](https://travis-ci.org/cafjs/caf_paypal.svg?branch=master)](https://travis-ci.org/cafjs/caf_paypal)

This repository contains a `Caf.js` library to manage payment transactions.

## Dependencies Warning

To eliminate expensive dependencies for apps in the workspace that do not need `caf_paypal`, the package `@paypal/checkout-server-sdk@^1.0.2` has been declared as an optional dependency even though it is always needed.

Applications that depend on `caf_paypal` should also include `@paypal/checkout-server-sdk@^1.0.2` in package.json as a normal dependence.

## API

See {@link module:caf_paypal/proxy_paypal}

## Configuration

### framework.json

See {@link module:caf_paypal/plug_paypal}

### ca.json

See {@link module:caf_paypal/plug_ca_paypal}
