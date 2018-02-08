/* ************ 0. Other Module Imports ************ */

/* ************** 1. Classes/Objects/Variables: ************** */

/* ************** 2. Actions/Events: ************** */

/* ************** 3. Exports: ************** */

export {
    isPushSupported,
    serviceWorkerReady,
    registerServiceWorker
}

/* ************** 4. Functions: ************** */

function isPushSupported() {
    if(!('showNotification' in ServiceWorkerRegistration.prototype)) {
        return false;
    }
    if(Notification.permission === 'denied') {
        return false;
    }
    if(!('PushManager' in window)) {
        return false;
    }
    return true;
}

function serviceWorkerReady() {
    return new Promise(function(resolve, reject) {
        navigator.serviceWorker.ready
        .then(a => {
            a.pushManager.subscribe({
                userVisibleOnly: !0 
            }).then(a => {
                resolve(a);
            }).catch(() => {
                if(Notification.permission === 'denied') {
                    reject();
                }
            });
        });
    });
}

function registerServiceWorker(workerScript) {
    navigator.serviceWorker.register(workerScript) // Generally: workerScript = "https://www.mysmartprice.com/sw.js"
    .then(() => {
        if(isPushSupportedMain()) {
            serviceWorkerReady();
        }
    });
}

/* TODO: Test subscription on an HTTPS server */