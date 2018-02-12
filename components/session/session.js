init(); // Save #pages visited, session start time, and active time.
countPages(); // Initially count the number of pages visited by user

function init() {
    if (!Modules.Cookie.get("visit_num_pages")) {
        Modules.Cookie.set("visit_num_pages", 1);
    } else {
        Modules.Cookie.set("visit_num_pages", (parseInt(Modules.Cookie.get("visit_num_pages")) + 1));
    }

    if (!Modules.Cookie.get("session-start-time")) {
        Modules.Cookie.set("session-start-time", new Date().getTime());
    }
    Modules.Cookie.set("active_time", ((new Date().getTime()) - Modules.Cookie.get("session-start-time")) / 1000);
}

/* Count no. of pages visited by user: */
function countPages() {
    var number = Modules.Cookie.get("num_pages");
    if (!number) number = 1;
    else number = parseInt(number, 10) + 1;
    Modules.Cookie.set("num_pages", number, "7d");
}

function validUID() {
    var UID = Modules.Cookie.get("msp_uid");
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