/* ************ 0. Other Module Imports ************ */

import { $doc } from './basic.js';

/* ************** 1. Classes/Objects/Variables: ************** */

const patterns = {
    'text': /^[a-z\d\-_\s]+$/i,
    'number': /^\d+$/,
    'ifsc': /^[A-Za-z]{4}\d{7}$/,
    'mobile': /^\d{10}$/,
    'pincode': /^\d{6}$/,
    'email': /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    'required': /\S/
}

const validator = {
    rating(value) {
        return !!parseInt(value, 10);
    },
    text(value, options) {
        var isWithinLimits = (function() {
            var result = true,
                minLength = options && options.min && parseInt(options.min, 10),
                maxLength = options && options.max && parseInt(options.max, 10);

            if (minLength && value.length < options.min) {
                result = false;
            }
            if (maxLength && value.length > minLength) {
                result = false;
            }
            return result;
        }());
        return testPattern("text", $.trim(value)) && value && isWithinLimits;
    },
    ifsc(value, options) {
        return testPattern("ifsc", value)
    },
    number(value, options) {
        return testPattern("number", value);
    },
    mobile(value, options) {
        return testPattern("mobile", value);
    },
    pincode(value, options) {
        return testPattern("pincode", value);
    },
    email(value, options) {
        return testPattern("email", value);
    },
    required(value, options) {
        var isWithinLimits = (function() {
            var result = true,
                minLength = options && options.min && parseInt(options.min, 10),
                maxLength = options && options.max && parseInt(options.max, 10);

            if (minLength && value.length < options.min) {
                result = false;
            }
            if (maxLength && value.length > minLength) {
                result = false;
            }
            return result;
        }());
        return testPattern("required", $.trim(value)) && value && isWithinLimits;
    }
    /* TODO: Add a full form validator: Takes form as input, tells which input is wrong, returns error msg */
}

/* ************** 2. Actions/Events: ************** */

/* ************** 3. Exports: ************** */

export { validator as default }

/* ************** 4. Functions: ************** */

function testPattern(type, value) {
    return patterns[type].test(value);
}