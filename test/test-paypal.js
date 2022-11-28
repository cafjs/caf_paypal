'use strict';

const util = require('util');
const delay = util.promisify(setTimeout);

const hello = require('./hello/main.js');
const { exec } = require('child_process');

const app = hello;

const caf_core= require('caf_core');
const caf_comp = caf_core.caf_components;
const myUtils = caf_comp.myUtils;
const async = caf_comp.async;
const cli = caf_core.caf_cli;

const crypto = require('crypto');

const APP_FULL_NAME = 'root-paypal';

const CA_OWNER_1='me'+ crypto.randomBytes(8).toString('hex');
const CA_LOCAL_NAME_1='ca1';
const FROM_1 =  CA_OWNER_1 + '-' + CA_LOCAL_NAME_1;
const FQN_1 = APP_FULL_NAME + '#' + FROM_1;

process.on('uncaughtException', function (err) {
               console.log("Uncaught Exception: " + err);
               console.log(myUtils.errToPrettyStr(err));
               process.exit(1);

});

const findApproveLink = (p) => {
    let res = null;
    p.links.forEach((x) => {
        if (x.rel === 'approve') {
            res = x.href;
        }
    });
    return res;
};

module.exports = {
    setUp(cb) {
       var self = this;
        app.init( {name: 'top'}, 'framework.json', null,
                      function(err, $) {
                          if (err) {
                              console.log('setUP Error' + err);
                              console.log('setUP Error $' + $);
                              // ignore errors here, check in method
                              cb(null);
                          } else {
                              self.$ = $;
                              cb(err, $);
                          }
                      });
    },
    tearDown(cb) {
        var self = this;
        if (!this.$) {
            cb(null);
        } else {
            this.$.top.__ca_graceful_shutdown__(null, cb);
        }
    },

    async dirtyEval(test) {
        var self = this;
        var s1;
        var from1 = FROM_1;
        test.expect(4);
        var lastId;
        try {
            s1 = new cli.Session('ws://root-paypal.localtest.me:3000',
                                 from1, {
                                     from : from1
                                 });
            let p = await new Promise((resolve, reject) => {
                s1.onopen = async function() {
                    try {
                        const res = await s1.createOrder(10)
                              .getPromise();
                        test.ok(typeof res.id === 'string');
                        resolve(res);
                    } catch (err) {
                        test.ok(false, 'Got exception ' + err);
                        reject(err);
                    }
                };
                return [];
            });


            console.log(p);
            const url = findApproveLink(p);
            exec('google-chrome ' + url,
                 async (error, stdout, stderr) => {
                     await delay(30000);
                     try {
                         const res = await s1.captureOrder(p.id)
                               .getPromise();
                         console.log(res);
                         test.ok(res.id === p.id);
                     } catch (err) {
                         test.ok(false, 'Got exception ' +
                                 myUtils.errToPrettyStr(err));
                     }

                     // check idempotent
                      const res2 = await s1.captureOrder(p.id)
                               .getPromise();
                     console.log(res2);
                     test.ok(res2.id === p.id);

                     s1.onclose = function(err) {
                         test.ifError(err);
                         test.done();
                     };
                     s1.close();
                 });
        } catch (err) {
            test.ifError(err);
            test.done();
        }
    }
};
