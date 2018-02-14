if (url.getAQueryParam && url.getAQueryParam('utm_source')) {
    setCookie("utm_source", url.getAQueryParam('utm_source'), 1);
}

(function prefillEmailInputs() {
    var $emailInputs = $("input[name='email']"),
        userEmail = Modules.Cookie.get("msp_login_email");
    if ($emailInputs.length && userEmail) {
        $emailInputs.val(userEmail);
    }
}());

// Extension Rating Parameter (From mailer) handler:
(function() {
    var rating;
    if (url.getAQueryParam('extensionrating')) {
        rating = url.getAQueryParam('extensionrating').toString();
        window.ga && ga('send', 'event', 'Extension', 'extension-nps-click', rating, { nonInteraction: true });
        openPopup('/promotions/popups/extension_rating_popup.html');
    }
})();

// Mobile number capture popup for users who land on single page
// from price alert emailer and missed the drop in price
if (url.getAQueryParam && url.getAQueryParam('utm_campaign') === "PriceAlert") {
    var _hash = url.hashParams;
    if (_hash.price) {
        var $mspSingleTitle = $("#mspSingleTitle");
        if ($mspSingleTitle.length) {
            var emailPrice = parseInt(_hash.price, 10),
                bestPrice = parseInt($mspSingleTitle.data("bestprice"), 10);
            if (bestPrice > emailPrice) {
                openPopup("/price_alert/paepopup.php?mspid=" + $mspSingleTitle.data("mspid"));
            }
        }
    }
}

setTimeout(function(){
    if($(".bottom-slideup").is(":visible")){
        $(".qna-bbl").css("bottom",$(".bottom-slideup").height+"px");   
    }
}, 3000);