(function headerSPEvent() {

    Modules.$doc.on('click', '.js-lylty-hdr', function() {
        var partialLogin = getCookie("partial_login");

        var gaEvent = partialLogin ? "Partial-Login-Click" : "Loyalty-Header-Click";

        window.ga && ga("send", "event", "Loyalty", gaEvent, getCookie("msp_uid") || "");

    })
})();