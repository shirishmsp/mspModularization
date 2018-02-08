/* ************ 0. Other Module Imports ************ */

import { $doc, PLUGINS } from './basic.js';
import Cookie from './cookie.js';
import Browser from './browser.js';

/* ************** 1. Classes/Objects/Variables: ************** */

/* ************** 2. Exports: ************** */

export { 
    install,
    isInstalled
}

/* ************** 3. Actions/Events: ************** */

/* ************** 4. Functions: ************** */

function install(pluginIdentifier, successCB, failureCB, alternate) {
    if(isInstalled(pluginIdentifier)) { /* Install only if NOT already installed */
        if(/chrome/i.test(Browser.name)) {
            tryInstallChrome(successCB, failureCB, pluginIdentifier);
        } else {
            tryInstallFirefox();
        }
    }
}

function tryInstallChrome(successCB, failureCB, pluginIdentifier) {
    let installURL = `https://chrome.google.com/webstore/detail/${PLUGINS[pluginIdentifier]}`;

    if (window.chrome && chrome.webstore) {
        /* Append <link> tag only when chrome_ext_install_url tag is not available. */
        if (!$("link[rel='chrome-webstore-item'][href='" + installURL + "']").length) {
            $("head").append("<link rel='chrome-webstore-item' href='" + installURL + "'/>");
        }
        /* Call the chrome install API: */
        chrome.webstore.install(installURL, function() {
            success(successCB);
        }, function() {
            failure(failureCB);
        });
    } else {
        failure(failureCB);
    }

    /* **** INNER FUNCTIONS: **** */
    function success(callback) {
        if (typeof callback === "function")
            callback();
    }
    function failure(callback) {
        if (typeof callback === "function")
            callback();
    }
}

function tryInstallFirefox() {
    const params = {
        "MySmartPrice": {
            URL: "https://s3-ap-southeast-1.amazonaws.com/firefox-addon/mysmartprice-latest-fx.xpi",
            IconURL: "https://s3-ap-southeast-1.amazonaws.com/firefox-addon/logo-icon.png",
            toString: function() {
                return this.URL;
            }
        }
    };
    InstallTrigger.install(params);
}

function isInstalled(pluginIdentifier) {
    return !!Cookie.get(pluginIdentifier);
}