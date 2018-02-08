/* ************ 0. Other Module Imports ************ */

import { $doc } from './basic.js';

/* ************** 1. Classes/Objects/Variables: ************** */

/* TODO: Extract domain using URL.js (querystring) */
const cookieDomainName = ".mysmartprice.com"; // var cookieDomainName = ".mspsg.in";

var Cookie = {
    set(name, value, duration, path, domain = cookieDomainName) {
        let expiryDate, durationUnit, durationValue;
        if (duration) {
            // ie7 support for trim
            duration = duration.toString().replace(/^\s+|\s+$/g, "");
            durationValue = parseFloat(duration);
            durationUnit = /day|d$/i.test(duration) ? (24 * 60 * 60 * 1000) : undefined;
            durationUnit = durationUnit || (/hour|hr$|hrs$|h$/i.test(duration) ? (60 * 60 * 1000) : undefined);
            durationUnit = durationUnit || (/min|mins$|m$/i.test(duration) ? (60 * 1000) : undefined);
            durationUnit = durationUnit || (/sec|s$/i.test(duration) ? (1000) : undefined);
            durationUnit = durationUnit || (60 * 1000); // Defaulting to a minute.

            expiryDate = new Date(new Date().getTime() + durationValue * durationUnit).toUTCString();
        }

        if (durationValue < 0) domain = "";
        else domain = " ;domain=" + domain;

        path = " ; path=" + (path || "/");
        value = escape(value);
        expiryDate = (!expiryDate) ? "" : "; expires=" + expiryDate;

        document.cookie = name + "=" + value + expiryDate + domain + path + ";";
    },
    get(name) {
        var cookieArr = document.cookie.split(';'),
            i, cookie;
        // ie7 support for loop
        for (i = 0; i < cookieArr.length; i++) {
            cookie = cookieArr[i].split("=");
            // ie7 support for trim
            cookie[0] = cookie[0].replace(/^\s+|\s+$/g, "");
            cookie[1] = unescape(cookie[1]);
            if (cookie[0] == name) {
                return cookie[1];
            }
        }
    },
    delete(name) {
        Cookie.set(name,"","-100d");
    }
}

/* ************** 2. Actions/Events: ************** */

/* ************** 3. Exports: ************** */

export default Cookie;

/* ************** 4. Functions: ************** */