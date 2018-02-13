(function setChromeAutoPopup() {
    var validUTMSources = ['pa-transact', 'ps-transact', 'browsing_pa_emailer', 'browsing_ps_emailer'];
    if (window.qS && validUTMSources.indexOf(qS.utm_source) !== -1) {
        if (isChrome()) {
            isPluginInstalled().fail(function(){
                window.ga && ga("send", "event", "autopopup", "pricedrop", "pdp-pageview", { nonInteraction: true });
                $('body').attr('data-autopopup', '/promotions/install-extn-auto-popup.php');
            });
        }
    }
}());

// Make extension install compulsory if particular utm_source for the same is set:
(function() {
    $.when(isPluginInstalled()).fail(function() {
        var validFBTag = qS.utm_source === 'FB-DRT-MSP-25CB' || qS.utm_source === 'FB-DRT-MSP' || (qS.utm_source && qS.utm_source.indexOf('acebook') !== -1);
        if(validFBTag && isChrome()) {
            function checkInstallation() {
                $('.popup-closebutton').addClass('not-vsbl');
                $('.popup-overlay').addClass('noclose');
                if (!Modules.Cookie.get('plugin_id')) { 
                    intervalCount++;
                    if (intervalCount <= 180) {
                        setTimeout(checkInstallation, 1000);
                    }
                }
            }
            var intervalCount = 0;
            openPopup('/deals/popup/extension_install_overlay.php?pageSource=fbTaggedSinglePage'); 
            checkInstallation();
        }
    });
})();

(function() {
    $('.page-nvgtn--PDP').on('click', '.page-nvgtn__item', function() {
        window.ga && ga('send', 'event', 'Comparables', 'pdp-nav-click', $(this).data('href'));
    });
})();


(function postInstallMailLink() {
    if(qS.utm_source === 'mail_gtsinstall') {
        popupDataObj = {
            type: "signup"
        };
        openPopup('/users/login.html');
    }
})();

// Moved from PDP source (findpricehelpers.php); remove if unused
(function () {
    $("#compare_button").show();

    $("body").on("click", "#addtolistbutton", function () {
        var msp_login = Modules.Cookie.get("msp_login");
        if (msp_login == 1) {
            $("#addedtolistbutton").css("display", "inline-block");
            $("#addtolistbutton").hide();
            $.get("https://www.mysmartprice.com/users/add_to_list.php", {
                "mspid": PriceTable.dataPoints.mspid
            });
        }
        else {
            var checklogin = setInterval(function () {
                var msp_login = Modules.Cookie.get("msp_login");
                if (msp_login == 1) {
                    clearInterval(checklogin);
                    $("#addtolistbutton").click();
                }
            }, 500);
            $(".loginbutton").click();
        }
        return false;
    });

    $("body").on("click", ".logoutbutton", function () {
        $("#addedtolistbutton").hide();
        $("#addtolistbutton").css("display", "inline-block");
    });
}());

// Clicks outside message boxes should close the msg boxes that are open
Modules.$doc.on('click', 'body', function(event) {
    var $msgBox = $('.msg-box'),
        $exception;
    // click NOT on msg box
    if (!$(event.target).closest('.js-xtrs-msg-box-trgt').length &&
        !$(event.target).closest('.js-msg-box-trgt').length) {
        $msgBox.each(function(index, element) {
            if ($(element).closest('.js-msg-box-trgt').length) {
                $(element).removeClass('msg-box--show');
            } else if ($(element).closest('.js-xtrs-msg-box-trgt').length) {
                $exception = $(element).closest('.js-xtrs-msg-box-trgt');
                if ($exception.hasClass('cashback') || $exception.hasClass('offline')) {
                    $(element).removeClass('msg-box--show');
                } else {
                    $(element).remove();
                }
            }
        });
    }
});