init(); // Save #pages visited, session start time, and active time.
countPages(); // Initially count the number of pages visited by user

function init() {
    if (!Cookie.getCookie("visit_num_pages")) {
        Cookie.setCookie("visit_num_pages", 1);
    } else {
        Cookie.setCookie("visit_num_pages", (parseInt(Cookie.getCookie("visit_num_pages")) + 1));
    }

    if (!Cookie.getCookie("session-start-time")) {
        Cookie.setCookie("session-start-time", new Date().getTime());
    }
    Cookie.setCookie("active_time", ((new Date().getTime()) - Cookie.getCookie("session-start-time")) / 1000);
}

/* Count no. of pages visited by user: */
function countPages() {
    var number = Cookie.getCookie("num_pages");
    if (!number) number = 1;
    else number = parseInt(number, 10) + 1;
    Cookie.setCookie("num_pages", number, 7);
}

function validUID() {
    var UID = Cookie.getCookie("msp_uid");
    var URL = "/api/transacting_uid_popup.php";

    var dfd = $.Deferred();
    $.ajax({
        "url": URL,
        "type": "GET",
        "data": {
            uid: UID
        }
    }).done(function(response) {
        dfd.resolve(response);
    });
    return dfd.promise();
}