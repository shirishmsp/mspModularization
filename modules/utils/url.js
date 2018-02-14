/* ************ 0. Other Module Imports ************ */

import { $doc } from './basic.js';
import * as Cookie from './cookie.js';
import * as Helpers from './helpers.js';

/* ************** 1. Classes/Objects/Variables: ************** */

class Url {
    constructor(url) {
        this.url = url || window.location;
        this.querySupport = (() => {
            const url = this.url;
            return {
                _getParams() {
                    var params = [];
                    if (url.search) {
                        var queryArr = url.search.substring(1).split("&");
                        for (var i = 0, len = queryArr.length; i < len; i++) {
                            var pair = queryArr[i].split("="),
                                key = pair[0],
                                value = pair[1] ? decodeURIComponent(pair[1]) : undefined;
                            if (key) {
                                params.push([key, value]);
                            }
                        }
                    }
                    return params;
                },
                _setQuery(params) {
                    var fragments = [];
                    for (var i = 0, len = params.length; i < len; i++) {
                        fragments.push(params[i].join("="));
                    }
                    window.location.search = "?" + fragments.join("&");
                }
            }
        })();
        this.hashSupport = (() => {
            const url = this.url;
            return {
                delimiter: "&",
                _getParams() {
                    var params = [];
                    if (url.hash) {
                        var hashArr = url.hash.substring(1).split(this.delimiter);
                        for (var i = 0, len = hashArr.length; i < len; i++) {
                            var pair = hashArr[i].split("="),
                                key = pair[0],
                                value = pair[1] ? decodeURIComponent(pair[1]) : undefined;
                            if (key) {
                                params.push([key, value]);
                            }
                        }
                    }
                    return params;
                },
                _setHash(params) {
                    var fragments = [];
                    for (var i = 0, len = params.length; i < len; i++) {
                        fragments.push(params[i].join("="));
                    }
                    window.location.hash = "#" + fragments.join(this.delimiter);
                }
            }
        })();
    }
    get fullUrl() {
        return this.url.href;
    }
    get origin() {
        return this.url.origin;
    }
    get protocol() {
        return this.url.protocol;
    }
    get host() {
        return this.url.hostname;
    }
    get domain() { // Returns the top two levels of the domain name
        var domain = this.url.hostname,
            tldIndex = domain.lastIndexOf(".");
        if (tldIndex !== -1) {
            var domainIndex = domain.lastIndexOf(".", tldIndex - 1);
            if (domainIndex !== -1) {
                return domain.substring(domainIndex + 1);
            }
        }
        return domain;
    }
    get port() {
        return this.url.port;
    }
    get path() {
        return this.url.pathname;
    }
    get query() {
        return this.url.search;
    }
    get queryParams() {
        var queryObj = {};
        if (this.url.search) {
            var params = this.querySupport._getParams();
            for (var i = 0, len = params.length; i < len; i++) {
                var key = params[i][0],
                    value = params[i][1];
                if (typeof queryObj[key] === "undefined") {
                    queryObj[key] = value;
                }
                else if (typeof queryObj[key] === "string") {
                    queryObj[key] = [queryObj[key], value];
                }
                else {
                    queryObj[key].push(value);
                }
            }
        }
        return queryObj;
    }
    set queryParams(data) {
        var params = this.querySupport._getParams(),
            match = false;
        if (typeof data === "object") {
            var props = data;
            for (var prop in props) {
                if (props.hasOwnProperty(prop)) {
                    match = false;
                    for (var i = 0, len = params.length; i < len; i++) {
                        if (params[i][0] === prop) {
                            params[i][1] = props[prop];
                            match = true;
                        }
                    }
                    if (!match) {
                        params.push([prop, props[prop]]);
                    }
                }
            }
            this.querySupport._setQuery(params);
        }
    }
    getAQueryParam(key) {
        var queryVal,
            params = this.querySupport._getParams();
        if(key && this.url.search) {
            for (var i = 0, len = params.length; i < len; i++) {
                if (params[i][0] === key) {
                    var value = params[i][1];
                    if (typeof queryVal === "undefined") {
                        queryVal = value;
                    }
                    else if (typeof queryVal === "string") {
                        queryVal = [queryVal, value];
                    }
                    else {
                        queryVal.push(value);
                    }
                }
            }
            return queryVal;
        }
    }
    setAQueryParam(key, value) {
        var params = this.querySupport._getParams(),
        match = false;
        if(key && this.url.search) {
            for (var i = 0, len = params.length; i < len; i++) {
                if (params[i][0] === key) {
                    params[i][1] = value;
                    match = true;
                }
            }
            if (!match) {
                params.push([key, value]);
            }
            this.querySupport._setQuery(params);
        }   
    }
    deleteAQueryParam(key) {
        var params = this.querySupport._getParams(),
            match = false;
        if(key && this.url.search) {
            for (var i = 0; i < params.length; i++) {
                if (params[i][0] === key) {
                    params.splice(i--, 1);
                    match = true;
                }
            }
            if (match) {
                this.querySupport._setQuery(params);
            }
        }
    }
    get hash() {
        return this.url.hash;
    }
    get hashParams() {
        var hashObj = {};
        if (this.url.hash) {
            var params = this.hashSupport._getParams();
            for (var i = 0, len = params.length; i < len; i++) {
                var key = params[i][0],
                    value = params[i][1];
                if (typeof hashObj[key] === "undefined") {
                    hashObj[key] = value;
                }
                else if (typeof hashObj[key] === "string") {
                    hashObj[key] = [hashObj[key], value];
                }
                else {
                    hashObj[key].push(value);
                }
            }
        }
        return hashObj;
    }
    set hashParams(data) {
        var params = this.hashSupport._getParams(),
            match = false;
        if (typeof data === "object") {
            var props = data;
            for (var prop in props) {
                if (props.hasOwnProperty(prop)) {
                    match = false;
                    for (var i = 0, len = params.length; i < len; i++) {
                        if (params[i][0] === prop) {
                            params[i][1] = props[prop];
                            match = true;
                        }
                    }
                    if (!match) {
                        params.push([prop, props[prop]]);
                    }
                }
            }
            this.hashSupport._setHash(params);
        }
    }
    getAHashParam(key) {
        var hashVal,
            params = this.hashSupport._getParams();
        if (key && this.url.hash) {
            for (var i = 0, len = params.length; i < len; i++) {
                if (params[i][0] === key) {
                    var value = params[i][1];
                    if (typeof hashVal === "undefined") {
                        hashVal = value;
                    }
                    else if (typeof hashVal === "string") {
                        hashVal = [hashVal, value];
                    }
                    else {
                        hashVal.push(value);
                    }
                }
            }
            return hashVal;
        }
    }
    setAHashParam(key, value) {
        var params = this.hashSupport._getParams(),
            match = false;
        if (key && this.url.hash) {
            for (var i = 0, len = params.length; i < len; i++) {
                if (params[i][0] === key) {
                    params[i][1] = value;
                    match = true;
                }
            }
            if (!match) {
                params.push([key, value]);
            }
            this.hashSupport._setHash(params);
        }
    }
    deleteAHashParam(key) {
        var params = this.hashSupport._getParams(),
            match = false;
        if (key && this.url.hash) {
            for (var i = 0; i < params.length; i++) {
                if (params[i][0] === key) {
                    params.splice(i--, 1);
                    match = true;
                }
            }
            if (match) {
                this.hashSupport._setHash(params);
            }
        }
    }
}

/* ************** 2. Actions/Events: ************** */

/* ************** 3. Exports: ************** */

export {
    Url as default
}

/* ************** 4. Functions: ************** */