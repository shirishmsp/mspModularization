(function headerSPEvent() {

    Modules.$doc.on('click', '.js-lylty-hdr', function() {
        var partialLogin = Modules.Cookie.get("partial_login");

        var gaEvent = partialLogin ? "Partial-Login-Click" : "Loyalty-Header-Click";

        window.ga && ga("send", "event", "Loyalty", gaEvent, Modules.Cookie.get("msp_uid") || "");

    })
})();