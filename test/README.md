Tests need a client Id and secret for the PayPal Sandbox. A paypal developer account is needed to obtain them, see https://developer.paypal.com for details.


Then, create a file called paypal.json in test/hello that replaces the current (dangling) symbolic link.

The format of this file is:


{
    "clientId": "AXl3k5iN_th2mj4qLZRHp....",
    "clientSecret": "EMZoDtlTPm4..."
}

When the login window appears use another sandbox account to simulate a client. Even though it redirects back again after confirming, it does approve the transaction correctly. Just wait a few seconds and the test resumes...
