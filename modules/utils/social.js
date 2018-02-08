/* ************ 0. Other Module Imports ************ */

/* ************** 1. Classes/Objects/Variables: ************** */

/* ************** 2. Actions/Events: ************** *

/* ************** 3. Exports: ************** */

export { 
    facebookShare,
    twitterShare,
    emailShare,
    linkShare
}

/* TODO: Enrich the utility by adding more functionality (using the provided SDKs) */

/* ************** 4. Functions: ************** */

function facebookShare() {
    var url = encodeURIComponent(window.location.href);
    window.open("http://www.facebook.com/sharer/sharer.php?u=" + url + "&client_id=253242341485828", "_blank", "width=550,height=300");
}

function twitterShare(text) {
    var url = encodeURIComponent(window.location.href);
    window.open("https://twitter.com/share?url=" + url + "&via=mysmartprice&text=" + text, "_blank", "width=556,height=443");
}

function emailShare(subject, body) {
    window.open("https://mail.google.com/mail/?view=cm&fs=1&su=" + subject + "&body=" + body, "_blank", "width=650,height=500");
}

/* TODO: Test linkShare function */
function linkShare() {
    var tempInput = document.createElement("input");
    tempInput.style = "position: absolute; left: -1000px; top: -1000px";
    tempInput.value = window.location.href;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}