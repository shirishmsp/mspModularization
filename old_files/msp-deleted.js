/* ********************* */

// Added from Common.js [START]
(function() {
    // Updating tier-specific coins on Comparables PDP
    var $tier = $(".js-prdct-dtl__coin-wrpr"),
        userLogin = getCookie("msp_login"),
        userTier = getCookie("msp_tier");

    if (userLogin == "1" || getCookie("partial_login")) {
        if (userTier == 2 || userTier == 3 || userTier == 4) {
            $(".js-prdct-dtl__coins-bd").text($tier.data("tier" + userTier) + " Cashback");
            // $(".prdct-dtl__coin-tier").text(" " + $tier.data("tier" + userTier + "-name"));
        }
    } else {
        $(".prdct-dtl__coin-lgn").on("click", function() {
            if (window.ga) {
                ga("send", "event", "Loyalty", "PDP-signup", getCookie("msp_uid") || "");
            }
        }).show();
    }

    if (!userLogin && dataLayer[0]["product-type"]) {
        var coins = parseInt($(".js-prdct-dtl__coins-bd").text().replace(/,/g, ""), 10);
        if (coins >= 200) {
            var cashback = Math.floor(coins / 4);
            $(".js-prdct-dtl__coin-wrpr").html($(".js-prdct-dtl__coin-wrpr").html().replace(/our/g, ""));
            $(".js-prdct-dtl__coins-bd").append(" (&#8377;" + cashback + ")");
            $(".js-trck-sign-up").data("utmsource", "PDP-signup-cashback").addClass("js-trck-sign-up-cb");
        }
    }


    // Updating tier-specific coins on Deals PDP
    if ($(".js-tier-coin").length && userLogin && (userTier == 2 || userTier == 3)) {
        $(".js-tier-coin").text($tier.data("tier" + userTier));
    }
}());
// Added from common.js [END]

/* ********************* */

_gPopStoreUrl = null;

// make this false after sale period
// 25th early morning
var disablePromoPopup = false;

    qS = queryString(window.location.search),

    selectedOfferText = "",
    selectedOfferStore = "",
    selectedOfferImage = "",
    selectedOfferId = "",
    selectedOfferURL = "",
    newWindow;

var extra_info = '';

/* ********************* */

// Old:: site 'handleStorePriceAlert'

function handleStorePriceAlert($target) {
    if (sessionStorage && sessionStorage.storePriceAlertEmail) {
        var $pageTitle = $("#mspSingleTitle"),
            $priceLine = $target.closest(".store_pricetable");
        var capture_point, storename;

        capturepoint = $pageTitle.data("capturepoint");
        storename = $priceLine.find(".store_img img").attr("alt");
        if (capturepoint == 'outofstock' || capturepoint == 'upcoming') {
            storename = 'all';
        }

        $.ajax({
            url: "/price_alert/capture_email.php",
            data: {
                "email": sessionStorage.storePriceAlertEmail,
                "mspid": $pageTitle.data("mspid"),
                "bestprice": $pageTitle.data("bestprice"),
                "storeprice": $priceLine.data("pricerank"),
                "storename": storename,
                "popupname": "pricealert",
                "capture_point": capturepoint
            },
            cache: false
        });

        window._vis_opt_queue = window._vis_opt_queue || [];
        window._vis_opt_queue.push(function() { _vis_opt_goal_conversion(200); });

        $target.removeClass("popup-target callout-target").addClass("alert_set btn-disabled").text("Alert Set");
        return true;
    } else {
        $target.addClass("popup_opened");
        popupQueue.push(function() {
            $target.removeClass("popup_opened");
        });
    }
}

/* ********************* */

/*
 * FUTURE:: need to be update classes for search page in new RUI
 * used in search page left sidebar widgets collpasing
 * starts here
 */
;
(function($, window, document, undefined) {
    "use strict";

    function sidebarList(element, options) {
        this.element = element;
        this.defaults = {
            "listLength": $(this.element).data("default")
        };
        this.options = $.extend({}, this.defaults, options);
        this.init(true);
    }

    sidebarList.prototype = {
        "init": function() {
            var $elem = $(this.element),
                $default_no = this.options.listLength,
                $catname = $.trim($elem.find(".listhead").text()),
                $expand = $elem.find(".sublist.expand");
            $elem.each(function() {
                $elem.attr("data-cat", $catname);
                $elem.find('.sublist').not(".expand").slice($default_no).hide();
            });
            var $this = this;
            if ($default_no == 0) { $expand.css("border-top", "none"); }
            $expand.on('click', function() {
                var $action = $(this).find("a:visible").hasClass("show-all") ? 1 : 0,
                    $border = ["none", "1px dotted #ccc"];
                $this.expand($catname, $action);
                if ($default_no == 0) {
                    $(this).css("border-top", $border[$action]);
                }
                return false;
            });
        },
        "expand": function($catname, $action) {
            var $elem = $(this.element),
                $widget = $elem.filter('[data-cat="' + $catname + '"]'),
                $expand = $elem.filter('[data-cat="' + $catname + '"]').find('.expand'),
                $default_no = this.options.listLength;
            $widget.find('.sublist').not(".expand").slice($default_no).toggle();
            $expand.find(".show-all").toggle();
            $expand.find(".show-default").toggle();
        }
    };

    $.fn.sidebarList = function(options) {
        return this.each(function() {
            $.data(this, "sidebarList", new sidebarList(this, options));
            if (!$.data(this, "sidebarList")) {
                // preventing against multiple instantiations
                $.data(this, "sidebarList", new sidebarList(this, options));
            } else {
                var sidebarListObj = $.data(this, "sidebarList");
                // checking if option is a valid function name
                if (typeof options === "string" && sidebarListObj[options]) {
                    sidebarListObj[options].call(sidebarListObj);
                } else if (typeof options === "object") {
                    // if the option is object extending it with initalized object
                    sidebarListObj.options = $.extend({}, sidebarListObj.options, options);
                }
            }
        });
    };
})(jQuery, window, document);

$doc.ready(function() {
    $(".sidebardiv_collapsable").sidebarList();
});

/* ********************* */

$.expr[':'].icontains = function(a, b, c, d) {
    var e = ($.trim(jQuery(a).text()) || '').toLowerCase(),
        f = e.indexOf(c[3].toLowerCase());
    if (f > 0) return true;
    else return false;
};

/* ********************* */

/*
 * OLD:: callouts are old site feature
 * new feature is tooltip
 * starts here
 */

// Callout tooltip functions start here
function showCallout($target, animate) {
    var data = $target.data("callout");
    if (!data)
        return;
    $(".callout").remove();
    $("body").append("<div class='callout top-left'" + (animate ? " style='display: none;'" : "") + ">" + data + "</div>");
    var deltaTop = 7,
        deltaLeft = $target.hasClass("store_help") ? 4 : 0,
        $callout = $(".callout"),
        topValue = $target.offset().top - $callout.outerHeight() - deltaTop;
    $callout.css({
        "top": topValue,
        "left": $target.offset().left - deltaLeft
    });
    if (topValue - $(window).scrollTop() - $(".header").outerHeight() <= 0)
        $callout.toggleClass("top-left bottom-left").css("top", $target.offset().top + $target.outerHeight() + deltaTop);
    if (animate)
        $callout.slideDown("fast");
}

function hideCallout(animate) {
    if (animate) {
        $(".callout").slideUp("fast", function() {
            $(this).remove();
        });
    } else
        $(".callout").remove();
}

$doc.on("mouseenter", ".callout-target:not(.callout-onclick)", function() {
    showCallout($(this), false);
}).on("mouseleave", ".callout-target:not(.callout-onclick)", function() {
    hideCallout(false);
});

$doc.on("click", ".callout-target.callout-onclick", function() {
    if (!$(".callout").length) {
        showCallout($(this), true);
        return false;
    }
}).on("click", function() {
    hideCallout(true);
});

/* RUI:: Message Boxes - start */

/* ********************* */

function showPushNotifPopup() {
    if ("Notification" in window) {
        if (window.location.protocol === "https:") {
            if (Notification.permission !== "granted" && Notification.permission !== "denied" && !Cookie.get("notif-perm-seen")) {
                setTimeout(function() {
                    Notification.requestPermission()
                    .then(result => {
                        if (result === "granted") {
                            if(window.ga) {
                                ga('set', 'dimension9', '1');
                                ga("send", "event", "browser_notif", "permission_https", "granted", { nonInteraction: true });
                            }
                            $("<iframe>").attr("src", "https://www.mysmartprice.com/promotions/popups/push_notif_subscribe_window.php").hide().appendTo("body");
                        }
                    });
                    Cookie.set("notif-perm-seen", 1, "1d");
                    if(window.ga) {
                        ga("send", "event", "browser_notif", "permission_https", "requested", { nonInteraction: true });
                    }
                }, 1000);
            }
        } else if (window.location.protocol === "http:") {
            if (Cookie.get("visit_num_pages") > 1) {
                $win.on("message", handleMessage);
                $("<iframe>").attr("src", "https://www.mysmartprice.com/promotions/popups/push_notif_iframe_3.php").hide().appendTo("body");
            }
        }
    }

    /* Nested Functions: */

    function handleMessage(e) {
        var event = e.originalEvent;
        if (event.origin === "https://www.mysmartprice.com") {
            $win.off(e);
            if (event.data !== "granted" && event.data !== "denied") {
                setTimeout(function() {
                    openPopup("https://www.mysmartprice.com/deals/popup/push_notif_popup_3.php?source=cron", "PromoB");
                }, 5000);
            }
        }
    }
}

/* ***************************** */

function appendPushNotifIframe() {
    if ("http:" === document.location.protocol) {

        var izFrame = document.createElement("IFRAME");
        izFrame.setAttribute("src", "https://www.mysmartprice.com/promotions/popups/push_notif_iframe.php");
        izFrame.style.display = "none";

        document.body.appendChild(izFrame);

        window.onmessage = function(a) {
            if (a.data == 'subscribed') {
                openPopup("https://www.mysmartprice.com/promotions/popups/push_notif_http_popup.php");
            }
        };
    } else if ("https:" === document.location.protocol) {
        $("head").append('<link rel="manifest" href="/manifest.json">');

        if((window.localStorage && localStorage.push_notif_permission_granted) || (Notification.permission === 'granted' && !Cookie.get("sync_sub"))) { //re-syncing and re-subscribing if the permission is granted already
            if(window.localStorage && localStorage.push_notif_permission_granted) {
                extra_info = 'resub';
            } else {
                extra_info = 're-sync';
                Cookie.set("sync_sub", "1", "7d");
            }
            initialiseStateMain();
        } else if (window.location.pathname.indexOf("/deals/") === -1 && window.location.pathname.indexOf("-msf") === -1) {
            if (Notification.permission !== "granted" && Notification.permission !== "denied") { //https non deals and msf page, but action hasn't been taken yet
                if (window.location.pathname.indexOf("/promotions/plugin/welcome") === 0 || window.location.pathname.indexOf("/promotions/plugin/bye") === 0) { //EXCEPTION: if welcome or bye page, ask for permission irrespective of cookie
                    initialiseStateMain();
                } else if (!Cookie.get("msp_notif_popup_shown")) { //if we haven't asked in last 4hours, ask again
                    Cookie.set("msp_notif_popup_shown", 1, "0.125d");
                    initialiseStateMain();
                }
            }
        }
    }
}

/* ***************************** */

/********************************/

function sendSubscriptionToServerMain(sub, subStatus, capturePoint, isClose, cookies) {
    if(sub) {
        var subid = sub.endpoint.split("/").slice(-1)[0];
        if (subid == 'send') {
            subid = sub.subscriptionId;
        }
    } else {
        var subid = 0;
    }

    let email = Cookie.get("msp_login_email");
    let uid = Cookie.get("msp_uid");
    let vid = Cookie.get("msp_vid");
    let ajaxData = {
            "subid": subid,
            "email": email,
            "uid": uid,
            "vid": vid,
            "status": subStatus,
            "source": 'desktop',
            "p256dh": p256dh,
            "auth": auth,
            "endpoint": endpoint,
            "browser": browserMain(),
            "extra_info": extra_info,
            "capture": capturePoint
        };

    if (sub) {
        var json = sub.toJSON();
        var endpoint = sub.endpoint;
        var p256dh = json.keys.p256dh;
        var auth = json.keys.auth;
    }
    $.ajax({
        type: 'POST',
        url: "/util/log_chrome_notif_subs.php",
        data: ajaxData
    });
    
    if(window.localStorage && localStorage.push_notif_permission_granted) {
        localStorage.removeItem("push_notif_permission_granted");
    }
    if(isClose) {
        window.close();
    }
}

/*************************************/

/** validate.form(formData)
 *
 * @param {array} formData -> [{ -> array of objects having info of each form field.
 *   @param {string} "type" : "email", -> input validation type
 *   @param {$node} "inputField" : $('.form-inpt'), -> jquery node of input field
 *   @param {$node} "errorNode" : $(".js-vldtn-err"), -> jquery node of validation error message.
 *   @param {string} "errorMsg" -> error message to be shown on failed validation 
 *   @param {object} "options" -> type specific extra checks 
 * }, .....]
 * 
 * @return Promise: For success and failure handlers of client.
 */
form(formData, highlightErrorClass) { /* highlightErrorClass = "hghlght-err-fld" */
    let 
    return new Promise(function(resolve, reject) {

    });

    var isValid = true,
        check = this,
        $firstErrorField;

    $.each(formData, function(i, field) {
        var result = check[field.type](field.inputField.val(), field.options),
            dataIsShown = field.errorNode.data("isShown") || 0;

        if (result === false) {
            if (field.errorNode instanceof jQuery) {
                if (true) {
                    field.errorNode.text(field.errorMsg || field.errorNode.text() || "Please check and correct the red-marked field(s).")
                        .data("isShown", ++dataIsShown).slideDown();
                }
                if (!$firstErrorField && field.inputField) {
                    $firstErrorField = field.inputField;
                    $firstErrorField.focus();
                    $firstErrorField.off("blur");
                }
                field.inputField.addClass(highlightErrorClass);
            }
            isValid = false;
        } else {
            if (dataIsShown >= 1) {
                field.errorNode.data("isShown", --dataIsShown).slideUp();
            }
            field.inputField.removeClass(highlightErrorClass);
        }
    });

    if (isValid) { resolve(); } 
    else { reject(); }
}

/***************************************/

function checkAndChangeHash() {
    if (/@/g.test(window.location.hash)) {
        window.location.hash = ''; // changes hash to empty string
    }
};

/***************************************/