/* ************** 1. Classes/Objects/Variables: ************** */

const popupDataObj = {};
const popupCallbackQueue = [];
const autoPopupTimeout = 10000;
const pageLeaveTimeout = 4000;

/* ************** 2. Actions/Events: ************** */

Modules.$doc.on('click', '.popup-target, .js-popup-trgt', handlePopupTargetClick);
Modules.$doc.on('click', ".chrmcshbck-popup-target, .js-chrmcshbck-popup-trgt", chromePluginPopupTarget); // pln CB offer  

// This function is to be refactored when single page goes live:
Modules.$doc.on('click', ".loyalty-popup-target, .js-lylty-popup-trgt", loyaltyPopupTarget);

/* Old: */
Modules.$doc.on('click', '.popup-closebutton', () => closePopup());
Modules.$doc.on('click', '.popup-overlay', handlePopupOverlayClick);

/* New: */
Modules.$doc.on('click', '.pop-up__cls-btn, .popup-optn__link.usr-inputbox__input--lnk', () => closePopup_RUI());
Modules.$doc.on('click', '.pop-up__ovrly', handlePopupOverlayClickRUI);

/* autopopup processing start: */
setTimeout(() => {
    openAutoPopup(); // open auto popup after autoPopupTimeout
}, autoPopupTimeout);

setTimeout(() => {
    pageLeavePopupBind(); // bind page leave auto popup after pageLeaveTimeout
}, pageLeaveTimeout);
/* autopopup processing end */

getAutopopupURL($(".auto-popup-data"));

// Exit intent popup selection (search for plugin_id and not instatab):
if (location.href.indexOf("/deals/promotions") === -1 && !Modules.Cookie.get('plugin_id')) {
    openPageLeaveGTSPopup();
}

setPopUpCookie();

/* ************** 4. Functions: ************** */

function closePopup() {
    $('.popup-overlay').addClass('not-vsbl');
    $('.popup-container').addClass('not-vsbl');
    $('.popup-closebutton').addClass('not-vsbl');
    setTimeout(function() {
        $('.popup-overlay').remove();
        $('.popup-container').remove();
        $('.popup-closebutton').remove();
    }, 400);
    while (popupQueue.length > 0) {
        (popupQueue.shift())();
    }
}

function closePopup_RUI() {
    $('.pop-up__ovrly').addClass('not-opq');
    $('.pop-up__cntnr').addClass('not-opq');
    setTimeout(function() {
        $('.pop-up__ovrly').remove();
        $('.pop-up__cntnr').remove();
    }, 300);
    while (popupQueue.length > 0) {
        (popupQueue.shift())();
    }
}

function popupQueueFn(fn, context, params) {
    return function() {
        fn.apply(context, params);
    };
}

/* OLD::autopopup function */
function openAutoPopup(pageLeave) {
    if (!$(".popup-overlay").length) {
        var $popupData = $("[data-autopopup]");
        if ($popupData.length) {
            var popupUrl = $popupData.data("autopopup");
            if (popupUrl) {
                if ($popupData.data("autopopup-login") && (Modules.Cookie.get("msp_login_email") || Modules.Cookie.get("msp_login")))
                    return;

                //To be moved to attribute based categorization
                openPopup(popupUrl + (pageLeave ? ((popupUrl.indexOf("?") > -1 ? "&" : "?") + "pl=1") : ""), "PromoA");
            }
        }
    }
}

function handlePopupTargetClick() {

    if ($(this).parent(".exprt-rvw__glry-thmbnl").length != 0)
        return false;

    var $this = $(this),
        popupUrl = $this.attr('href'),
        storeUrl,
        popupType = $this.data('promo');

    popupDataObj = {
        type: $this.data('popup-type')
    }

    if ($this.hasClass("js-wdgt-gts")) {
        window.ga && ga("send", "event", "Loyalty", "click", "lylty-deals-wdgt-cta", "1");
        var storeLink = $(this).data("url");
        window.open(storeLink, '_blank');

        if (Modules.Cookie.get("msp_login")) {
            return true;
        }
        Cookie.setCookieMins("signup-utm", $(this).data("utmsource") || "", 2);
    }

    if ($this.is(".prdct-dtl__tlbr-prc-alrt")) {
        if (handleStorePriceAlert($this)) {
            return false;
        }
    }

    if ($this.hasClass("js-prc-tbl__gts-btn")) {
        var cookieName = $this.data("cookiename");
        storeUrl = $this.data('url');

        if (Modules.Cookie.get(cookieName)) {
            window.open(storeUrl);
            return true;
        }

        if ((Modules.Cookie.get('msp_login') || Modules.Cookie.get('partial_login')) && ($this.hasClass("js-check-email-cookie") || ($this.hasClass("check-email-cookie")))) {
            window.open(storeUrl);
            return true;
        }

        if (cookieName) {
            var cookieTimeMins = parseInt($this.data("cookietimemins"), 10),
                cookieTimeDays = parseInt($this.data("cookietimedays"), 10);
            if (!isNaN(cookieTimeMins)) {
                Cookie.addCookieMins(cookieName, "true", cookieTimeMins);
            } else if (!isNaN(cookieTimeDays)) {
                Cookie.addCookie(cookieName, "true", cookieTimeDays);
            }
        }

        Cookie.setCookie('autoPopup', '1', 1);
    }

    if (!popupUrl || popupUrl == "#" || $this.hasClass("storebutton")) {
        popupUrl = $this.data('href');
    }
    _gPopStoreUrl = storeUrl;

    if (popupUrl && popupUrl !== "#") {
        openPopup(popupUrl, popupType);
    }

    return false;
}

function chromePluginPopupTarget() {
    var $this = $(this),
        cookieName = $this.data("cookiename"),
        popupUrl = $this.data("href"),
        popupType = $this.data("promo");

    Cookie.setCookie('autoPopup', '1', 1);

    if (Modules.Cookie.get(cookieName) === "true") {
        window.open($this.data("url"));
        return false;
    }

    if (cookieName) {
        var cookieTimeMins = parseInt($this.data("cookietimemins"), 10),
            cookieTimeDays = parseInt($this.data("cookietimedays"), 10);

        if (!isNaN(cookieTimeMins)) {
            Cookie.addCookieMins(cookieName, "true", cookieTimeMins);
        } else if (!isNaN(cookieTimeDays)) {
            Cookie.addCookie(cookieName, "true", cookieTimeDays);
        }
    }


    _gPopStoreUrl = $this.data('url');
    openPopup(popupUrl, popupType);

    return false;
}

function loyaltyPopupTarget() {
    var $this = $(this),
        isLoggedIn = Modules.Cookie.get("msp_login"),
        loyaltyOnBoarded = Modules.Cookie.get("hideLoyaltyOnBoarded");
        cookieName = $this.data("cookiename"),
        popupUrl = $this.data("href"),
        isMandatory = false;

    Cookie.setCookieMins('autoPopup', '1', 30);

    // Make loyalty GTS popup mandatory in appliances to 50% users (even uids) if logged out
    if (window.dataLayer && dataLayer[0].category === "appliance" && Modules.Cookie.get("msp_uid") % 2 === 0) {
        isMandatory = true;
    } else if (Modules.Cookie.get(cookieName) === "true") {
        window.open($this.data("url"));
        return true;
    }

    if (cookieName) {
        var cookieTimeMins = parseInt($this.data("cookietimemins"), 10),
            cookieTimeDays = parseInt($this.data("cookietimedays"), 10);

        if (!isNaN(cookieTimeMins)) {
            Cookie.addCookieMins(cookieName, "true", cookieTimeMins);
        } else if (!isNaN(cookieTimeDays)) {
            Cookie.addCookie(cookieName, "true", cookieTimeDays);
        }
    }

    if (isMandatory && (isLoggedIn || Modules.Cookie.get("partial_login"))) {
        window.open($this.data("url"));
        return true;
    } else if (isLoggedIn) {
        if (!loyaltyOnBoarded) {
            _gPopStoreUrl = $this.data("url");
            openPopup(popupUrl, "PromoB");
        } else {
            window.open($this.data("url"));
            return true;
        }
    } else {
        _gPopStoreUrl = $this.data("url");
        openPopup(popupUrl, "PromoB");
    }

    return false;
}

function handlePopupOverlayClick() {
    $link = $(".popup-closebutton > a");
    if ($link[0] && $(this).hasClass("noclose")) {
        if ($link[0]) {
            window.open($link.attr('href'), '_blank');
        }
        closePopup();
    } else if (!$(this).hasClass("noclose")) {
        closePopup();
    }
}

function handlePopupOverlayClickRUI() {
    $link = $(".pop-up__cls-btn > a");
    if ($link[0] && $(this).hasClass("noclose")) {
        if ($link[0]) {
            window.open($link.attr('href'), '_blank');
        }
        closePopup_RUI();
    } else if (!$(this).hasClass("noclose")) {
        closePopup_RUI();
    }
}

function getAjaxDataSync(ajaxURL) {
    var ajaxData;
    $.ajax({
        url: ajaxURL,
        async: false
    }).done(function(data) {
        ajaxData = data;
    });
    return ajaxData;
}

function getBrowsePopupData() {
    return getAjaxDataSync("/browse-menu.htm");
}

function getPopupData(popupUrl) {
    return getAjaxDataSync(popupUrl);
}

// should be isPromoPopupSeen
function isPromoPopupShown(popupType) {

    if (typeof(disablePromoPopup) !== "undefined" && disablePromoPopup) {
        return true;
    }


    // promoB has higher priority than promoA
    if ((Modules.Cookie.get('promo_a_shown') && popupType === "PromoA") || (Modules.Cookie.get('promo_b_shown') && popupType === "PromoB")) {
        return true;
    }

    if (popupType == "PromoA") {
        Cookie.setCookie('promo_a_shown', 1, 1); // For a day
    } else if (popupType == "PromoB") {
        Cookie.setCookie('promo_a_shown', 1, 1); // For a day
        Cookie.setCookie('promo_b_shown', 1, 1); // For a day
    }
    return false;
}

function popupCallback(fn, context, params) {
    return function() {
        fn.apply(context, params);
    };
}

function openPopup(popupUrl, popupType) {

    storeUrl = _gPopStoreUrl ? _gPopStoreUrl : null;
    _gPopStoreUrl = null;

    if ((popupType && (popupType === "PromoA" || popupType === "PromoB")) && isPromoPopupShown(popupType)) {
        if (storeUrl) window.open(storeUrl, "_blank");
        popupCallbackQueue = [];
        return;
    }

    if (!Modules.Cookie.get('test_no_popup')) {
        var popupData = getPopupData(popupUrl),
            isForRUI = popupData.indexOf("pop-up__cntnr") > 0;
        
        while (popupCallbackQueue.length > 0) {
            (popupCallbackQueue.shift())();   
        }

        if (isForRUI) {
            $('.pop-up__ovrly, .pop-up__cntnr').remove();

            if (storeUrl) {
                $('body').append([
                    '<div class="pop-up__ovrly js-pop-up__ovrly not-opq noclose"></div>',
                    '<div class="pop-up__cntnr not-opq"></div>'
                ].join(""));
            } else {
                $('body').append([
                    '<div class="pop-up__ovrly js-pop-up__ovrly not-opq"></div>',
                    '<div class="pop-up__cntnr not-opq"></div>'
                ].join(""));
            }

            var $popup = $(popupData),
                $containers = $popup.filter(".pop-up__cntnr").add($popup.find(".pop-up__cntnr"));
            $containers.each(function() {
                $(this).addClass("not-opq");
            });
            $(".pop-up__cntnr").replaceWith($popup);

            if (storeUrl) {
                $(".pop-up__cntnr .pop-up__cls-btn").replaceWith('<div class="pop-up__cls-btn js-pop-up__cls-btn"><a href="' + storeUrl + '" target="_blank">&#10005;</a></div>');
                $(".pop-up__cntnr a.usr-inputbox__input--lnk").attr({ href: storeUrl, target: "_blank" });
            }

            setTimeout((function() {
                $(".pop-up__ovrly, .pop-up__cntnr").removeClass("not-opq");
            }), 200);
        } else {
            $(".popup-overlay, .popup-container, .popup-closebutton").remove();

            if (storeUrl) {
                $('body').append([
                    '<div class="popup-overlay not-vsbl noclose"></div>',
                    '<div class="popup-container not-vsbl">',
                    '<div class="popup-closebutton not-vsbl">',
                    '<a href="' + storeUrl + '" target="_blank">&#10005;</a>',
                    '</div>',
                    '</div>'
                ].join(""));
            } else {
                $('body').append([
                    '<div class="popup-overlay not-vsbl"></div>',
                    '<div class="popup-container not-vsbl">',
                    '<div class="popup-closebutton not-vsbl">&#10005;</div>',
                    '</div>'
                ].join(""));
            }

            setTimeout((function() {
                $(".popup-overlay, .popup-container").removeClass("not-vsbl");
            }), 300);
            setTimeout((function() {
                $('.popup-closebutton').removeClass('not-vsbl');
            }), 900);

            $('.popup-container').append(popupData).css('width', $('.popup-inner-content').outerWidth());

            if (storeUrl) {
                $(".popup-container .popup-skip a, .popup-container a.popup-submit").attr("href", storeUrl);
            }
        }
    }
}

function openAutoPopupURL(url) {
    if (Modules.Cookie.get('msp_login_email') || Modules.Cookie.get('msp_login')) return;

    //To be moved to attribute based categorization
    openPopup(url, "PromoA");
    var msp_uid = Modules.Cookie.get("msp_uid");
    var msp_vid = Modules.Cookie.get("msp_vid");
    var overall_visits = Modules.Cookie.get("num_pages");
    var session_visits = Modules.Cookie.get("visit_num_pages");
    var gts_count = Modules.Cookie.get("gts_count");
    var transaction_count = Modules.Cookie.get("transaction_count");
    var popup_id = $(".auto-popup-data").data("popup_id");
    var experiment_id = $(".auto-popup-data").data("experimentid");
    var emailValue = encodeURIComponent($(".popup-email").val());
    $.post("/users/popup_capture_user_details.php", {
        "experiment_id": experiment_id,
        "msp_uid": msp_uid,
        "msp_vid": msp_vid,
        "overall_visits": overall_visits,
        "session_visits": session_visits,
        "gts_count": gts_count,
        "transaction_count": transaction_count,
        "popup_id": popup_id,
        "emailValue": emailValue
    }, function(data, status) {});
}

function getAutopopupURL($dataElement) {

    if (Modules.Cookie.get("msp_login") == 1) {
        return;
    }

    if ($dataElement.length <= 0) {
        return;
    }
    $popupData = $dataElement.data("popuprule");


    if ($popupData["first-visit"] === true) {
        if (Modules.Cookie.get("msp_uid") == Modules.Cookie.get("msp_vid")) {
            $dataElement.data("popup_id", $popupData["first-visit-id"]);
            openAutoPopupURL($popupData["first-visit-url"]);
            return;
        }
    }
    if ($popupData["repeat-visit"] === true) {
        if (Modules.Cookie.get("msp_uid") != Modules.Cookie.get("msp_vid")) {
            $dataElement.data("popup_id", $popupData["repeat-visit-id"]);
            openAutoPopupURL($popupData["repeat-visit-url"]);
            return;
        }
    }
    if ($popupData["pages-visited"] === true) {
        if (Modules.Cookie.get("visit_num_pages") >= $popupData["pages-visited-count"]) {
            $dataElement.data("popup_id", $popupData["pages-visited-id"]);
            openAutoPopupURL($popupData["pages-visited-url"]);
            return;
        }
    }
    if ($popupData["time-spend"] === true) {
        if (parseInt(Modules.Cookie.get("active_time")) >= parseInt($popupData["time-spend-count"])) {
            $dataElement.data("popup_id", $popupData["time-spend-id"]);
            openAutoPopupURL($popupData["time-spend-url"]);
            return;
        }
    }
    if ($popupData["scroll"] === true) {
        if (window.location.href.indexOf("msp") !== -1 || window.location.href.indexOf("msf") !== -1) {
            Modules.$doc.on('scroll', function(e) {
                if (Modules.$doc.scrollTop() >= Modules.$win.height()) {
                    $dataElement.data("popup_id", $popupData["scroll-id"]);
                    openAutoPopupURL($popupData["scroll-url"]);
                }
            });
        }
    }
    if ($popupData["gts-made"] === true) {
        if (Modules.Cookie.get("gts_count") >= $popupData["gts-made-count"]) {
            $dataElement.data("popup_id", $popupData["gts-made-id"]);
            openAutoPopupURL($popupData["gts-made-url"]);
            return;
        }
    }
    if ($popupData["transaction"] === true) {
        if (Modules.Cookie.get("transaction_count") >= $popupData["time-spend-count"]) {
            $dataElement.data("popup_id", $popupData["transaction-id"]);
            openAutoPopupURL($popupData["transaction-url"]);
            return;
        }
    }
}

function pageLeavePopupBind() {
    $('body').on('mouseleave', function(e) {
        if (e.pageY < 5) openAutoPopup(true);
    });
}

// Show loyalty education page-leave auto-popup
function openPageLeaveGTSPopup() {
    if (window.location.pathname.indexOf("/refurbished/") !== 0 && $(".prdct-dtl, .fltr-wrpr1").length) {
        var invalidSources = ["pa-transact", "ps-transact", "browsing_pa_emailer", "browsing_ps_emailer"];
        if (url.getAQueryParam && invalidSources.indexOf(url.getAQueryParam(utm_source)) === -1) {
            setTimeout(function() {
                $("body").on("mouseleave", function(e) {
                    if (e.pageY < 5 && !Modules.Cookie.get("msp_login") && !$(".pop-up__ovrly, .popup-overlay").length) {
                        openPopup("https://www.mysmartprice.com/loyalty/popup/gts.php?type=pageleave", "PromoB");
                    }
                });
            }, 5000);
        }
    }
}

function closeRefreshPopup() {
    location.reload();
}

function openRefreshPagePopup() {
    var refreshPagePopup = '<div onClick="closeRefreshPopup()" style="position: fixed; top: 0px; z-index: 1000; cursor: pointer; left: 0px; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7);">\
        <div style="position: relative; width: 100%; height: 100%;">\
            <div style="position: absolute; padding: 10px; border-radius: 3px; top: 0px; left: 0px; right: 0px; bottom: 0px; height: 100px; width: 300px; margin: auto; background-color: white; cursor: auto;">\
            <span style="position: absolute; top: -15px; right: -15px; cursor: pointer; color: #eee;">&#10006;</span><p style="font-size: 16px;">Please refresh the page after adding extension.</p>\
            <center><a class="bttn bttn--blue" style="margin-top: 12px;" href="' + window.location.href + '">Refresh the Page</a></center>\
            </div>\
        </div>\
    </div>';
    document.body.innerHTML += refreshPagePopup;
}

function setPopUpCookie() {
    setTimeout(function() {
        if (!Modules.Cookie.get('autoPopup')) {
            var popupUrl = $('[data-autopopup]').data('autopopup');
            openPopup(popupUrl);
            Cookie.setCookie('autoPopup', '1', 1);
        }
    }, 5000);
}
