;
(function updateHighlighters() {
    if (localStorage.highlighterData) {
        var highlighterData = JSON.parse(localStorage.highlighterData);
        var currentDate = new Date();

        for (var prop in highlighterData) {
            var expiringDate = new Date(highlighterData[prop].lastUsed);

            expiringDate.setDate(expiringDate.getDate() + parseInt(14));

            if (expiringDate <= currentDate) {
                highlighterData[prop].count = 0;
            }

            if (highlighterData[prop].count >= 2) {
                $(".js-hghlghtr-link[data-highlight-id=" + prop + "]").find(".hghlghtr-link").removeClass("hghlghtr-link");
            }

        }
        localStorage.highlighterData = JSON.stringify(highlighterData);
    }
})();

Modules.$doc.on("click", ".js-hghlghtr-link", function() {
    var highlighterID = $(this).data("highlight-id"),
        highlighterData = localStorage.highlighterData ? JSON.parse(localStorage.highlighterData) : {};
    highlighterData[highlighterID] = highlighterData[highlighterID] ? highlighterData[highlighterID] : {};
    highlighterData[highlighterID]['lastUsed'] = new Date();
    highlighterData[highlighterID]['count'] = highlighterData[highlighterID]['count'] ? parseInt(highlighterData[highlighterID]['count']) + 1 : 1;

    if (parseInt(highlighterData[highlighterID]['count']) >= 2) {
        $(this).find(".hghlghtr-link").removeClass("hghlghtr-link");
    }
    localStorage.highlighterData = JSON.stringify(highlighterData);
});
