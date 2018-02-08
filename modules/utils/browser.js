/* ************ 0. Other Module Imports ************ */

import { $doc, $win } from './basic.js';
import Cookie from './cookie.js';

/* ************** 1. Classes/Objects/Variables: ************** */

const browser = browserInfo();

function LocalStore(key, namespace = '') {
    const localStorage = window.localStorage; // No fallback (good support up to IE8)
    return {
        get() {
            var value = localStorage.getItem(`${namespace}${key}`);
            try {
                return value ? JSON.parse(value) : null;
            } catch(e) {
                return value;
            }
        },
        set(value) {
            if(value === undefined || value === null) {
                this.remove()
            } else {
                try {
                    value = JSON.stringify(value);
                } catch(e) {}
                localStorage.setItem(`${namespace}${key}`, value);
            }
        },
        remove() {
            localStorage.removeItem(`${namespace}${key}`)
        }
    }; 
}
LocalStore.set = function(key, value, namespace = '') {
    let item = LocalStore(key, namespace);
    item.set(value);
    return item;
};

function SessionStore(key, namespace = '') {
    const sessionStorage = window.sessionStorage; // No fallback (good support up to IE8)
    return {
        get() {
            var value = sessionStorage.getItem(`${namespace}${key}`);
            try {
                return value ? JSON.parse(value) : null;
            } catch(e) {
                return value;
            }
        },
        set(value) {
            if(value === undefined || value === null) {
                this.remove()
            } else {
                try {
                    value = JSON.stringify(value);
                } catch(e) {}
                sessionStorage.setItem(`${namespace}${key}`, value);
            }
        },
        remove() {
            sessionStorage.removeItem(`${namespace}${key}`)
        }
    };
}
SessionStore.set = function(key, value, namespace = '') {
    let item = SessionStore(key, namespace);
    item.set(value);
    return item;
};

/* ************** 2. Actions/Events: ************** */

/* ************** 3. Exports: ************** */

export {
    browser as default,
    LocalStore,
    SessionStore
};

/* ************** 4. Functions: ************** */

function browserInfo() { // Name changed from `get_browser_main`.
    var ua = navigator.userAgent,
        tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
        return { name: 'IE', version: (tem[1] || '') };
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR\/(\d+)/)
        if (tem != null) { return { name: 'Opera', version: tem[1] }; }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
    return {
        name: M[0],
        version: M[1]
    };
}
