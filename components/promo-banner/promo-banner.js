if (location.pathname === "/") {
    Modules.$doc.on("click", ".mCycleItemWrapper:first-child", function() {
        window.ga && ga("send", "event", "HomePage", "promo-bnr-click", "first-bnr");
    });
}
