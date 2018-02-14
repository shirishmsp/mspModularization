define(["modules-bundle"],function(Modules){

 /* Decide whether to show or hide sidebar ads */
;
(function sidebarAdsHandler() {
    var sidebarAds = function(gptId) {
            return [
                /* '<div class="ad-sdbr__cls">&times;</div>', */
                '<div id="' + gptId + '" style="height:600px; width:120px;">',
                '<script> googletag.cmd.push(function() { googletag.display("' + gptId + '"); }); </script>',
                '</div>'
            ].join('');
        },
        sideFreeSpace = window.innerWidth - 1000,
        adWidth = 120,
        adMarginFromCenter = 500 + Math.max(10, Math.min(40, (sideFreeSpace / 2 - adWidth) / 2));

    if (!Modules.Cookie.get('hideSidebarAds')) {
        var $leftAd = $('.ad-sdbr--left'),
            $rightAd = $('.ad-sdbr--rght');
        $leftAd.append(sidebarAds($leftAd.data('id')));
        $rightAd.append(sidebarAds($rightAd.data('id')));
        $leftAd.css('margin-right', adMarginFromCenter + 'px');
        $rightAd.css('margin-left', adMarginFromCenter + 'px');
        $('.ad-sdbr__cls').on('click', function() {
            setCookie('hideSidebarAds', 1, 1);
            $('.ad-sdbr').remove();
        });
    }
})();
Modules.$doc.ready(function() {
    $(".js-shr-dl").on("click", function() {
        var tltp = $(".prdct-dtl__tlbr-shr-tltp");
        tltp.toggleClass("hide");
    });
});

//Capturing Email for newletter (from eight sidebar widger)
$('.cptr-eml-card__btn').click(function() {
    if (!$(this).hasClass('btn--red')) {
        return false;
    };
    var $emailbox = $(this).closest('.cptr-eml-card__frm');
    var email = $emailbox.find('.cptr-eml-card__inpt').val();
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid Email ID.");
        return false;
    }
    var url;
    if ($('.algn-wrpr__dls').length || $(".prdct-dtl--deal").length) {
        url = '/deals/save_email.php';
    } else {
        url = 'http://www.mysmartprice.com/fashion/promotion/capture_email';
    }
    var page_url = window.location.href;
    $.ajax({
        'url': url,
        'type': 'POST',
        'data': {
            "email": email,
            "page_url": page_url,
            "type": 'sidebar'
        },
    }).done(function(response) {
        // if (response.data == "SUCCESS") {
        $emailbox.find('.cptr-eml-card__inpt-wrpr').hide();
        $emailbox.find('.cptr-eml-card__msg').hide();
        $emailbox.find('.cptr-eml-card__alt-msg.sccss-msg').show();
        $emailbox.find('.btn--red').html('Subscribed');
        $emailbox.find('.btn--red').removeClass('btn--red');

        if ($emailbox.parents().hasClass("prdct-dtl__deal-sbscrb")) {
            $emailbox.html("");
            $(".prdct-dtl__deal-sbscrb__lbl").html("Email Subscribed Successfully!");

        }

    }).fail(function(response) {
        $emailbox.find('.cptr-eml-card__inpt-wrpr').hide();
        $emailbox.find('.cptr-eml-card__msg').hide();
        $emailbox.find('.cptr-eml-card__alt-msg.err-msg').show();
        $emailbox.find('.btn--red').html('Not Subscribed');
        $emailbox.find('.btn--red').removeClass('btn--red');
    });
    return false;
});
headerDropdownsHandlers();

Modules.$doc.on("click", hideDropdownContent)
    .on("click", ".dropdown .btn-dropdown", toggleDropdownContent);
    
function headerDropdownsHandlers() {
    var menuShowTimeout;
    Modules.$doc.on('click', 'body, .js-ctgry-btn, .js-drpdwn-menu-wrpr', function(e) {
        var data, time, now, diffTime, loadingTimeout;

        e.stopPropagation();

        if (!$('.drpdwn-menu-wrpr--show').length && $(this).hasClass("js-ctgry-btn")) {
            $('.js-drpdwn-menu-wrpr').addClass('drpdwn-menu-wrpr--show');
            $('.js-drpdwn-menu-ovrly').addClass('drpdwn-menu-ovrly--show');
            if (Modules.$win.height() < $(".drpdwn-menu").height() + $('.js-drpdwn-menu-wrpr').offset().top) {
                $(".js-drpdwn-menu-wrpr").addClass("drpdwn-menu-wrpr--s");
            }
            if ($('.drpdwn-menu').data('processed') == 'done' && location.hash !== '#forcepopup') {
                menuShowTimeout = setTimeout(function() {
                    $('.drpdwn-menu').addClass('drpdwn-menu--show');
                }, 340);
                return; //if already procesed
            }

            if (localStorage && location.hash !== '#forcepopup') {
                //check if data is not one week old
                time = parseInt(localStorage.browsePopupDataTime, 10);
                now = new Date().getTime();
                diffTime = (now - time) / (1000 * 60 * 60 * 24);

                if (diffTime < 30 && localStorage.browsePopupDataVer == $('.js-drpdwn-menu-wrpr').data('ver')) {
                    //getting data from localStorage
                    data = localStorage.browsePopupData;
                }
            }

            if (!data || data == 'undefined' || data === undefined) {
                loadingTimeout = setTimeout(function() {
                    $('.js-drpdwn-menu-wrpr').find('.drpdwn-menu-wrpr__ldng').show();
                }, 600);
                data = getBrowsePopupData();
                localStorage.browsePopupData = data;
                localStorage.browsePopupDataTime = new Date().getTime();
                localStorage.browsePopupDataVer = $('.js-drpdwn-menu-wrpr').data('ver');
                // if data is not avaialble in localStorage do ajax and save in localStorage for later use
            }
            if (data && data != 'undefined' && data !== undefined) {
                $('.drpdwn-menu').html(data).data('processed', 'done');
                menuShowTimeout = setTimeout((function() {
                    $('.js-drpdwn-menu-wrpr').find('.drpdwn-menu-wrpr__ldng').hide();
                    clearTimeout(loadingTimeout);
                    $('.drpdwn-menu').addClass('drpdwn-menu--show');
                }), 340);
                // on data available hide loading and show data
            }
        } else if (!$(this).hasClass('js-drpdwn-menu-wrpr')) {
            clearTimeout(menuShowTimeout);
            $('.js-drpdwn-menu-wrpr').removeClass('drpdwn-menu-wrpr--show');
            $('.drpdwn-menu').removeClass('drpdwn-menu--show');
            $('.js-drpdwn-menu-ovrly').removeClass('drpdwn-menu-ovrly--show');
            $('.js-drpdwn-menu-wrpr').find('.drpdwn-menu-wrpr__ldng').hide();
        }
    });
}

function hideDropdownContent() {
    $(".dropdown .dropdown-content").addClass("hide");
}

function toggleDropdownContent() {
    $(".dropdown .dropdown-content").toggleClass("hide");
    return false;
}
// New footer setup and event handlers:
(function initFooter() {
    var footerEmailInput = $('.js-ftr-eml-inpt'),
        footerEmailSubmit = $('.ftr__lylty__eml-wrpr-sbmt');

    /* Opens Login Popup: To be called only when user is logged out (or partial login) */
    function footerLogin($this) {
        var _email = $this.val();
        if (!Modules.Validator.email(_email)) {
            alert('Please enter a valid email address');
        } else {
            var partiallyLoggedIn = Modules.Cookie.get('partial_login');
            if (!partiallyLoggedIn) {
                popupDataObj = {
                    type: "signup"
                };
            }
            // Set Email Cookie to prefill input on popup:
            setCookie('msp_login_email', _email);
            openPopup('/users/login.html');
        }
    }

    if (footerEmailInput.length) {
        var savedEmail = Modules.Cookie.get('msp_login_email'),
            loggedIn = Modules.Cookie.get('msp_login');

        if (loggedIn) { // Show different message if logged in
            var $ftrLoyaltyInfoHead = $('.js-lylty-info-hdr'),
                $ftrLoyaltyInfoSteps = $('.js-lylty-info-stps'),
                $ftrLoyaltyEmailWrapper = $('.js-ftr-eml-wrpr'),
                $ftrLoyaltyStatsWrapper = $('.js-ftr-stats-wrpr');

            $ftrLoyaltyInfoHead.html('Congratulations! You\'re already a Cashback Program member.');
            $ftrLoyaltyInfoSteps.html([
                'Shop &rarr; Earn Cashback &rarr; Transfer to your Bank A/c ',
                '<span class="ftr__lylty__txt-link js-open-link" data-open-link="/cashback/more-details/?ref=desktop_footer">Know more.</span>'
            ].join(''));
            $ftrLoyaltyEmailWrapper.hide();
            $ftrLoyaltyStatsWrapper.replaceWith([
                '<div data-href="/users/login.html" class=" bttn bttn--scndry ftr__lylty__view-cshbk js-lylty-login js-open-link" data-open-link="/loyalty/">',
                'View your cashback',
                '</div>'
            ].join(''));
        } else {
            if (savedEmail) footerEmailInput.val(savedEmail);

            // Event Handlers:
            footerEmailInput.on('keyup', function(e) {
                if (e.keyCode === 13) { // "Enter" key's code is 13
                    footerLogin(footerEmailInput);
                }
                return false;
            });
            footerEmailSubmit.on('click', function() {
                footerLogin(footerEmailInput);
                return false;
            });
        }
    }
})();

/* RUI:: added classes of new UI to the existing handlers - start */
// binding keys start here
Modules.$doc.keyup(function(e) {
    if (e.keyCode == 27) { //esc button
        if ($('.browse-popup-cont.show, .drpdwn-menu-ovrly--show').length !== 0) {
            $('.browse-menu-btn .js-ctgry-btn').click(); //if browse menu is displayed close it  
        }
        if ($('.popup-overlay').length !== 0) {
            $('.popup-overlay').click(); //if popup is displayed close it
        }

        if ($(".pop-up__cls-btn")[0]) {
            $link = $(".pop-up__cls-btn > a");
            if ($link[0]) {
                window.open($link.attr('href'), '_blank');
            }
            $link.trigger(closePopup_RUI());
        }
    }
});

Modules.$doc.keydown(function(e) {
    if (e.altKey) { // checking for alt key
        var key = String.fromCharCode(e.keyCode).toLowerCase();
        switch (key) {
            case 'c':
                {
                    $('.browse-menu-btn, .js-ctgry-btn').click();
                    break;
                }
            case 's':
                {
                    $('.srch-wdgt__fld').focus();
                    break;
                }
        }
    }
});
// binding keys end here
/* RUI:: added classes of new UI to the existing handlers - start */

// **START** 
// OLD MSP.JS CODE --> Category dropdown: browse menu --> for old headers on non-comparables pages
// KEPT FOR COMPATIBILITY.
// browse menu processing start here
Modules.$doc.ready(function() {
    Modules.$doc.on('click', '.browse-menu-btn, .browse-popup-cont', function(e) {
        var left = $('.browse-menu-btn')
            .offset()
            .left;
        $('.browse-popup')
            .css('left', left)
            .toggleClass('show');
        $('.browse-popup-cont')
            .toggleClass('show');
        if ($('.browse-popup.show')
            .length !== 0) {

            if ($('.browse-popup-data')
                .data('processed') == 'done' && location.hash !== '#forcepopup') {
                setTimeout((function() {
                    $('.browse-popup')
                        .find('.loading-circle')
                        .hide();
                    $('.browse-popup-data')
                        .addClass('show');
                }), 340);
                return; //if already procesed
            }

            var data;

            if (localStorage && location.hash !== '#forcepopup') {

                //check if data is not one week old
                var time = parseInt(localStorage.browsePopupDataTime, 10),
                    now = new Date()
                    .getTime(),
                    diffTime = (now - time) / (1000 * 60 * 60 * 24);

                if (diffTime < 30 && localStorage.browsePopupDataVer == $('.browse-popup-data')
                    .data('ver')) {
                    //getting data from localStorage
                    data = localStorage.browsePopupData;
                }

            }

            if (!data || data == 'undefined' || data === undefined) {
                $('.browse-popup')
                    .find('.loading-circle')
                    .show();
                data = getBrowsePopupData();
                localStorage.browsePopupData = data;
                localStorage.browsePopupDataTime = new Date()
                    .getTime();
                localStorage.browsePopupDataVer = $('.browse-popup-data')
                    .data('ver');
                // if data is not avaialble in localStorage do ajax and save in localStorage for later use
            }
            if (data && data != 'undefined' && data !== undefined) {
                $('.browse-popup-data')
                    .html(data)
                    .data('processed', 'done');
                setTimeout((function() {
                    $('.browse-popup')
                        .find('.loading-circle')
                        .hide();
                    $('.browse-popup-data')
                        .addClass('show');
                }), 340);
                // on data available hide loading and show data
            }

        } else {
            $('.browse-popup-data')
                .removeClass('show');
        }
    });

    Modules.$doc.on('click', '.browse-popup', function(e) {
        e.stopPropagation();
    });
    // browse menu processing end here

    // // browse popup functions start here
    function getBrowsePopupData() {
        return getAjaxDataSync("/old_browse-menu.htm");
    }
    // browse popup functions end here

    // ajax functions start here
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
    // ajax functions end here
});

(function headerSPEvent() {

    Modules.$doc.on('click', '.js-lylty-hdr', function() {
        var partialLogin = Modules.Cookie.get("partial_login");

        var gaEvent = partialLogin ? "Partial-Login-Click" : "Loyalty-Header-Click";

        window.ga && ga("send", "event", "Loyalty", gaEvent, Modules.Cookie.get("msp_uid") || "");

    })
})();
var url = new Modules.Url(); // Common for the whole bundle

(function signupDestUrlAppending() {
    var $this = $('.usr-inputbox__optns-link--dlmtr');
    if ($this.length && url.getAQueryParam('destUrl')) {
        var rdrctUrl = url.getAQueryParam('destUrl');
        rdrctUrl = url.getAQueryParam('utm_source') ? rdrctUrl + "&utm_source=" + url.getAQueryParam('utm_source') : rdrctUrl;
        var crntUrl = $this.attr("href");
        $this.attr("href", crntUrl + "?destUrl=" + encodeURIComponent(rdrctUrl));
        return;
    } else {
        return;
    }
})();

const loginCallbackQueue = [];

var MSP = {};

function loginCallback(fn, context, params) {
    if (Modules.Cookie.get("msp_login") == "1") {
        fn.apply(context, params);
    } else {
        loginCallbackQueue.push(function() {
            fn.apply(context, params);
        });
        $(".js-lgn").eq(0).click();
    }
}

function isUserPasswordExist(userEmail) {

    var dfd = $.Deferred();
    $.ajax({
        "url": "/users/login_common.php", //"/users/usermanage.php",
        "type": "POST",
        dataType: "JSON",
        "data": {
            "email": encodeURIComponent(userEmail),
            "process": "query_password",
            "login_type": "isUserPasswordExist"
        }
    }).done(function(response) {
        dfd.resolve(response);
    });

    return dfd.promise();
}


var extnsnWlcmPage = {};

if ($(".demo-login").length) {
    extnsnWlcmPage = {
        changeMessage: function() {
            var pluginInstallSource = Modules.Cookie.get("pluginInstallSource"),
                installationMessage = "";

            if (Modules.Cookie.get("msp_login")) {
                installationMessage = "Get Cashback on Every Purchase via MySmartPrice <a class='demo__knw-more' href='http://www.mysmartprice.com/loyalty/?ref=welcome#tabOpen=how_it_works'>Know More</a>";
                $(".demo-login .demo-signup__form").hide();
                if (pluginInstallSource && (pluginInstallSource === "deal-comparables" || pluginInstallSource === "pluginCashback")) {
                    installationMessage = "Complete Purchase via MySmartPrice and Get Cashback";
                }
            } else {
                installationMessage = "Signup and Get Rs.25<span class='demo-login__hdr-offr'>Cashback</span>";
                $(".demo-login .demo-signup__form").show();
                if (pluginInstallSource && (pluginInstallSource === "deal-comparables" || pluginInstallSource === "pluginCashback")) {
                    installationMessage = "Signup to Get Cashback";
                }
            }

            $(".demo-login .demo-login__hdr-cntnt").html(installationMessage);
        },
        signupFormValidator: function() {
            var $email = $('#demo-signup__email'),
                $password = $('#demo-signup__password'),
                $errorNode = $(".demo-login div.error");
            MSP.utils.validate.form([{
                "type": "email",
                "inputField": $email,
                "errorNode": $errorNode,
                "errorMsg": "Please enter a valid email"
            }, {
                "type": "required",
                "inputField": $password,
                "errorNode": $errorNode,
                "options": { "min": 6 },
                "errorMsg": "Password must be atleast 6 characters long"
            }]).done(function() {
                captureEmail($email.val());
                var loylaty_utm_source = url.getAQueryParam('utm_source') ? url.getAQueryParam('utm_source') : utmsource;
                if ($(".js-chrm-wlcm").length || $(".wlcm-hdr").length) {
                    loylaty_utm_source = "chrome welcome";
                }

                $.ajax({
                    type: "POST",
                    url: "/users/login_common.php", //"/users/usermanage.php"
                    dataType: "JSON",
                    async: false,
                    data: {
                        process: 'signup',
                        email: encodeURIComponent($email.val()),
                        password: $password.val(),
                        subscribed_status: 'subscribed',
                        source: 'desktop',
                        login_type: 'signup',
                        number: "",
                        utm_source: loylaty_utm_source
                    }
                }).done(function(msg) {
                    if (msg == "error" || msg.auth.result.msg == 'error') {
                        $errorNode.html("There is some error in signup. Please try after sometime");
                        if (Modules.Cookie.get('u99rs1deal')) {
                            alert('Unable to login. Please check credentials'); // Alert to bring back focus to current tab (Not GTS tab)
                        }
                    } else {
                        if (msg.auth.result.msg == 'true') {
                            setCookie("chrome_extension_welcome", "1", 1);
                            loginme(msg);
                            closePopup();
                        } else {
                            $errorNode.html(msg.auth.result.msg + ". <a class='js-popup-trgt demo-login__link' data-href='/users/login.html'>Click here to login</a>");
                            $errorNode.show();
                        }
                    }
                    return false;
                });
            });
            return false;
        },
        eventHandlers: function() {
            $(".demo-signup__email").change(function() {
                $(".demo-signup__email").blur(function() {
                    $this = $(this);
                    if (Modules.Validator.email($this.val())) {
                        $this.removeClass("hghlght-err-fld");
                        !$(".demo-signup__form .hghlght-err-fld").length && $(".demo-signup__form div.error").text("");
                    } else {
                        $this.addClass("hghlght-err-fld");
                        $(".demo-signup__form div.error").text("Please enter a valid email");
                    }
                });
            });
            $('.demo-signup__password').on('change', function() {
                $('.demo-signup__password').on('blur', function() {
                    $this = $(this);
                    if (Modules.Validator.required($this.val())) {
                        $this.removeClass("hghlght-err-fld");
                        !$(".demo-signup__form .hghlght-err-fld").length && $(".demo-signup__form div.error").text("");
                    } else {
                        $this.addClass("hghlght-err-fld");
                        $(".demo-signup__form div.error").text("Please enter a password");
                    }
                });
            });
            $('.demo-signup__submit').click(function(e) {
                e.preventDefault();
                extnsnWlcmPage.signupFormValidator();
            });
        },
        init: function() {
            this.eventHandlers();
        }
    }
}

function windowLogin(pageType, queryParams){
    var pageURL = "https://www.mysmartprice.com/users/";

    if (pageType == "signup") {
        pageURL = "https://www.mysmartprice.com/users/signup.php";
    } else if (pageType == "login") {
        pageURL = "https://www.mysmartprice.com/users/login.php";
    }
    newWindow = window.open(pageURL + queryParams);
    window.addEventListener("message", receiveMessage, false);
}


Modules.$doc.on("click", ".js-lgn", function() {
    var windowParams = "?destUrl=" + encodeURIComponent(window.location.href);
    if ((window.screenTop || window.screenY)) {
        windowParams += "&close=1";
    }
    windowLogin($(this).data("page"), windowParams);
});

function receiveMessage(event) {
    if(event.origin=="https://www.mysmartprice.com" && event.data=="update_ui"){
        postLogin();
    }
}

function postLogin() {
    newWindow.close();
    update_ui();
}

function update_ui() {

    var defaultLoginName = "My Account",
        partial_login = Modules.Cookie.get("partial_login"),
        msp_login = Modules.Cookie.get("msp_login"),
        new_user = Modules.Cookie.get("new_user"),
        msp_user_image = Modules.Cookie.get("msp_user_image"),
        msp_login_name = Modules.Cookie.get("msp_login_name") || "",
        msp_login_email = Modules.Cookie.get("msp_login_email") || "",
        userLinks = [
            '<div class="user-link">',
            '<div class="drpdwn-wdgt__item user-link__rwrds js-open-link" data-open-link="/loyalty">',
            '<span class="user-link__icon-rwrds"></span> My Cashback</div>',
            '<div class="drpdwn-wdgt__item user-link__rfr js-open-link" data-open-link="/promotions/refer/?ref=header_nav">',
            '<span class="user-link__icon-rfr"></span> Refer &amp; Earn</div>',
            '</div>'
        ].join(""),
        partialLoginUserLinks = [
            '<div class="user-link js-prtl-lgn">',
            '<div class="drpdwn-wdgt__item user-link__rwrds js-open-link" data-need-login="true" data-open-link="/loyalty">',
            '<span class="user-link__icon-rwrds"></span> My Cashback</div>',
            '<div class="drpdwn-wdgt__item user-link__rfr js-open-link" data-need-login="true" data-open-link="/promotions/refer/?ref=header_nav">',
            '<span class="user-link__icon-rfr"></span> Refer &amp; Earn</div>',
            '</div>'
        ].join("");

    $(".js-trck-sign-up").show();
    $(".cshbck-str__top").show();
    $(".cshbck-str__top-sign").removeClass("hide");
    if (partial_login || msp_login) {
        $(".cshbck-str__top-sign").addClass("hide");
        if (!Modules.Cookie.get("msp_loyalty_points")) {
            $.ajax({
                url: '/users/get_msp_coins.php',
                async: false,
                type: "POST",
                data: encodeURIComponent(msp_login_email)
            }).done(function(result) {
                result = JSON.parse(result);
                if (result) {
                    if (result["coins"]) {
                        // setting cookie for a day only
                        // we need to check if the user is flagged or not daily
                        setCookie("msp_loyalty_points", result["coins"], 1);
                    }
                    // check if the user is flagged
                    // set cookie if the user is flagged
                    if (result["may_4th"]) {
                        setCookie("may_4th", "712", 30);
                    }
                }
            });
        }
        $(".js-trck-sign-up").hide();
        $(".cshbck-str__top").hide();
    }

    //Loyalty Experiment
    var coinText = "",
        coinSubText = "",
        loyaltyPoints = $.trim(Modules.Cookie.get("msp_loyalty_points")).replace(/\D/g, "") || 0;
    // Logged in and hideLoyaltyOnBoarded
    if ((msp_login == "1" || partial_login) && Modules.Cookie.get("hideLoyaltyOnBoarded")) {
        coinText = '&#8377;<span class="js-lylty-pnts">' + loyaltyPoints + '</span>';
        coinSubText = 'in your account';
    } else { // All other cases do not show amount
        coinText = 'Upto 12%<br>Cashback';
        coinSubText = 'on every purchase';
    }

    var hdrCoinsLoggedIn = [
            '<div class="hdr__user" style="display: block">',
            '<div class="hdr__call-out' + (Modules.Cookie.get("hideLoyaltyOnBoarded") ? " hdr__call-out--lgd-in" : "") + ' js-lylty-hdr js-open-link" data-need-login="true" data-open-link="/loyalty/">',
            '<div class="hdr__call-out-ttl">' + coinText + '</div>',
            '<div class="hdr__call-out-sbttl">' + coinSubText + '</div>',
            '</div>',
            '</div>'
        ].join(''),
        hdrCoinsLoggedOut = [
            '<div class="hdr__user" style="display: block">',
            '<div class="hdr__user-lgn btn btn--s btn--no-bg js-lgn" data-page="login">Login</div>',
            '<div class="hdr__user-sign-up btn btn--s js-lgn" data-page="signup">Sign Up</div>',
            '<div class="hdr__call-out js-lylty-hdr js-open-link" data-open-link="/cashback/more-details/?utm_source=Loyalty-Header">',
            '<div class="hdr__call-out-ttl">' + coinText + '</div>',
            '<div class="hdr__call-out-sbttl">' + coinSubText + '</div>',
            '</div>',
            '</div>'
        ].join('');

    if (msp_login == "1") {
        while (loginCallbackQueue.length) {
            (loginCallbackQueue.shift())();
        }
        
        // [Start] Sidebar signup widget update 
        setCookie("partial_login", "", -1);
        $(".sdbr-login").length && sdbrWlcmPage.showCnfrmtn();
        $(".demo-login").length && extnsnWlcmPage.changeMessage();

        // [Start] changing contextual text and url of "many more exciting gifts" on how-it-works page
        if ($(".pnts-intro")[0]) {
            $(".js-grid__text--sign-up").removeClass("js-lgn js-popup-trgt").attr("href", "/loyalty/#tabOpen=redemption").removeAttr("data-href").text("View all >>");
        }
        // [End] changing contextual text and url of "many more exciting gifts" on how-it-works page

        // [End] Sidebar signup widget update

        $(".hdr__user").length && $(".hdr__user").replaceWith(hdrCoinsLoggedIn);
        $(".drpdwn-wdgt").length && $(".drpdwn-wdgt").addClass('loggedIn').removeClass('loggedOut');

        // If partial user is already login
        if ($(".user-dtls").length) {
            if ($(".user-dtls").html().indexOf("user-link") < 0) {
                $(".user-nm-wrpr").after(userLinks);
            }
        }

        $(".user-nm").length && $(".user-nm").text("Hi" + (msp_login_name ? ", " + msp_login_name : "") + "!");
        $(".user-email").length && $(".user-email").text(msp_login_email);
        $(".user-img").length && $(".user-img").addClass("user-img--loggedin");
        if (msp_user_image) {
            $(".user-img").length && $(".user-img").css("background-image", 'url(' + msp_user_image + ')');
        }
        $(".js-ftr-eml-wrpr").hide();
    } else if (partial_login) {
        if (new_user == "true") {
            isUserPasswordExist(msp_login_email).done(function(response) {
                if (response.auth.result.msg == "password_set") {
                    setCookie("new_user", "", -1);
                }
            });
        }

        $(".hdr__user").length && $(".hdr__user").replaceWith(hdrCoinsLoggedIn);
        $(".drpdwn-wdgt").length && $(".drpdwn-wdgt").addClass('loggedIn').removeClass('loggedOut');
        $('.js-prtl-lgn')[0] ? $('.js-prtl-lgn').remove() : '';
        $(".user-nm-wrpr").length && $(".user-nm-wrpr").after(partialLoginUserLinks).attr("data-need-login", "true");
        $(".user-nm").length && $(".user-nm").text("Hi" + (msp_login_name ? ", " + msp_login_name : "") + "!").attr("data-need-login", "true");
        $(".user-email").length && $(".user-email").text(msp_login_email).attr("data-need-login", "true");
        $(".js-ftr-eml-wrpr").show();
    } else {
        // [Start] Sidebar signup widget hide or show
        $(".sdbr-login").length && sdbrWlcmPage.hideCnfrmtn();
        $(".demo-login").length && extnsnWlcmPage.changeMessage();
        // [End] Sidebar signup widget hide or show

        $(".hdr__user").length && $(".hdr__user").replaceWith(hdrCoinsLoggedOut);
        $(".drpdwn-wdgt").length && $(".drpdwn-wdgt").removeClass('loggedIn');
        $(".user-link").length && $(".user-link").remove();
        $(".user-img").length && $(".user-img").css("background-image", '').removeClass("user-img--loggedin");
        $(".js-ftr-eml-wrpr").show();
    }

    setTimeout(function() {
        $('.hdr__call-out').not('.hdr__call-out--lgd-in').addClass('slide-left');
    }, 2000);
}

Modules.$doc.on('mouseenter', '.drpdwn-wdgt', function() {
    if (!$(this).hasClass('loggedIn')) {
        $(".drpdwn-wdgt").addClass('loggedOut');
    }
});

function loginme(msg) {
    var responseInfo,
        wiz_uid = get_uid(),
        wiz_msg = '"' + msg + '"';

    var loyalty_cookie = Modules.Cookie.get('msp_loyalty');
    setCookie("msp_login", "1", 365);

    if (!loyalty_cookie) {  
        setCookie("msp_loyalty", "1", 365);
    }
    var msp_login = Modules.Cookie.get("msp_login");

    if (!(msg.auth.login_type == 'facebook' || msg.auth.login_type == 'gplus' || msg.auth.login_type == 'resetpass')) {
        setCookie("msp_login_uid", msg.auth.result.user_id, 365);
        setCookie("msp_login_name", msg.auth.result.user_name, 365);
    }
    setCookie("msp_login_email", msg.auth.result.email_id, 365);
    
    if(msg.loyalty){
        setCookie("msp_loyalty_points", msg.loyalty.result.msp_coins, 1);
        setCookie("hideLoyaltyOnBoarded", msg.loyalty.result.onboarded, 365);
    }
    update_ui();

    // Referral Logging.
    if ($(".body-wrpr").data("page-type") === 'refer') {
        window.ga && ga('send', 'event', 'Refer', 'ReferralLoginAction');
        setCookie('referralLoginReload', 1); // Cookie to prevent GA logging on reload.
        window.location.reload(); // Reload the page so that refID for referral page is created for email.
    }

    if (dataLayer[0].pagetype === "loyalty") {
        if (msg.loyalty.result.nonmsp_bonus_credited) { // If user haven't any account and eligible for nonmsp bonus
            setCookieMins("nonmsp_bonus_credited", msg.loyalty.result.nonmsp_bonus_credited, 20);
        }
        location.reload();
    } else if ((msg.auth.login_type === "signup" || msg.auth.login_type === "signup_loyalty" || msg.auth.login_type === "resetpass" || msg.auth.login_type === "facebook" || msg.auth.login_type === "gplus") && !loyalty_cookie) {
        if (msg.loyalty.nonmsp_bonus_credited) { // If user haven't any account and eligible for nonmsp bonus
            setCookieMins("nonmsp_bonus_credited", msg.loyalty.result.nonmsp_bonus_credited, 20);
        }
        if (Modules.Cookie.get("cb_instant")) {
            window.location.href = '/loyalty';
        } else if (Modules.Cookie.get("u99rs1deal")) {
            window.location.href = '/loyalty';
            deleteCookie('u99rs1deal');
        } else {
            if (!Modules.Cookie.get("chrome_extension_welcome") && !url.getAQueryParam('destUrl'))
                window.location.href = "/loyalty/#tabOpen=how_it_works";
        }
    }

    // Temporary - for signup&email capture flow on extension install:
    if (msg.auth.login_type === "login" && Modules.Cookie.get("cb_instant")) {
        window.location.href = '/loyalty';
    }
}

var FBloggedIn = false;

function loginme_by_fb(msg, img, name) {
    FBloggedIn = true;
    setCookie("msp_login_name", name, 365);
    setCookie("msp_user_image", img, 365);
    loginme(msg);
}

function logoutme() {
    setCookie("msp_login", "", -1);
    setCookie("partial_login", "", -1);
    setCookie("new_user", "", -1);
    setCookie("msp_login_name", "", -1);
    setCookie("msp_user_image", "", -1);
    setCookie("msp_loyalty_points", "", -1);
    setCookie("msp_tier", "", -1);
    setCookie("hideSupportPopup_loyalty", "", -1);
    setCookie("hideLoyaltyOnBoarded", "", -1);

    FBloggedIn = false;

    if (dataLayer[0].pagetype === "loyalty") {
        window.location.href = "/";
    } else if ($(".pnts-intro")[0]) {
        location.reload();
    }

    update_ui();
}

Modules.$doc.on("click", ".js-lylty-signup, .js-trck-sign-up", function() {
    if ($(this).hasClass("js-trck-sign-up-cb")) {
        window.ga && ga("send", "event", "Loyalty", "click", "PDP-signup", "cashback");
    }
    setCookieMins("signup-utm", $(this).data("utmsource") || "", 2);
});

// LOGIN FUNCTIONS END HERE

// Pre-fill email address from login cookie
$(document).on("focus", "input.prefill-email", function() {
    var $this = $(this);
    if (!$this.val() && Modules.Cookie.get("msp_login") == "1")
        $this.val(Modules.Cookie.get("msp_login_email"));
});
// Use it till new single page goes live


/* ******* User form input: Seems like a duplicate of earlier login & form validator functions ******* */

if (!window.userFormValidations) {
    var userFormValidations = {};
}
userFormValidations = (function() {
    var private = {
        shakeBtn: function(btn) {
            //defaults
            var settings = {
                'shakes': 2,
                'distance': 5,
                'duration': 200
            };
            $this = btn;
            // shake it
            for (var x = 1; x <= settings.shakes; x++) {
                $this.animate({ left: settings.distance * -1 }, (settings.duration / settings.shakes) / 4)
                    .animate({ left: settings.distance }, (settings.duration / settings.shakes) / 2)
                    .animate({ left: 0 }, (settings.duration / settings.shakes) / 4);
            }
        },
        showFieldValidation: function(inputField, isValid, errMsg) {
            if (!isValid) {
                if (!inputField.hasClass("hghlght-err-fld")) {
                    inputField.addClass("hghlght-err-fld").siblings(".js-vldtn-err").add(".lgn__err").slideDown();
                }
                // Signup/login PAGE (not popup): Fetch error div
                if ($('.lgn__err').length) {
                    $('.lgn__err').html(errMsg).slideDown();
                }
                typeof errMsg !== "undefined" && inputField.siblings(".usr-inputbox__error").text(errMsg);
            } else {
                if (inputField.hasClass("hghlght-err-fld")) {
                    inputField.removeClass("hghlght-err-fld").siblings(".usr-inputbox__error").add(".lgn__err").slideUp();
                }
            }
        },
        hasErrFields: function(form) {
            var errFields = form.find(".hghlght-err-fld");
            if (errFields.length) {
                private.shakeBtn(form.find("input[type='submit']"));
                errFields[0].focus();
                return true;
            } else
                return false;
        },
        redirectLoggedUser: function() {
            var cookieUrl = Modules.Cookie.get("previousUrl");
            deleteCookie("previousUrl");
            if (url.getAQueryParam('close') == "1" && window.opener) {
                    window.opener.postMessage("update_ui","*");
            }
            window.location = url.getAQueryParam('destUrl') || cookieUrl || "/";
        }
    };
    var public = {
        loginformValidator: function(e) {
            var $thisForm = $("#inputbox__login-form");

            function checkValidations() {
                var emailField = $('#login-form__email'),
                    pwdField = $('#login-form__pwd');

                // Form validation
                var formData = [{
                        "type": "email",
                        "inputField": emailField,
                        "errorNode": emailField.siblings(".js-vldtn-err").add(".lgn__err"),
                        "errorMsg": "Please enter a valid email address"
                    },
                    {
                        "type": "required",
                        "inputField": pwdField,
                        "errorNode": pwdField.siblings(".js-vldtn-err").add(".lgn__err"),
                        "errorMsg": "Please enter a valid password"
                    }
                ];

                MSP.utils.validate.form(formData).done(function() {
                    var loginemail_value = emailField.val(),
                        loginpassword_value = pwdField.val();

                    $('.pop-up__cntnr .ldr__ovrly').show();

                    $.ajax({
                        type: "POST",
                        url: "/users/login_common.php", // "/users/usermanage.php"
                        dataType: 'json',
                        data: {
                            process: 'login',
                            email: encodeURIComponent(loginemail_value),
                            password: loginpassword_value,
                            source: 'desktop',
                            login_type: 'login'
                        },
                        async: false
                    }).done(function(msg) {
                        if (msg === "error" || msg.auth.result.msg === "Incorrect password") {
                            e.preventDefault();
                            // If logged in from popup
                            if ($('.pop-up__cntnr').length) {
                                var $loginBox = $(".usr-inputbox"),
                                    errBlock = $("div.usr-inputbox__error");
                                errBlock.length && errBlock.remove();
                                $('.pop-up__cntnr').not('.hide').find(".usr-inputbox__inr").prepend("<div class='usr-inputbox__error usr-inputbox__error--in-popup'>The email and password you entered did not match our records. Please double-check and try again.</div>").slideDown('slow');
                            } else {
                                // If logged in from login page (/users/login.php)
                                var $pageErrorBox = $('.lgn__err');
                                $pageErrorBox
                                    .text("Email and password did not match.")
                                    .slideDown();
                                    logLoginPageEvents("login-error", "Email and password did not match.");
                            }

                            $("body").animate({ "scrollTop": 0 }, 500);
                            return false;
                        } else if (msg.auth.result.msg === "No account exists with this email_id") {
                            e.preventDefault();
                            // If logged in from popup
                            if ($('.pop-up__cntnr').length) {
                                var $loginBox = $(".usr-inputbox"),
                                    errBlock = $("div.usr-inputbox__error");
                                errBlock.length && errBlock.remove();
                                $('.pop-up__cntnr').not('.hide').find(".usr-inputbox__inr").prepend("<div class='usr-inputbox__error usr-inputbox__error--in-popup'>There is no account with your email id. Please signup and try again. </div>").slideDown('slow');
                            } else {
                                // If logged in from popup
                                var $pageErrorBox = $('.lgn__err'),
                                    signupURL = "signup.php"+location.search;
                                $pageErrorBox
                                    .html("Not Registered. Please <a href='"+signupURL+"'>Sign up</a>.")
                                    .slideDown();
                                logLoginPageEvents("login-error", "Not Registered.");
                            }

                            $("body").animate({ "scrollTop": 0 }, 500);
                            return false;
                        } else { // Success clause: Login done!
                            // If popup login:
                            if ($('.pop-up__cntnr').length) { $('.usr-inputbox__error').slideUp('slow'); }
                            if ($('.lgn__err').length) { $('.lgn__err').slideUp('slow'); }

                            loginme(msg); // login and ui update

                            if (!$('.pop-up__cntnr').length) {
                                // Not popup
                                logLoginPageEvents("login-success", "MSP Login.");
                                var rdrctUrl = url.getAQueryParam('destUrl') || Modules.Cookie.get("previousUrl") || "/";
                                rdrctUrl = (url.getAQueryParam('destUrl') && url.getAQueryParam('utm_source') && url.getAQueryParam('utm_source')!="bonusapp") ? rdrctUrl + "?utm_source=" + url.getAQueryParam('utm_source') : rdrctUrl;
                                window.location.href = rdrctUrl; // Both utm_source & destUrl must be set for redirect.
                                deleteCookie("previousUrl");
                                return false;
                            } else {
                                closePopup_RUI();
                                e.preventDefault();
                                return false;
                            }
                        }
                    });
                }).fail(function() {
                    e.preventDefault();
                    if (!$('.pop-up__cntnr').length) {
                        logLoginPageEvents("validation-error", "Invalid email/password format.");
                    }
                    return false;
                }).always(function() {
                    $('.pop-up__cntnr .ldr__ovrly').hide();
                });
            }
            if (private.hasErrFields($thisForm)) {
                e.preventDefault();
                return false;
            } else {
                checkValidations();
            }
        },
        signupformValidator: function(e) {
            var $thisForm = $("#inputbox__signup-form");

            function checkValidations() {
                var emailField = $('#signup-form__email'),
                    pwdField = $('#signup-form__pwd');

                // Form validtion
                var formData = [{ "type": "email", "inputField": emailField, "errorNode": emailField.siblings(".js-vldtn-err").add(".lgn__err"), "errorMsg": "Please enter a valid email address" },
                    { "type": "required", "inputField": pwdField, "errorNode": pwdField.siblings(".js-vldtn-err").add(".lgn__err"), "errorMsg": "Please enter a valid password" }
                ];

                $('.pop-up__cntnr .ldr__ovrly').show();


                MSP.utils.validate.form(formData).done(function() {
                    var signupemail_value = emailField.val(),
                        name_value = $('#signup-form__name').val(),
                        signuppassword_value = pwdField.val(),
                        signup_utm = Modules.Cookie.get("signup-utm") || ((window.qS && url.getAQueryParam('fromEducationPopup')) ? "education_popup" : url.getAQueryParam('utm_source') || url.getAQueryParam('ref')),
                        signup_token = url.getAQueryParam('utm_source') == "chrome_extension_notif_nontrans_loyal" ? url.getAQueryParam('signup_token') : "";

                    $.ajax({
                        type: "POST",
                        url: "/users/login_common.php", //"/users/usermanage.php",
                        dataType: 'json',
                        async: false,
                        data: {
                            process: 'signup',
                            email: encodeURIComponent(signupemail_value),
                            password: signuppassword_value,
                            subscribed_status: 'subscribed',
                            name: name_value,
                            utm_source: signup_utm,
                            source: 'desktop',
                            login_type: 'signup',
                            signup_token: signup_token
                        },
                        async: false
                    }).done(function(msg) {

                        if (typeof msg !== 'string' && msg.auth.result.msg === 'Account already exists with this email_id') {
                            e.preventDefault();

                            if ($('.pop-up__cntnr').length) {
                                // If popup:
                                var $loginBox = $(".usr-inputbox"),
                                    errBlock = $("div.usr-inputbox__error");
                                errBlock.length && errBlock.remove();
                                $('.pop-up__cntnr').not('.hide').find(".usr-inputbox__inr").prepend("<div class='usr-inputbox__error usr-inputbox__error--in-popup'>This email address is already registered.</div>").slideDown('slow');
                            } else {
                                // If signed up from sign up page (/users/signup.php)
                                var $pageErrorBox = $('.lgn__err'),
                                    loginURL = "login.php"+location.search;

                                $pageErrorBox
                                    .html("Already Registered. <a href='"+loginURL+"'>Login</a> or <span class=\"text-link js-popup-trgt\" data-href=\"fp.htm\">Reset Your Password</span>.")
                                    .slideDown();
                                logLoginPageEvents("signup-error", "Already Registered.");
                            }
                            if (Modules.Cookie.get('u99rs1deal')) {
                                alert('Unable to login. Please check credentials'); // Alert to bring back focus to current tab (Not GTS tab)
                            }
                            $("body").animate({ "scrollTop": 0 }, 500);
                            return false;
                        } else if (msg === "error") {
                            e.preventDefault();

                            if ($('.pop-up__cntnr').length) {
                                var $loginBox = $(".usr-inputbox"),
                                    errBlock = $("div.usr-inputbox__error");
                                errBlock.length && errBlock.remove();
                                $('.pop-up__cntnr').not('.hide').find(".usr-inputbox__inr").prepend("<div class='usr-inputbox__error usr-inputbox__error--in-popup'>There is some error in signup. Please try after sometime.</div>").slideDown('slow');
                            } else {
                                // If signed up from sign up page (/users/signup.php)
                                var $pageErrorBox = $('.lgn__err');
                                $pageErrorBox
                                    .text("Error occurred. Please try after sometime.")
                                    .slideDown();
                                logLoginPageEvents("signup-error", "Error occurred. Please try after sometime.");
                            }

                            $("body").animate({ "scrollTop": 0 }, 500);
                            return false;
                        } else {
                            if (msg.auth.result.msg == 'true') { // Success clause: signup done!
                                // If popup login:
                                if ($('.pop-up__cntnr').length) { $('.usr-inputbox__error').slideUp('slow'); }
                                if ($('.lgn__err').length) { $('.lgn__err').slideUp('slow'); }

                                loginme(msg); // login and ui update

                                deleteCookie("signup-utm");

                                if (!$('.pop-up__cntnr').length) {
                                    // Not popup
                                    logLoginPageEvents("signup-success", "success");
                                    var rdrctUrl = url.getAQueryParam('destUrl') || Modules.Cookie.get("previousUrl") || "/";
                                    rdrctUrl = (url.getAQueryParam('destUrl') && url.getAQueryParam('utm_source') && url.getAQueryParam('utm_source')!="bonusapp") ? rdrctUrl + "?utm_source=" + url.getAQueryParam('utm_source') : rdrctUrl;
                                    window.location.href = rdrctUrl; // Both utm_source & destUrl must be set for redirect.
                                    deleteCookie("previousUrl");
                                    return false;
                                } else {
                                    closePopup_RUI();
                                    e.preventDefault();
                                    return false;
                                }
                            } else {
                                formData[0].errorNode.html(msg.auth.result.msg);
                                formData[0].errorNode.show();
                            }
                        }
                    });

                }).fail(function() {
                    e.preventDefault();
                    if (!$('.pop-up__cntnr').length) {
                        logLoginPageEvents("validation-error", "Invalid email/password format.");
                    }
                    return false;
                }).always(function() {
                    $('.pop-up__cntnr .ldr__ovrly').hide();
                    //closePopup_RUI();
                });
            }

            if (private.hasErrFields($thisForm)) {
                e.preventDefault();
                return false;
            } else {
                checkValidations();
            }
        },
        forgotformValidator: function(e) {
            e.preventDefault();
            var $thisForm = $("#inputbox__forgot-form");

            function checkValidations() {
                var emailField = $('#forgot-form__email');

                // Form validtion
                var formData = [{ "type": "email", "inputField": emailField, "errorNode": emailField.siblings(".js-vldtn-err"), "errorMsg": "Please enter a valid email address" }];
                MSP.utils.validate.form(formData).done(function() {
                    var fpemail_value = emailField.val();
                    $.ajax({
                        type: "POST",
                        dataType: 'json',
                        url: "/users/login_common.php", //"/users/usermanage.php",
                        data: {
                            process: 'forgotpassword',
                            email: encodeURIComponent(fpemail_value),
                            login_type: 'forget_password'
                        }
                    }).done(function(msg) {
                        $(".usr-inputbox__inr").children().remove().end().append('<div class="usr-inputbox__cnfrmtn">The email for resetting the password has been sent to you. Please check your email.</div>');
                    })
                }).fail(function() {
                    e.preventDefault();
                    return false;
                });
            }
            if (private.hasErrFields($thisForm)) {
                e.preventDefault();
                return false;
            } else
                checkValidations();
        },
        resetformValidator: function(e) {
            e.preventDefault();
            var $thisForm = $("#inputbox__resetpass-form");

            function checkValidations() {
                var pwdField = $("#resetpass-form__pwd"),
                    cnfrmPwdField = $("#resetpass-form__pwd-cnfrm");
                // Form validtion
                var formData = [{ "type": "required", "inputField": pwdField, "errorNode": pwdField.siblings(".js-vldtn-err"), "errorMsg": "Please enter a valid password" },
                    { "type": "required", "inputField": cnfrmPwdField, "errorNode": cnfrmPwdField.siblings(".js-vldtn-err"), "errorMsg": "Please enter a valid password" }
                ];
                MSP.utils.validate.form(formData).done(function() {
                    var resetpassword_value = pwdField.val();

                    if (resetpassword_value === cnfrmPwdField.val()) {
                        var qS = url.hashParams,
                            resetemail_value = url.getAQueryParam('email'),
                            userHash = url.getAQueryParam('user');

                        $.ajax({
                            type: "POST",
                            url: "/users/login_common.php", //"/users/usermanage.php",
                            dataType: "json",
                            data: {
                                process: 'resetpass',
                                email: encodeURIComponent(resetemail_value),
                                password: resetpassword_value,
                                login_type: 'resetpass',
                                source: 'desktop',
                                user: userHash
                            }
                        }).done(function(msg) {
                            if (msg == 'error')
                                alert('error');
                            else {
                                loginme(msg); // 2 ajax get_msp_coins, 
                                $(".usr-inputbox__form").hide();
                                $(".usr-inputbox__inr").append('<div class="usr-inputbox__cnfrmtn">Your password has been changed, You will be redirected to home page in 3 seconds.</div>');
                                setTimeout(function() { window.location = "/loyalty/#tabOpen=how_it_works" }, 3000);
                            }
                        });

                    }

                });

            }
            (!private.hasErrFields($thisForm) && checkValidations());
            return false;
        },
        eventHandlers: function() {

            /* specific to login page & signup page */
            if ($(".algn-wrpr--form-athntctn").length) {
                if (Modules.Cookie.get("msp_login")) {
                    var cookieUrl = Modules.Cookie.get("previousUrl");
                    deleteCookie("previousUrl");
                    if (url.getAQueryParam('close') == "1" && window.opener) {
                        window.opener.postMessage("update_ui","*");
                    }
                    window.location = url.getAQueryParam('destUrl') || cookieUrl || "/";
                }

                $(".algn-wrpr--form-athntctn .usr-inputbox__form input:eq(0)").focus();
                loginCallbackQueue.push(private.redirectLoggedUser);
            }
            $(".login-form__email, .signup-form__email, .forgot-form__email").on("change", function() {
                $(this).blur(function() {
                    var field = $(this);
                    isValid = Modules.Validator.email(field.val()),
                        private.showFieldValidation(field, isValid, "Please enter a valid email address");
                });
            })
            $(".login-form__pwd").on("change", function() {
                $(this).blur(function() {
                    var field = $(this);
                    isValid = Modules.Validator.required(field.val()),
                        private.showFieldValidation(field, isValid, "Please enter a valid password");
                });
            })
            $(".signup-form__pwd,.resetpass-form__pwd").on("change", function() {
                $(this).blur(function() {
                    var field = $(this),
                        errMsg = "",
                        isValid = false,
                        fieldVal = field.val();

                    if (!(isValid = Modules.Validator.required(fieldVal))) {
                        errMsg = "Please enter a valid password";
                    } else if (!(isValid = Modules.Validator.required(fieldVal, { "min": 6 }))) {
                        errMsg = "Password should be minimum of 6 characters";
                    }
                    private.showFieldValidation(field, isValid, errMsg);
                });
            })
            $(".resetpass-form__pwd-cnfrm").on("change", function() {
                $(this).blur(function() {
                    var field = $(this),
                        isValid = field.val() === $(".resetpass-form__pwd").val();
                    private.showFieldValidation(field, isValid, "Passwords does not match");
                });
            })

            $(".lgn__form").on("submit", function(e) {
                var $form = $(this),
                    $error = $(".lgn__err"),
                    $email = $form.find(".lgn__fld--eml .lgn__inpt"),
                    $password = $form.find(".lgn__fld--pswd .lgn__inpt");
                if (!Modules.Validator.email($email.val())) {
                    $error.text("Please enter a valid email address.").slideDown();
                } else if ($password.val().length < 6) {
                    $error.text("Please enter a valid password.").slideDown();
                } else {
                    // TODO
                }
                return false;
            });
            $(".lgn__btn--eml").on("click", function() {
                var $this = $(this);
                $this.fadeOut("fast", function () {
                    $this.siblings(".lgn__form").fadeIn("fast", function () {
                        $(".js-signup__email").focus();
                    });
                });
                logLoginPageEvents("email-button", "Clicked.");
            });
            $(".lgn__btn--ggl").on("click", function() {
                MSP.login.gplus();
            });
            $(".lgn__btn--fcbk").on("click", function() {
                MSP.login.facebook();
            });
            $("#login-form__submit").on("click", function(e) {
                userFormValidations.loginformValidator(e);
            });
            $("#signup-form__submit").on("click", function(e) {
                userFormValidations.signupformValidator(e);
            });
            $("#forgot-form__submit").on("click", function(e) {
                userFormValidations.forgotformValidator(e);
            });
            $("#resetpass-form__submit").on("click", function(e) {
                userFormValidations.resetformValidator(e);
            });
        }
    }
    return public;
})();

MSP.login = {
    fb_init: function() {
        window.fbAsyncInit = function() {
            FB.init({
                //appId      : '516534571724606',//mspdvid:'327375840708379', // App ID
                appId: '253242341485828',
                channelUrl: '/users/fbchannel.html', // Channel File
                status: true, // check login status
                cookie: true, // enable cookies to allow the server to access the session
                xfbml: true,
                version: 'v2.9' // parse XFBML
            });
        };

        // Load the SDK Asynchronously
        (function(d) {
            var js, id = 'facebook-jssdk',
                ref = d.getElementsByTagName('script')[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/en_US/all.js";
            ref.parentNode.insertBefore(js, ref);
        }(document));

    },
    extensionWelcome: function() {
        setCookie("chrome_extension_welcome", "1", 1);
        MSP.login.facebook();
    },
    showRedirectLoader: function() {
        var loaderHTML = [
            '<div class="sctn--ldng">',
            '<div class="ldr"><div class="ldr__crcl"></div><div class="ldr__text" style="">Redirecting...</div></div>',
            '</div>'
        ].join('');
        $('.sctn--lgn').append(loaderHTML);
    },
    removeRedirectLoader: function() {
        $('.sctn--ldng').length && $('.sctn--ldng').remove();
    },
    facebook: function() {
        fb_login();


        function check_fb_login() {
            var email = '';
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    update_f_data_login(response);
                    $(".userinfo img:first-child").attr('src', 'http://graph.facebook.com/' + response.authResponse.userID + '/picture');
                }
            });
        }

        function fb_login() {
            debugger
            if (!FBloggedIn) {
                var email = '';
                $('.pop-up__cntnr .ldr__ovrly').show();
                FB.login(function(response) {
                    if (response.authResponse) {
                        email = update_f_data_login(response);
                    }
                }, { scope: "email, user_birthday, user_likes, user_location, publish_actions" });
            }
        }

        function update_f_data_login(info) {
            var email = '';
            FB.api('/me', 'GET', {
                    "fields": "id, name, email, first_name, last_name, picture"
                },
                function(data) {
                    MSP.login.showRedirectLoader();
                    email = data.email;
                    if (!data.first_name) {
                        data.first_name = email.split('@')[0];
                    }
                    data['access_token'] = info.authResponse.accessToken;
                    data.email = encodeURIComponent(data.email);
                    if (!email) {
                        $(".pop-up__sgnp").removeClass("hide");
                        $(".pop-up__lgn").addClass("hide");
                        $(".pop-up__sgnp .usr-inputbox__msg").show();
                        $(".pop-up__sgnp .usr-inputbox__orline").hide();
                        $(".pop-up__sgnp .usr-inputbox__social").hide();
                        return false;
                    }
                    $.ajax({
                        url: '/users/login_common.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            fb: data,
                            login_type: 'facebook',
                            source: 'desktop',
                            email: encodeURIComponent(email)
                        }
                    }).done(function(response) {
                        loginme_by_fb(response, data.picture.data.url, data.first_name);
                        if ($('.pop-up__cntnr').length) {
                            closePopup_RUI();
                        } else if ($('.scl__qna-popup').length) {
                            qnaSocialLogin();
                            $('.js-sbmt-answr').trigger('click');
                        } else {
                            logLoginPageEvents("fb-success", "success");
                            closePopup();
                        }
                    }).fail(function() {
                        logLoginPageEvents("fb-error", "error");
                        MSP.login.removeRedirectLoader();
                    });
                });
            email && captureEmail(email);
            return email;
        }
    },

    gplus: function() {
        var config = {
            'client_id': '697312397493-f0hdl2qr52fqfphvm8ihg01e17f5tfcr.apps.googleusercontent.com',
            'scope': 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
        };
        gapi.auth.authorize(config, function() {
            fetch(gapi.auth.getToken());
        });

        function fetch(token) {
            var profile = {};
            $('.pop-up__cntnr .ldr__ovrly').show();
            $.ajax({
                url: "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + token.access_token + "&alt=json",
            }).done(function(response) {
                MSP.login.showRedirectLoader();
                profile = response;
                $.ajax({
                    url: '/users/login_common.php', //'/users/gplus_submit.php',
                    type: 'POST',
                    dataType: 'json',
                    data: { 'gplus': profile, login_type: 'gplus', source: 'desktop', email: profile.email, access_token: token.access_token }
                }).done(function(response) {
                    loginme_by_fb(response, profile.picture, profile.given_name);
                    $('.pop-up__cntnr .ldr__ovrly').hide();
                    if ($('.pop-up__cntnr').length) {
                        closePopup_RUI();
                    } else if ($('.scl__qna-popup').length) {
                        qnaSocialLogin();
                        $('.js-sbmt-answr').trigger('click');
                    } else {
                        logLoginPageEvents("ggl-success", "success");
                        closePopup();
                    }
                }).fail(function() {
                    logLoginPageEvents("ggl-error", "error");
                    MSP.login.removeRedirectLoader();
                });
            });
        }
    }
}

function logLoginPageEvents(action, label) {
    window.ga && ga('send', 'event', 'DesktopLoginPage', action, label);
}

//Event Hadler for Logout
Modules.$doc.on("click", ".js-user-lgt", function() {
    logoutme();
});
// Login UI update on page load. Will be shifted to msp.js when login is unified with Fashion.
// true indicates this is called on ready
update_ui();

if ($(".sctn--lgn, .usr-inputbox").length) {
    userFormValidations.eventHandlers();
}

var currentPage = window.location.href;
if ((currentPage.indexOf("users/signup.php") > -1 || currentPage.indexOf("users/login.php")) && url.getAQueryParam('source') == "refer") {

    //Contextual message for singup and login pages
    var $_msg = '<div class="cntxt-info js-cntxt-info">Signup is Required to access Referral Cashback</div>';

    $(".algn-wrpr--form-athntctn").prepend($_msg);
    $(".algn-wrpr--form-athntctn").css("margin-top", "30px");
}
var sdbrWlcmPage = {};
if ($(".sdbr-login").length) {

    sdbrWlcmPage = {
        cnfrmtnMsg: "<div class='sdbr-login__icon'></div><p>You are part of our Cashback Program</p>",
        showCnfrmtn: function() {
            $(".sdbr-login__dtls,.js-pwd-tgglbtn").hide();
            $(".sdbr-login__cnfrmtn").show();
            $(".sdbr-login__msg").html(this.cnfrmtnMsg);
            $("#lylty-signup__email,#sdbr-signup__password").val("");
            $(".sdbr-login div.error").hide().html("");
        },

        hideCnfrmtn: function() {
            if ($(".sdbr-login").length) {
                $(".sdbr-login__dtls").show();
                $(".sdbr-login__cnfrmtn").hide();
            }
        },
        signupLoyaltyformValidator: function() {
            var $email = $('#sdbr-signup__email'),
                $password = $('#sdbr-signup__password'),
                $errorNode = $(".sdbr-login div.error");
            MSP.utils.validate.form([{
                "type": "email",
                "inputField": $email,
                "errorNode": $errorNode,
                "errorMsg": "Please enter a valid email"
            }, {
                "type": "required",
                "inputField": $password,
                "errorNode": $errorNode,
                "options": { "min": 6 },
                "errorMsg": "Please enter a valid password"
            }]).done(function() {
                var loylaty_utm_source = url.getAQueryParam('utm_source') ? url.getAQueryParam('utm_source') : utmsource;
                if ($(".js-chrm-wlcm").length || $(".wlcm-hdr").length) {
                    loylaty_utm_source = "chrome welcome";
                }

                $.ajax({
                    type: "POST",
                    url: "/users/login_common.php", //"/users/usermanage.php"
                    dataType: "JSON",
                    async: false,
                    data: {
                        process: 'signup',
                        email: encodeURIComponent($email.val()),
                        password: $password.val(),
                        subscribed_status: 'subscribed',
                        source: 'desktop',
                        login_type: 'signup_loyalty',
                        number: "",
                        utm_source: loylaty_utm_source
                    }
                }).done(function(msg) {
                    if (msg == "error" || msg.auth.result.msg == 'error') {
                        $errorNode.html("There is some error in signup. Please try after sometime");
                        if (Modules.Cookie.get('u99rs1deal')) {
                            alert('Unable to login. Please check credentials'); // Alert to bring back focus to current tab (Not GTS tab)
                        }
                    } else {
                        if (msg.auth.result.msg == 'true') {
                            loginme(msg);
                            closePopup();
                        } else {
                            $errorNode.html(msg.auth.result.msg + ". <a class='js-popup-trgt sdbr-login__link' data-href='/users/login.html'>Click here to login</a>");
                            $errorNode.show();
                        }
                    }
                    return false;
                });
            });
            return false;
        },
        eventHandlers: function() {
            $(".sdbr-signup__email").change(function() {
                $(".sdbr-signup__email").blur(function() {
                    $this = $(this);
                    if (Modules.Validator.email($this.val())) {
                        $this.removeClass("hghlght-err-fld");
                        !$(".sdbr-signup__form .hghlght-err-fld").length && $(".sdbr-signup__form div.error").text("");
                    } else {
                        $this.addClass("hghlght-err-fld");
                        $(".sdbr-signup__form div.error").text("Please enter a valid email");
                    }
                });
            });
            $('.sdbr-signup__password').on('change', function() {
                $('.sdbr-signup__password').on('blur', function() {
                    $this = $(this);
                    if (Modules.Validator.required($this.val())) {
                        $this.removeClass("hghlght-err-fld");
                        !$(".sdbr-signup__form .hghlght-err-fld").length && $(".sdbr-signup__form div.error").text("");
                    } else {
                        $this.addClass("hghlght-err-fld");
                        $(".sdbr-signup__form div.error").text("Please enter a password");
                    }
                });
            });
            $('.sdbr-signup__submit').click(function(e) {
                e.preventDefault();
                sdbrWlcmPage.signupLoyaltyformValidator();
            });
            $(".sdbr-signup__password").on("keydown", function() {
                if ($(this).val().length > 1)
                    $(".js-pwd-tgglbtn").show()
                else
                    $(".js-pwd-tgglbtn").hide()
            });
            $(".js-pwd-tgglbtn").on("click", function() {
                var $pwdField = $(".sdbr-signup__password"),
                    pwdField = $pwdField[0];
                if (pwdField.type === "password") {
                    pwdField.type = "text";
                    $(this).text("Hide").attr("title", "Hide Password");
                } else {
                    pwdField.type = "password";
                    $(this).text("Show").attr("title", "Show Password");
                }
            });
        },
        stickLogin: function() {
            var sdbrSignupTop = $(".js-sdbr-login-wrpr"),
                sdbrSignup = $(".js-sdbr-login"),
                sdbrSignupScrollPoint = sdbrSignupTop.offset().top + 5,
                $mainheaderHt = $('.main-hdr-wrpr').outerHeight(),
                $subheader = $('.sub-hdr'),

                scrlAmnt = Modules.$win.scrollTop() + $mainheaderHt;




            if (scrlAmnt >= sdbrSignupScrollPoint) {
                !sdbrSignup.hasClass("sticky") && sdbrSignup.addClass("sticky");
                $subheader.hide();
                // debugger;
                if (scrlAmnt + sdbrSignup.outerHeight() > $(".ftr").offset().top - 20) {
                    sdbrSignup.addClass("scroll");
                    // $(".sticky").removeProp("position").css("bottom", $(".ftr").offset().top - 20);
                } else if (scrlAmnt + sdbrSignup.outerHeight() > $(".ftr").offset().top - 150) {
                    // $(".sticky").removeProp("position").css("bottom", $(".ftr").offset().top - 20);
                    sdbrSignup.removeClass("scroll");
                }
            } else {
                sdbrSignup.removeClass("sticky");
                if (scrlAmnt < sdbrSignupScrollPoint - 40)
                    $subheader.show();
            }


        },

        init: function() {
            this.eventHandlers();
            Modules.$win.scroll(function() {
                sdbrWlcmPage.stickLogin();
            });
        }
    }
}

// Check again when single goes live
Modules.$doc.ready(function() {
    $(".sdbr-login").length && sdbrWlcmPage.init();
    $(".demo-login").length && extnsnWlcmPage.init();

});
function loyaltyCounter() {
    var count = numberWithoutCommas($(".js-lylty-cnt").html());
    var newCount = count + 1;

    var interval = setInterval(function() {

        $(".js-lylty-cnt").html(numberWithCommas(newCount));
        newCount++;

        if (newCount > count + 10) {
            clearInterval(interval);
        }
    }, 300);
}

var loyalty_counter = false;
if ($(".ftr__lylty").has(".js-lylty-cnt").length) {
    $(window).scroll(function() {
        var footer_offset = $(".ftr__lylty").offset().top,
            footer_height = $(".ftr__lylty").outerHeight(),
            window_height = $(window).height(),
            scrolled = $(this).scrollTop();
        if ($(".js-lylty-cnt").length > 0) {
            if ((scrolled + window_height) > (footer_offset + footer_height) && !loyalty_counter) {
                loyaltyCounter();
                loyalty_counter = true;
            }
        }
    });
}
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

; (function askQuestion() {		
   var subCat = $('.body-wrpr').data('category'),
        $listAskQuestion;		
    $('body').append([		
        '<div class="js-list-ask-qstn list-ask-qstn popup-target" data-href="/review/qna/popup/ask_a_question.php?source=desktop_list&subcategory=' + subCat + '">',		
                '<span class="list-ask-qstn__icon">',
                    '<span class="list-ask-qstn__qstn-mrk">&#63;</span>',
                '</span> Ask a question',		
        '</div>'].join('')		
    );
    $listAskQuestion = $('.js-list-ask-qstn');
    setTimeout(function() {
        $listAskQuestion.addClass('slide-up');
    }, 2000);
})();


;(function() {
    $.QueryString = (function(a) {
        if (a === "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split("=");
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split("&"));

    // Add a cookie if utm_source is available
    if ($.QueryString["utm_source"]) {
        setCookie("utm_source", $.QueryString["utm_source"], 2);
    }
}());

;(function() {
    if(!Modules.isInstalled('plugin_id')) {
        if($('.body-wrpr[data-category=computer-pendrive]').length === 1) {
            var _html = ['<div class="sctn chrme-acqstn" style="background: #fff url(//assets.mspcdn.net/msp-ui/icons/chrome-ext.png) no-repeat 12px center/32px;">',
                            '<div class="sctn__inr">',
                                '<b style="padding-left: 20px;">Chrome Exclusive</b>&nbsp; ',
                                'Install MySmartPrice Chrome Extension &amp; get 25% cashback on any purchase ',
                                '<button style="float: right;" class="btn btn--s btn--blue js-extension-popup">Get Offer</button>',
                            '</div>',
                        '</div>'].join('');
            $(_html).insertAfter('.list-hdr');
            
            window.ga && ga('send', 'event', 'Deals', 'list-page-show', 'js-log-list-page', { nonInteraction: true });
            
            $(document).on('click', '.js-extension-popup', function() {
                window.ga && ga('send', 'event', 'Deals', 'list-page-click', 'js-log-list-page', { nonInteraction: true });
                openPopup('/deals/popup/add-chrome-overlay.html');
            });
        }
    }
}());

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
(function setChromeAutoPopup() {
    var validUTMSources = ['pa-transact', 'ps-transact', 'browsing_pa_emailer', 'browsing_ps_emailer'];
    if (url.getAQueryParam && validUTMSources.indexOf(url.getAQueryParam('utm_source') !== -1)) {
        if (Modules.Browser.name === 'Chrome') {
            if(!Modules.isInstalled('plugin_id')) {
                window.ga && ga("send", "event", "autopopup", "pricedrop", "pdp-pageview", { nonInteraction: true });
                $('body').attr('data-autopopup', '/promotions/install-extn-auto-popup.php');
            }
        }
    }
}());

// Make extension install compulsory if particular utm_source for the same is set:
(function() {
    if(!Modules.isInstalled('plugin_id')) {
        var validFBTag = url.getAQueryParam('utm_source') === 'FB-DRT-MSP-25CB' || url.getAQueryParam('utm_source') === 'FB-DRT-MSP' || (url.getAQueryParam('utm_source') && url.getAQueryParam('utm_source').indexOf('acebook') !== -1);
        if(validFBTag && Modules.Browser.name === 'Chrome') {
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
    }
})();

(function() {
    $('.page-nvgtn--PDP').on('click', '.page-nvgtn__item', function() {
        window.ga && ga('send', 'event', 'Comparables', 'pdp-nav-click', $(this).data('href'));
    });
})();


(function postInstallMailLink() {
    if(url.getAQueryParam('utm_source') === 'mail_gtsinstall') {
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
/**
 * jQuery mCycle v0.1
 * Carousel Plugin Script Begins Here
 */
;
(function($, window, document, undefined) {

    "use strict";

    // Defaults are below
    var defaults = {
        mCycleItem: 'img', // the item which will be slided
        animTime: 200, // time taken in animation in milliseconds
        waitTime: 10000, // time for a slide to wait in milliseconds
        isAutoPlay: false, //  isAutoPlay can be false for manual control
        direction: 'left', // direction can be 'left' of 'right'
        slideBullets: true, //show the slide bullets
        height: 'auto' //height of the mCycleCont (slide show container)
    };

    // The actual plugin constructor
    function mCycle(element, options) {
        this.element = element;

        // extending defaults with user options
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = "mCycle";
        this._autoPlayQueued = false;
        this._animating = false;
        this.forcedNextSlide = -1;
        this.init(true);

    }

    // Get the next slide for the animation in the given direction
    function getNextSlide($currentSlide, direction) {
        var $nextSlide;
        switch (direction) {
            case "left":
                $nextSlide = $currentSlide.next('.mCycleItemWrapper');
                break;
            case "right":
                $nextSlide = $currentSlide.prev('.mCycleItemWrapper');
                break;
        }

        if ($nextSlide.length) return $nextSlide;

        switch (direction) {
            case "left":
                $nextSlide = $currentSlide.parent().find('.mCycleItemWrapper').first();
                break;
            case "right":
                $nextSlide = $currentSlide.parent().find('.mCycleItemWrapper').last();
                break;
        }

        return $nextSlide;
    }


    mCycle.prototype = {

        init: function(firstTime) {
            if (!firstTime) return;

            var $elem = $(this.element),
                mCycleItemCount = $elem.find(this.options.mCycleItem).length,
                elemHeight = 0;

            $elem.addClass('mCycleCont').find(this.options.mCycleItem).each(function(index) {
                var $mCycleItem = $(this);
                $mCycleItem.addClass('show mCycleItemWrapper').attr("data-count", index + 1);

                elemHeight = Math.max($mCycleItem.height(), elemHeight);


            });

            $elem.show();

            if (parseInt($elem.height(), 10) === 0 && this.options.height === 'auto') {
                $elem.height(elemHeight);
            } else if (this.options.height !== 'auto') {
                $elem.height(this.options.height);
            }


            $elem.find('.mCycleItemWrapper').eq(0).addClass('mCycleItemCurrent');

            if (this.options.slideBullets) {
                $elem.append('<div class="mCycleSlideBullets"></div>');
                var mCycleSlideBulletCount = mCycleItemCount;
                while (mCycleSlideBulletCount--) {
                    $elem.find('.mCycleSlideBullets').append('<div class="mCycleSlideBullet"></div>');
                }
                $elem.find('.mCycleSlideBullet').eq(0).addClass('active');
            }

            if (this.options.isAutoPlay && mCycleItemCount > 1) { // start sliding if it is autoplay 
                var that = this;

                that._autoPlayQueued = true;

                setTimeout((function() {
                    that._autoPlayQueued = false;
                    if (that.options.isAutoPlay) that.slide();
                }), that.options.waitTime);

            }
        },

        play: function() {
            if (this.options.isAutoPlay) return;
            this.options.isAutoPlay = true;
            this.slide();
        },

        pause: function() {
            this.options.isAutoPlay = false;
        },

        reverse: function() {
            this.options.direction = (this.options.direction === 'left') ? 'right' : 'left';
        },
        slideLeft: function() {
            this.slide('left');
        },
        slideRight: function() {
            this.slide('right');
        },
        slideTo: function(index) {
            var $slides = $(this.element),
                currentIndex = $slides.index($(this.element).hasClass("mCycleItemCurrent")),
                direction = (index > currentIndex) ? 'left' : 'right',
                isAutoPlay = this.options.isAutoPlay,
                that = this;
            this.pause();
            this.forcedNextSlide = index;
            $slides.eq(index).addClass("mCycleItemNext");
            setTimeout(function() {
                that.slide(direction);
                that.forcedNextSlide = -1;
                setTimeout(function() {
                    if (isAutoPlay) {
                        that.play();
                    }
                }, that.options.animTime + that.options.waitTime + 10);
            }, that.options.animTime + 10);
        },
        slide: function(direction) {

            if (this.options.isAutoPlay && this._autoPlayQueued || this._animating) return; // to stop multiple instance of slide when on autoplay

            direction = direction || this.options.direction;

            var $currentSlide = $(this.element).find('.mCycleItemCurrent'),
                $slides = $(this.element).find(".mCycleItemWrapper"),
                isForcedSlide = (this.forcedNextSlide === -1),
                $nextSlide = isForcedSlide ? getNextSlide($currentSlide, direction) : $slides.eq(this.forcedNextSlide),
                prevSlideLeftOffset,
                nextSlideClass;
            switch (direction) {
                case 'left':
                    nextSlideClass = 'mCycleItemNext';
                    prevSlideLeftOffset = '-100%';
                    break;
                case 'right':
                    nextSlideClass = 'mCycleItemPrev';
                    prevSlideLeftOffset = '100%';
                    break;
            }

            if ($nextSlide.hasClass('mCycleItemCurrent')) return; // if current slide is same as next slide


            $nextSlide.addClass(nextSlideClass);

            var that = this;

            this._animating = true;

            var reflow = $("body").offset().top;

            // making current slide the prev slide
            $currentSlide.css({
                '-webkit-transition': 'transform' + (that.options.animTime) / 1000 + 's',
                'transition': 'transform ' + (that.options.animTime) / 1000 + 's',
                '-webkit-transform': 'translateX(' + prevSlideLeftOffset + ')',
                '-ms-transform': 'translateX(' + prevSlideLeftOffset + ')',
                'transform': 'translateX(' + prevSlideLeftOffset + ')'
            });

            // making next slide the current slide
            $nextSlide.css({
                '-webkit-transition': 'transform ' + (that.options.animTime) / 1000 + 's',
                'transition': 'transform ' + (that.options.animTime) / 1000 + 's',
                '-webkit-transform': 'translateX(0)',
                '-ms-transform': 'translateX(0)',
                'transform': 'translateX(0)'
            });

            //IE Fix
            if (Modules.Browser.name === "MSIE" && Modules.Browser.version < 9) {
                $currentSlide.css({
                    'left': prevSlideLeftOffset
                });
                $nextSlide.css({
                    'left': '0'
                });
            }

            setTimeout(function() {
                var $elem = $(that.element);

                $currentSlide.removeClass('mCycleItemCurrent').removeAttr('style');
                $nextSlide.toggleClass(nextSlideClass + ' mCycleItemCurrent').removeAttr('style');

                //IE Fix
                if (Modules.Browser.name === "MSIE" && Modules.Browser.version < 9) {
                    $currentSlide.removeClass('mCycleItemCurrentIE').removeAttr('style');
                    $nextSlide.toggleClass(nextSlideClass + ' mCycleItemCurrentIE').removeAttr('style');
                }

                if (that.options.slideBullets) {
                    var count = $elem.find('.mCycleItemCurrent').data('count');

                    $elem.find('.mCycleSlideBullet.active').removeClass('active');
                    $elem.find('.mCycleSlideBullet').eq(count - 1).addClass('active');
                }

                that._animating = false;
                if (that.options.isAutoPlay) {
                    that._autoPlayQueued = true; // auto call for slide is queued if on autoplay
                    setTimeout((function() {
                        if (that.options.isAutoPlay && that._autoPlayQueued) {
                            that._autoPlayQueued = false;
                            that.slide();
                        } else {
                            that.options.isAutoPlay = false;
                            that._autoPlayQueued = false;
                        }
                    }), that.options.waitTime);
                }

            }, that.options.animTime + 10); //adding 10ms to make sure animation is complete
        }
    };

    $.fn["mCycle"] = function(options) {
        var params = Array.prototype.splice.call(arguments, 1, 1);
        return this.each(function() {
            if (!$.data(this, "mCycle")) {
                // preventing against multiple instantiations
                $.data(this, "mCycle", new mCycle(this, options));
            } else {
                var mCycleObj = $.data(this, "mCycle");
                // checking if option is a valid function name
                if (typeof options === "string" && mCycleObj[options]) {
                    mCycleObj[options].apply(mCycleObj, params);
                } else if (typeof options === "object") {
                    // if the option is object extending it with initalized object
                    mCycleObj.options = $.extend({}, mCycleObj.options, options);
                }
            }
        });
    };

})(jQuery, window, document);

// RUI:: added new carousel classes inside code
    $(".js-crsl-wdgt, .widget-carousel").each(function() {
        var slideTimeout,
            $this = $(this);

        if ($this.data("autoplay"))
            $this.mCycle({
                mCycleItem: ".crsl__item",
                isAutoPlay: true
            });
        else
            $this.mCycle({
                mCycleItem: ".crsl__item"
            });
        // Tracking impressions of carousels

        var url = $this.data("impression-url");
        if (url) {
            if (url.indexOf("[timestamp]") >= 0) {
                url = url.replace("[timestamp]", $.now);
            }
            $.ajax({
                "url": url
            });
        }

        //Check with Arun once
        //$.ajax({ url: 'https://d.adx.io/views?xb=35BWU1550&xd=7&xnw=xsync&xtg=Affiliate&xtm_source=MSP_HVS_Feb&xtm_campaign=HVS_Feb&xtm_content=smallBanner&rnd=' + jQuery.now() + '' });

        $this.on("mousever", ".crsl-wdgt__prvs-btn, .prev-button", function() {
            $this.mCycle("pause").mCycle("slideRight");
            resetSlideTimeout();
        });
        $this.on("click", ".crsl-wdgt__prvs-btn, .prev-button", function() {
            $this.mCycle("pause").mCycle("slideRight");
            resetSlideTimeout();
        });
        $this.on("click", ".crsl-wdgt__next-btn, .next-button", function() {
            $this.mCycle("pause").mCycle("slideLeft");
            resetSlideTimeout();
        });
        $this.on("click", ".mCycleSlideBullet", function() {
            $this.mCycle("slideTo", $(this).index());
        });

        function resetSlideTimeout() {
            clearTimeout(slideTimeout);
            slideTimeout = setTimeout(function() {
                $this.mCycle("play");
            }, 10000);
        }
    });
elementSlider = {
    "init": function(slider) {
        var slideItem = $(slider).data("slideitem"),
            slideItemWrapper = $(slider).data("slideitemwrapper");

        if (!slideItem || !slideItemWrapper) return;
        if ($(slider).find("." + slideItemWrapper).hasClass("js-sldr-item-wrpr1")) return;

        var $elements = $(slider).find("." + slideItem),
            countCurrItems = Math.floor($(slider).find("." + slideItemWrapper).eq(0).width() / $elements.eq(0).outerWidth(true)),
            elementWidth = $($(slider).find("." + slideItem).get(0)).outerWidth(true),
            wrapperWidth = elementWidth * $elements.length;

        if ($elements.length > countCurrItems) {
            $(slider).find("." + slideItemWrapper).addClass("js-sldr-item-wrpr1").wrapInner("<div class='js-sldr-item-wrpr'></div>");
            $(slider).find("." + slideItem).eq(0).addClass("js-sldr-crnt");
            $(slider).find(".js-sldr__prvs").addClass("js-sldr__dsbl-btn").show();
            $(slider).find(".js-sldr__next").show();
        }

        $('.js-sldr-item-wrpr').css('width', wrapperWidth + 'px');
    },

    "slide": function(element, direction) {
        var $slider = $(element).closest(".js-sldr"),
            slideItemWrapper = $slider.data("slideitemwrapper"),
            $elementWrapper = $slider.find(".js-sldr-item-wrpr"),
            slideItem = $slider.data("slideitem"),
            $elements = $elementWrapper.find("." + slideItem),
            $currentElement = $elements.filter(".js-sldr-crnt"),
            $startElement = null,

            countCurrItems = Math.floor($('.' + slideItemWrapper).width() / $elements.eq(0).outerWidth(true)),
            countRightItems = $elements.length - $elements.index($currentElement) - countCurrItems,
            countLeftItems = $elements.index($currentElement),
            elementPos;

        if ($(element).hasClass("js-sldr__dsbl-btn") || $(element).hasClass("js-sldr__dsbl-btn"))
            return;

        $(element).siblings(".js-sldr__prvs").removeClass("js-sldr__dsbl-btn");
        $(element).siblings(".js-sldr__next").removeClass("js-sldr__dsbl-btn");

        if (direction === 'right') {
            if (countRightItems > countCurrItems) {
                $startElement = $elements.eq($elements.index($currentElement) + countCurrItems);
            } else {
                $startElement = $elements.eq($elements.length - countCurrItems);
                $(element).addClass("js-sldr__dsbl-btn");
            }
        } else if (direction === 'left') {
            if (countLeftItems > countCurrItems) {
                $startElement = $elements.eq($elements.index($currentElement) - countCurrItems);
            } else {
                $startElement = $elements.eq(0);
                $(element).addClass("js-sldr__dsbl-btn");
            }
        }

        $currentElement.removeClass("js-sldr-crnt");
        $startElement.addClass("js-sldr-crnt");

        //IE dones not support transitions.
        elementPos = -$startElement.position().left;
        if (Modules.Browser.name === "MSIE" && Modules.Browser.version < 9) {
            $elementWrapper.css({
                "left": elementPos
            });
        } else {
            $elementWrapper.css({
                'transform': 'translateX(' + elementPos + 'px)',
                '-webkit-transform': 'translateX(' + elementPos + 'px)',
                '-ms-transform': 'translateX(' + elementPos + 'px)'
            });
        }


        return false;
    }
}

/* RUI:: new component for horizonal scrollable sections - start */
    $(".js-sldr").each(function(e) {
        elementSlider.init(this);
    });

    // Select text inside node on clicking it.
    Modules.$doc.on("click", ".js-slct-trgr", function() {
        Modules.selectText($(this));
    });

    Modules.$doc.on("click", ".js-sldr__prvs", function() {
        elementSlider.slide(this, "left");
    });

    Modules.$doc.on("click", ".js-sldr__next", function() {
        elementSlider.slide(this, "right");
    });
    /* RUI:: new component for horizonal scrollable sections - end */
/*! TinySort 1.5.6
 * * Copyright (c) 2008-2013 Ron Valstar http://tinysort.sjeiti.com/
 * * License:
 * *     MIT: http://www.opensource.org/licenses/mit-license.php
 * *     GPL: http://www.gnu.org/licenses/gpl.html
 * */
 
! function(a, b) {
    "use strict";

    function c(a) {
        return a && a.toLowerCase ? a.toLowerCase() : a
    }

    function d(a, b) {
        for (var c = 0, d = a.length; d > c; c++)
            if (a[c] == b) return !e;
        return e
    }
    var e = !1,
        f = null,
        g = parseFloat,
        h = Math.min,
        i = /(-?\d+\.?\d*)$/g,
        j = /(\d+\.?\d*)$/g,
        k = [],
        l = [],
        m = function(a) {
            return "string" == typeof a
        },
        n = function(a, b) {
            for (var c, d = a.length, e = d; e--;) c = d - e - 1, b(a[c], c)
        },
        o = Array.prototype.indexOf || function(a) {
            var b = this.length,
                c = Number(arguments[1]) || 0;
            for (c = 0 > c ? Math.ceil(c) : Math.floor(c), 0 > c && (c += b); b > c; c++)
                if (c in this && this[c] === a) return c;
            return -1
        };
    a.tinysort = {
        id: "TinySort",
        version: "1.5.6",
        copyright: "Copyright (c) 2008-2013 Ron Valstar",
        uri: "http://tinysort.sjeiti.com/",
        licensed: { MIT: "http://www.opensource.org/licenses/mit-license.php", GPL: "http://www.gnu.org/licenses/gpl.html" },
        plugin: function() {
            var a = function(a, b) { k.push(a), l.push(b) };
            return a.indexOf = o, a
        }(),
        defaults: { order: "asc", attr: f, data: f, useVal: e, place: "start", returns: e, cases: e, forceStrings: e, ignoreDashes: e, sortFunction: f }
    }, a.fn.extend({
        tinysort: function() {
            var p, q, r, s, t = this,
                u = [],
                v = [],
                w = [],
                x = [],
                y = 0,
                z = [],
                A = [],
                B = function(a) { n(k, function(b) { b.call(b, a) }) },
                C = function(a, b) {
                    return "string" == typeof b && (a.cases || (b = c(b)), b = b.replace(/^\s*(.*?)\s*$/i, "$1")), b
                },
                D = function(a, b) {
                    var c = 0;
                    for (0 !== y && (y = 0); 0 === c && s > y;) {
                        var d = x[y],
                            f = d.oSettings,
                            h = f.ignoreDashes ? j : i;
                        if (B(f), f.sortFunction) c = f.sortFunction(a, b);
                        else if ("rand" == f.order) c = Math.random() < .5 ? 1 : -1;
                        else {
                            var k = e,
                                o = C(f, a.s[y]),
                                p = C(f, b.s[y]);
                            if (!f.forceStrings) {
                                var q = m(o) ? o && o.match(h) : e,
                                    r = m(p) ? p && p.match(h) : e;
                                if (q && r) {
                                    var t = o.substr(0, o.length - q[0].length),
                                        u = p.substr(0, p.length - r[0].length);
                                    t == u && (k = !e, o = g(q[0]), p = g(r[0]))
                                }
                            }
                            c = d.iAsc * (p > o ? -1 : o > p ? 1 : 0)
                        }
                        n(l, function(a) { c = a.call(a, k, o, p, c) }), 0 === c && y++
                    }
                    return c
                };
            for (p = 0, r = arguments.length; r > p; p++) {
                var E = arguments[p];
                m(E) ? z.push(E) - 1 > A.length && (A.length = z.length - 1) : A.push(E) > z.length && (z.length = A.length)
            }
            for (z.length > A.length && (A.length = z.length), s = z.length, 0 === s && (s = z.length = 1, A.push({})), p = 0, r = s; r > p; p++) {
                var F = z[p],
                    G = a.extend({}, a.tinysort.defaults, A[p]),
                    H = !(!F || "" === F),
                    I = H && ":" === F[0];
                x.push({ sFind: F, oSettings: G, bFind: H, bAttr: !(G.attr === f || "" === G.attr), bData: G.data !== f, bFilter: I, $Filter: I ? t.filter(F) : t, fnSort: G.sortFunction, iAsc: "asc" == G.order ? 1 : -1 })
            }
            return t.each(function(c, d) {
                var e, f = a(d),
                    g = f.parent().get(0),
                    h = [];
                for (q = 0; s > q; q++) {
                    var i = x[q],
                        j = i.bFind ? i.bFilter ? i.$Filter.filter(d) : f.find(i.sFind) : f;
                    h.push(i.bData ? j.data(i.oSettings.data) : i.bAttr ? j.attr(i.oSettings.attr) : i.oSettings.useVal ? j.val() : j.text()), e === b && (e = j)
                }
                var k = o.call(w, g);
                0 > k && (k = w.push(g) - 1, v[k] = { s: [], n: [] }), e.length > 0 ? v[k].s.push({ s: h, e: f, n: c }) : v[k].n.push({ e: f, n: c })
            }), n(v, function(a) { a.s.sort(D) }), n(v, function(a) {
                var b = a.s,
                    c = a.n,
                    f = b.length,
                    g = c.length,
                    i = f + g,
                    j = [],
                    k = i,
                    l = [0, 0];
                switch (G.place) {
                    case "first":
                        n(b, function(a) { k = h(k, a.n) });
                        break;
                    case "org":
                        n(b, function(a) { j.push(a.n) });
                        break;
                    case "end":
                        k = g;
                        break;
                    default:
                        k = 0
                }
                for (p = 0; i > p; p++) {
                    var m = d(j, p) ? !e : p >= k && k + f > p,
                        o = m ? 0 : 1,
                        q = (m ? b : c)[l[o]].e;
                    q.parent().append(q), (m || !G.returns) && u.push(q.get(0)), l[o]++
                }
            }), t.length = 0, Array.prototype.push.apply(t, u), t
        }
    }), a.fn.TinySort = a.fn.Tinysort = a.fn.tsort = a.fn.tinysort
}(jQuery);
/*! TinySort 1.5.6 -- end */
(function lazyLoadPriceGraph() {
    var $priceGraph = $("[data-id='price-history']");
    if ($priceGraph.length) {
        var offsetTop = $priceGraph.offset().top;
        Modules.$win.on("scroll.lazyGraph", Modules.throttle(function () {
            if (Modules.$win.scrollTop() + window.innerHeight > offsetTop) {
                Modules.$win.off("scroll.lazyGraph");
                $.ajax({
                    "url": "/msp/processes/property/ui-factory/msp_generate_pricegraph.php",
                    "data": {
                        "mspid": $(".prdct-dtl__ttl").data("mspid")
                    }
                }).done(function(graphHtml) {
                    $priceGraph.replaceWith(graphHtml);
                });
            }
        }, 250));
    }
})();

if ($(".prc-grph").length) {
    Modules.lazyLoad.assign({
        "node": $(".prc-grph"),
        "isStatic": true,
        "callback": {
            "definition": function() {
                if ($(".prc-grph__not-sprtd").length) {
                    $(".prc-grph__not-sprtd").show();
                    $(".prc-grph__ldr").hide();
                    return;
                }

                $("head").append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.css">');

                $.getScript("https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js", function() {
                    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js", function() {
                        $.getScript("assets/js/priceGraph.js", function() {
                            $(".prc-grph__rght-chrt").show();
                            $(".prc-grph__btn-wrpr").show();
                            $(".prc-grph__ldr").hide();
                        });
                    });
                });
            },
            "context": window,
            "arguments": []
        }
    }).run();
}

// Instatab Extension installer: GTS
$(document).on('click', '.js-instatab-popup', function(e) {
    e.preventDefault();
    var $this = $(this),
        gtsURL = $this.data('url'),
        isEmailSet = Modules.Cookie.get('msp_login_email'),
        isInstatabInstalled = Modules.Cookie.get('instatab');

    var popupCookieVal = Modules.Cookie.get('gtspopup') ? Modules.Cookie.get('gtspopup').split(';') : undefined,
        cookieNumTimes = popupCookieVal ? popupCookieVal[0] : undefined,
        cookieCurMessage = popupCookieVal ? popupCookieVal[1] : undefined,
        isEmailCaptured = popupCookieVal ? popupCookieVal[2] : undefined;

    if (popupCookieVal) {
        if (cookieNumTimes < 4) {
            if (cookieCurMessage === 'instatab') {
                if (isInstatabInstalled) {
                    if (!isEmailSet && !isEmailCaptured) {
                        setCookie('gtspopup', (Number(cookieNumTimes) + 1) + ';email;', 30);
                        openGTSPopup();
                    } else {
                        doGTS();
                    }
                } else {
                    openGTSPopup();
                }
            } else {
                if (isEmailSet || isEmailCaptured === 'email_done') {
                    if (!isInstatabInstalled) {
                        setCookie('gtspopup', '4;instatab;' + (isEmailCaptured || ''), 30);
                        openGTSPopup();
                    } else {
                        doGTS();
                    }
                } else {
                    openGTSPopup();
                }
            }
        } else {
            doGTS();
        }
    } else {
        if (isInstatabInstalled) {
            if (!isEmailSet) {
                setCookie('gtspopup', '1;email;', 30);
                openGTSPopup();
            } else {
                doGTS();
            }
        } else {
            openGTSPopup();
        }
    }

    return false;
    /* *************** */
    function openGTSPopup() {
        gtsURL ? _gPopStoreUrl = gtsURL : _gPopStoreUrl = null; // set the store url (used by openPopup())
        openPopup('https://www.mysmartprice.com/loyalty/popup/gts.php?gtsURL=' + encodeURIComponent(gtsURL), 'PromoB');
    }

    function doGTS() {
        window.open(gtsURL, '_blank');
    }
});


Modules.$doc.ready(function() {
    // Only email capture popup on GTS:
    $(document).on('click', '.js-gts-only-email-popup', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var $this = $(this),
            gtsURL = $this.data('url');
        gtsURL ? _gPopStoreUrl = gtsURL : _gPopStoreUrl = null; // set the store url (used by openPopup())

        $this.removeClass('js-instatab-popup js-prc-tbl__gts-btn');
        openPopup('https://www.mysmartprice.com/loyalty/popup/gts-only-email.php?gtsURL=' + encodeURIComponent(gtsURL));

        return false;
    });
});
/* Jquery MSP UI components */

/** [START] Price table  openPopup_rd (price breakup popup and other instruction popup) **/

$("body").on("click", ".openPopup_rd", function handler(e) {
    var $popupCont = $(this),
        $popup, mspid, currentColour, storename, popupDetails;
    handler.popupData = handler.popupData || {};
    if ($(e.target).is($(".openPopup_rd, .openPopup_rd *").not(".popup_rd, .popup_rd *"))) {
        $(".popup_rd").slideUp("fast", function() {
            if ($(this).closest(".openPopup_rd").is(".offers:not(.cashback)"))
                $(this).remove();
        });
    }

    if ($popupCont.data("popup-type") === "common") {
        $popup = $popupCont.siblings(".popup_rd");
        if (!$popup.is(":visible")) {
            if ($popup.length)
                $popup.slideDown("fast");
            else {
                $popupCont.after([
                    '<div class="loyalty_expand popup_rd common">',
                    $("#common_popup_rd").html(),
                    '</div>'
                ].join("")).siblings(".popup_rd").slideDown("fast");
            }
        }
    } else if (!$popupCont.find(".popup_rd").is(":visible")) {
        if ($popupCont.is(".offers:not(.cashback)")) {
            mspid = $("#mspSingleTitle").data("mspid");
            storename = $(this).closest(".store_pricetable").data("storename");
            currentColour = $(".filter_colour").length ? ($(".filter_colour").find(".selected").data("callout") || "default") : "default";

            if (handler.popupData.colour !== currentColour) {
                $.ajax({
                    "url": "/msp/offertext_ajax.php",
                    "dataType": "json",
                    "data": {
                        "mspid": mspid,
                        "color": (currentColour !== "default") ? currentColour : undefined
                    }
                }).done(function(response) {
                    handler.popupData.content = response;
                    popupDetails = response[storename];
                    $popupCont.append(getPopupHtml(popupDetails));
                    $popupCont.find(".popup_rd").slideDown("fast");
                });
            } else {
                popupDetails = handler.popupData.content[storename];
                $popupCont.append(getPopupHtml(popupDetails));
                $popupCont.find(".popup_rd").slideDown("fast");
            }
        } else {
            $popup = $popupCont.find(".popup_rd");
            if ($popup.hasClass("coupon_expand")) {
                if (Modules.Cookie.get("msp_login") == "1" && Modules.Cookie.get("msp_login_email") && !$.trim($popup.find(".coupon_value").text())) {
                    $popup.find(".coupon_email").val(Modules.Cookie.get("msp_login_email"));
                    $popup.find(".coupon_form").submit();
                }
            }
            $popup.slideDown("fast");
        }
    }

    function getPopupHtml(popupDetails) {
        return [
            '<div class="offers_expand popup_rd">',
            '<div class="head">',
            '<div class="title">Offer Details</div>',
            '<div class="closebutton">&times;</div>',
            '<br clear="all">',
            '</div>',
            '<div class="text">',
            popupDetails,
            '</div>',
            '</div>'
        ].join("");
    }
});

$('body').on('click', '.closebutton', function(event) {
    $(this).parents('.popup_rd').slideUp("fast");
    event.stopPropagation();
});

var PriceTable = {
    "dataPoints": {
        "category": $(".body-wrpr").attr("category"),
        "mspid": $(".prdct-dtl__ttl").data("mspid"),
        "defaultRows": 6, // $(".prc-tbl-row:visible").length
        "previousCategory": "recommended",
        "onload": true,
        "colorChange": false,
        "prevColor": null,
        "variant": {
            "model": $(".prdct-dtl__ttl-vrnt").data("model"),
            "size": $(".prdct-dtl__ttl-vrnt").data("size")
        },
        "partialOnlineRows": true,
        "price": {
            "getMrp": function() {
                return $(".prdct-dtl__slr-prc-mrp-prc").data("value")
            },
        },
        "productThumb": $(".prdct-dtl__thmbnl-img").eq(0).attr("src"),
        "cardLoading": false,
        "getTitle": function() {
            return $(".prdct-dtl__ttl").text();
        },
        "getSelectedColor": function() {
            return $(".avlbl-clrs__inpt:checked").val()
        },
        "getAppliedSort": function() {
            return $(".js-prc-tbl__sort").val();
        },
        "getAppliedFilters": function() {
            return $.map($(".prc-tbl__fltrs-inpt:checked"), function(node) {
                return $(node).attr("value");
            });
        },
        "getSelectedCategory": function() {
            return $(".prc-tbl__ctgry-inpt:checked").val();
        },
        "getSelectedCategoryLabel": function() {
            return $(".prc-tbl__ctgry-inpt:checked").data("label");
        }
    },
    "init": function() {

        //PriceTable.updateMoreStores();

        var $pageTitle = $(".prdct-dtl__ttl");

        // show/hide price card details
        $("body").on("click", ".js-show-prc-card-dtls", function(e) {
            var $tooltip = $(this).siblings(".prc-card__dtls-tltp");
            $(".prc-card__dtls-tltp").not($tooltip).slideUp();
            $tooltip.stop(true, true).slideToggle();
            e.stopPropagation();
        }).on("click", ".prc-card__dtls", function(e) {
            e.stopPropagation();
        }).on("click", function() {
            $(".prc-card__dtls-tltp").slideUp();
        });

        /* Price Table handlers for new UI */


        Modules.$doc.on("click", ".js-expnd-grid", function() {


            if (PriceTable.dataPoints.cardLoading) {
                return false;
            }
            var $textContainer = $(this).parents(".prc-grid").find(".prc-grid__more-dtls");
            var showText = $textContainer.attr("data-show-txt");
            var hideText = $textContainer.attr("data-hide-txt");
            var toggleText = $textContainer.text().split("»")[0].trim() == showText ? hideText + "<span class='prc-grid__arw-up'> »</span>" : showText + "<span class='prc-grid__arw'> »</span>";

            var $priceGrid = $(this).closest(".prc-grid");
            var $detailCard = $priceGrid.children(".prc-grid-expnd");
            var storeName = $priceGrid.data("storename");
            var mspid = PriceTable.dataPoints.mspid;


            $textContainer.html(toggleText);

            if ($detailCard.hasClass("js-has-data")) {
                //Remove the Data
                $detailCard.children(".prc-grid-expnd__data").remove();
                $detailCard.css("height", "0");

            } else {
                //Get the Data and append it
                PriceTable.dataPoints.cardLoading = true;
                $loader = '<div class="prc-grid-expnd__data"><div class="ldr ldr--sml"><div class="ldr__crcl"></div><div class="ldr__text" style="">Loading...</div> </div></div>'
                $detailCard.append($loader);

                matchChildHeight($detailCard, ".prc-grid-expnd__data");

                PriceTable.fetch.cardData(mspid).done(function(response) {
                    $detailCard.empty();
                    $detailCard.append(response[storeName]);

                    matchChildHeight($detailCard, ".prc-grid-expnd__data");
                    PriceTable.dataPoints.cardLoading = false;
                });

            }

            $detailCard.toggleClass("js-has-data");
        });

        Modules.$doc.on("click", ".js-expnd-offr", function() {


            if (PriceTable.dataPoints.cardLoading) {
                return false;
            }
            var $textContainer = $(this).parents(".prc-grid").find(".prc-grid__more-dtls");
            var showText = $textContainer.attr("data-show-txt");
            var hideText = $textContainer.attr("data-hide-txt");
            var toggleText = $textContainer.text().split("»")[0].trim() == showText ? hideText + "<span class='prc-grid__arw-up'> »</span>" : showText + "<span class='prc-grid__arw'> »</span>";

            var $priceGrid = $(this).closest(".prc-grid");
            var $detailCard = $priceGrid.children(".prc-grid-expnd");
            var storeName = $priceGrid.data("storename");
            var mspid = PriceTable.dataPoints.mspid;


            $textContainer.html(toggleText);

            if ($detailCard.hasClass("js-has-data")) {
                $detailCard.children(".prc-grid-expnd__data").hide();
                $detailCard.css("height", "0");

            } else {
                $detailCard.children(".prc-grid-expnd__data").show();
                matchChildHeight($detailCard, ".prc-grid-expnd__data");

            }

            $detailCard.toggleClass("js-has-data");
        });

        Modules.$doc.on("click", ".js-cls-grid", function() {
            $(this).parent().css("height", "0px");
        });

        function toggleCards($button) {
            var moreText = $button.attr("data-more-txt");
            var fewText = $button.attr("data-few-txt");

            var toggleText = $button.text() == moreText ? fewText : moreText;


            $button.text(toggleText);
            var showAll = $button.attr("data-few-txt") == $button.text();
            alignPriceCards(showAll);
        }

        Modules.$doc.on("click", ".js-more-strs", function() {
            $button = $(this);
            PriceTable.update.allCards(PriceTable.dataPoints.prevColor).done(function(response) {
                toggleCards($button);
            });

        });
        /* End of Price table handlers for new UI*/

        // select color and updatePage.
        Modules.$doc.on("click", ".avlbl-clrs__inpt", (function() {
            PriceTable.dataPoints.prevColor = PriceTable.dataPoints.getSelectedColor();

            return function() {
                var $this = $(this),
                    $variant = $(".prdct-dtl__ttl-vrnt"),
                    $clearColor = $this.closest(".prdct-dtl__vrnt-clr").find(".prdct-dtl__vrnt-cler"),
                    model = $variant.data("model"),
                    size = $variant.data("size"),
                    colorValue = $this.val();

                if (colorValue === PriceTable.dataPoints.prevColor) {
                    PriceTable.dataPoints.colorChange = false;
                    $variant.text((model || size) ? ("(" + (model ? (size ? model + ", " : model) : "") + (size || "") + ")") : "");

                    $clearColor.hide();
                    $this.prop("checked", false);
                } else {
                    PriceTable.dataPoints.colorChange = true;
                    $variant.text("(" + (model ? model + ", " : "") + colorValue + (size ? ", " + size : "") + ")");

                    $clearColor.show();
                    PriceTable.dataPoints.prevColor = colorValue;
                    $this.prop("checked", true);
                }


                PriceTable.update.allCards(colorValue).done(function(response) {
                    $(".js-more-strs").text($(".js-more-strs").attr("data-more-txt"));
                    alignPriceCards();
                });

            }
        })());

        // clear selected color and updatePage.
        Modules.$doc.on("click", ".prdct-dtl__vrnt-clr .prdct-dtl__vrnt-cler", function() {
            var $variant = $(".prdct-dtl__ttl-vrnt"),
                model = PriceTable.dataPoints.variant.model,
                size = PriceTable.dataPoints.variant.size;

            // set color change to true
            PriceTable.dataPoints.colorChange = true;
            PriceTable.dataPoints.prevColor = null;

            $(".avlbl-clrs__inpt").prop("checked", false);
            $variant.text((model || size) ? ("(" + (model ? (size ? model + ", " : model) : "") + (size || "") + ")") : "");
            $(this).hide();

            $(".prc-grid").attr("data-show", true);
            PriceTable.update.allCards().done(function(response) {
                $(".js-more-strs").text($(".js-more-strs").attr("data-more-txt"));
                alignPriceCards();
            });

        });

        // load the variant page selected.
        Modules.$doc.on("click", ".avlbl-sizes__item", function() {
            var $this = $(this);
            if (!$this.hasClass("avlbl-sizes__item--slctd") && !$this.parents(".avlbl-sizes").hasClass("avlbl-sizes--no-slct")) {
                window.location.href = $this.data("href");
            }
        });

        // switch between recommended, online, offline pricetables.
        Modules.$doc.on("click", ".js-ctgry-inpt", (function() {
            return function() {
                var $this = $(this),
                    previousValue = PriceTable.dataPoints.previousCategory,
                    currentValue = $this.attr("value"),
                    isSelected = currentValue === previousValue;

                if (!isSelected) {
                    $(".js-ctgry-inpt").prop("checked", false);
                    $this.prop("checked", true);

                    PriceTable.dataPoints.previousCategory = currentValue;
                    PriceTable.update.byFilter(currentValue);
                }
            };
        })());

        // trigger offline area switcher
        Modules.$doc.on("click", ".prdct-dtl__slr-offln-area", function() {
            $(".usr_location__wrpr").trigger("click");
            return false;
        });

        // online and offline stores - user choice
        Modules.$doc.on('click', '.js-offln-click', function() {
            $('.js-ctgry-inpt[value="offline"]').trigger('click');
        });
        Modules.$doc.on('click', '.js-onln-click', function() {
            $('.js-ctgry-inpt[value="online"]').trigger('click');
        });

        // apply filters to current pricetable.
        Modules.$doc.on("click", ".prc-tbl__fltrs-inpt", function() {
            PriceTable.update.byFilter(undefined, {
                "latitude": window.localStorage.userLatitude,
                "longitude": window.localStorage.userLongitude
            });
        });

        // sort current pricetable.
        ;
        (function pricetableSortingHandlers() {
            Modules.$doc.on("change", ".js-prc-tbl__sort", function() {
                var newSortby = $(this).val(),
                    category = newSortby.split(":")[0],
                    $updatedColumn = $(".prc-tbl-hdr__clm[data-sort-category='" + category + "']");

                // fetch fresh data if all stores are not loaded
                if (PriceTable.dataPoints.partialOnlineRows) {
                    PriceTable.update.byFilter(undefined, {
                        "latitude": window.localStorage.userLatitude,
                        "longitude": window.localStorage.userLongitude
                    });
                    return;
                }

                updatePriceTableColumns($updatedColumn, newSortby);

                PriceTable.sort(newSortby);
            });

            Modules.$doc.on("click", ".prc-tbl-hdr__clm[data-sort-value]", function() {
                var newSortby = $(this).data("sort-value");

                // change sort dropdown value to trigger pricetable update accordingly.
                $(".js-prc-tbl__sort").val(newSortby).change();
            });

            function updatePriceTableColumns($updatedColumn, newSortby) {
                var newSortby, nextSortby, category, newOrder, oldOrder, nextOrder;

                if ($updatedColumn.length) {
                    // get category and new order to be applied.
                    category = newSortby.split(":")[0];
                    newOrder = newSortby.split(":")[1];

                    /**
                     * MSP.utils.rotateValue => rotate values in a set,
                     * used here to toggle between two values.
                     */
                    oldOrder = nextOrder = Modules.cycleShift(["asc", "desc"], newOrder);
                    nextSortby = category + ":" + nextOrder;

                    // assign new sort value and class to the column
                    $updatedColumn.data("sort-value", nextSortby);
                    $updatedColumn.find(".prc-tbl-hdr__arw").removeClass("prc-tbl-hdr__arw--" + oldOrder).addClass("prc-tbl-hdr__arw--" + newOrder);
                    // reset all columns label to unsorted and apply sorting to current column.
                    $(".prc-tbl-hdr__clm[data-sort-category]").removeClass("prc-tbl-hdr__clm--slctd").find(".prc-tbl-hdr__cptn").text("Sort By");
                    $updatedColumn.addClass("prc-tbl-hdr__clm--slctd").find(".prc-tbl-hdr__cptn").text("Sorted By");
                } else {
                    // reset all columns to unsorted
                    $(".prc-tbl-hdr__clm[data-sort-category]").removeClass("prc-tbl-hdr__clm--slctd").find(".prc-tbl-hdr__cptn").text("Sort By");
                }
            }
        }());

        // show more stores.
        Modules.$doc.on('click', '.js-prc-tbl__show-more', function handler() {
            var $this = $(this),
                $inner = $this.find(".prc-card__more-inr"),
                $priceLines = $(".prc-card").not($this),
                isCollapsed = $this.data("collapsed"),
                defaultRows = PriceTable.dataPoints.defaultRows,
                allRows = $priceLines.length;

            // disable click during load by removing class
            $this.removeClass('js-prc-tbl__show-more');

            handler.innerHtml = handler.innerHtml || $inner.html();

            // Check if more than 6 stores are visible:
            if (isCollapsed && !($('.js-offln-avl').length) && !(allRows - defaultRows)) {
                PriceTable.update.byFilter(); // no store type (online) and no location :: in case No offline stores
                PriceTable.dataPoints.partialOnlineRows = false;

                $this.addClass('js-prc-tbl__show-more'); // enable click and return
                setTimeout(function() { $this.trigger('click'); }, 1500);
                return;
            }

            $priceLines.slice(defaultRows).fadeToggle(400, function() {
                var $moreCard = $(".prc-card--more");
                $moreCard.css("margin-left", ($moreCard.index(".prc-card:visible") % 3) ? "14px" : "0");
            });

            if (isCollapsed) {
                $inner.text("See less stores");
                $("html, body").animate({
                    scrollTop: $priceLines.eq(defaultRows - 1).offset().top - $(".hdr-size").height()
                });
                $this.data("collapsed", false);
            } else {
                $inner.html(handler.innerHtml);
                $("html, body").animate({
                    scrollTop: $priceLines.eq(defaultRows).offset().top - $(window).height() + ($(".hdr-size").height() * 2)
                });
                $this.data("collapsed", true);
            }

            // enable click
            $this.addClass('js-prc-tbl__show-more');
        });

        /* more offers message box handlers - start */
        Modules.$doc.on("click", ".js-xtrs-msg-box-trgt", function handler(e) {
            var $popupCont = $(this),
                $popup = $popupCont.find(".prc-tbl__xtrs-clm-pop"),
                $row = $(this).closest(".prc-tbl-row"),
                mspid, currentColour, storename, offerDetails, offersMsgBoxHtml, msgBox;

            if ($popupCont.hasClass('cashback') || $popupCont.hasClass('offline')) {
                msgBox = $popupCont.find('.msg-box');
                msgBox.toggleClass('msg-box--show');
                return;
            }

            if (!$(e.target).hasClass("js-xtrs-msg-box__cls")) {
                handler.popupData = handler.popupData || {};
                if (!$popup.hasClass("msg-box--show")) {
                    mspid = PriceTable.dataPoints.mspid;
                    storename = $row.data("storename");
                    currentColour = PriceTable.dataPoints.getSelectedColor() || false;

                    if (handler.popupData.colour !== currentColour) {
                        PriceTable.fetch.offersPopups(mspid, currentColour).done(function(response) {
                            handler.popupData.content = response;
                            offerDetails = response[storename];

                            offersMsgBoxHtml = PriceTable.components.offersMsgBox(offerDetails);
                            $popupCont.append(offersMsgBoxHtml);
                            var reflow = $("body").offset().top;
                            $popupCont.find(".msg-box").addClass("msg-box--show");
                        });
                    } else {
                        offerDetails = handler.popupData.content[storename];
                        offersMsgBoxHtml = PriceTable.components.offersMsgBox(offerDetails);

                        $popupCont.append(offersMsgBoxHtml);
                        $popupCont.find(".msg-box").addClass("msg-box--show");
                    }
                }
            }
        });

        Modules.$doc.on("click", ".js-xtrs-msg-box__cls", function() {
            var $this = $(this),
                $xtrasLink = $this.closest('.js-xtrs-msg-box-trgt');

            if ($xtrasLink.hasClass('cashback') || $xtrasLink.hasClass('offline')) {
                return;
            }

            $this.closest(".msg-box").remove();
        });

        // close all message boxes on pressing escape key
        $('body').keydown(function(e) {
            if (e.which == 27 && $('.msg-box').is(':visible')) {
                $('.js-msg-box__cls, .js-xtrs-msg-box__cls').click();
            }
        });
        /* more offers message box handlers - end */

        ;
        (function locationFilterHandlers() {
            var isChrome = Modules.Browser.name === "Chrome",
                isLocationStored;

            if (navigator.geolocation) {
                // check if location data stored in localStorage.
                isLocationStored = !!window.localStorage.userLatitude;

                // show geolocation button if geolocation API supported.
                $(".prc-tbl__lctn-gps").show();
                // if chrome, then update localStorage value onload itself.
                if (isChrome && isLocationStored) {
                    $(".prc-tbl__lctn-gps").click();
                }

                // clicking on chrome geolocation overlay should remove it.
                Modules.$doc.on("click", ".js-glctn-ovrly", function() {
                    $(".js-glctn-ovrly").removeClass("js-ovrly--show");
                    $("body").css("overflow", "auto");
                });

                // bind Google maps autocomplete to location searchbox.
                ;

                if(typeof(google) !== "undefined"){
                (function initAutocomplete() {
                    if($(".prdct-dtl__ttl").data("page-type")=="nc") {
                        return;
                    }
                    var autocomplete = new google.maps.places.Autocomplete($(".prc-tbl__lctn-inpt").get(0), {
                        componentRestrictions: { country: "in" },
                        types: ["geocode"]
                    });
                    google.maps.event.addListener(autocomplete, "place_changed", function() {
                        var place = autocomplete.getPlace(),
                            location = place && place.geometry && place.geometry.location;
                        if (location) {
                            // if online stores is selected switch tab to offline.
                            if (PriceTable.dataPoints.getSelectedCategory() === "online" || PriceTable.dataPoints.getSelectedCategory() === "recommended") {
                                $(".prc-tbl__ctgry-inpt").prop("checked", false);
                                $(".prc-tbl__ctgry-inpt[value='offline']").prop("checked", true);

                                // Since offline is checked, Previous category should be changed to offline:
                                PriceTable.dataPoints.previousCategory = "offline";
                            }

                            PriceTable.update.byFilter(PriceTable.dataPoints.getSelectedCategory(), {
                                "latitude": location.lat(),
                                "longitude": location.lng()
                            });
                        }
                    });
                }());
                }
            }
        }());

        // Addition :[Disabled] To fetch all stores and check if offline stores is available
        ;
        (function fetchStoresForOfflineInfo() {
            var _offlineStatus = $('.prdct-dtl__ttl').data('offlinedelivery');
            if (_offlineStatus == "Y") {
                // PriceTable.update.byFilter("recommended");
            }
        }());
        // END
    },
    "update": {
        "allCards": function(_currentColour) {
            var dfd = $.Deferred();
            var _mspid = PriceTable.dataPoints.mspid;
            $loader = "<div class='prc-grid--ldr'><div class='ldr'><div class='ldr__crcl'></div></div></div>";
            $(".prc-grid-wrpr").append($loader);
            PriceTable.fetch.allTableData(_mspid, _currentColour).done(function(response) {
                $(".prc-grid--ldr").remove();
                $(".prc-grid-wrpr").html(response);
                PriceTable.update.miniPriceTable(response);
                showCplWidget();
                updateSidebarPriceTable();
                dfd.resolve();
            });
            return dfd.promise();
        },

        "miniPriceTable": function(response) {
            var $responseHolder = $('<div>' + response + '</div>'),
                $priceGrids = $responseHolder.find('.prc-grid'),
                lines = $priceGrids.length,
                numMoreStores,
                gridData = {},
                gridTemplater = function(storeLogoUrl, price, shippingInfo, gtsUrl) {
                    return [
                        '<div class="prc-tbl__row-wrpr">',
                            '<div class="prc-tbl__row clearfix">',
                                '<div class="prc-tbl__logo"><img class="prdct-dtl__str-icon" src="' + storeLogoUrl + '"></div>',
                                '<div class="prc-tbl__info">',
                                    '<div class="prc-tbl__prc">',
                                        '&#8377;' + price,
                                    '</div>',
                                '</div>',
                                '<div class="prc-tbl__btn">',
                                    '<div class="bttn bttn--gts prc-tbl__gts-btn js-prc-tbl__gts-btn" data-cookiename="" data-cookietimedays="" data-href="" data-url="' + gtsUrl + '"></div>',
                                '</div>',
                            '</div>',
                        '</div>'
                    ].join('');
                },
                $miniPriceTable = $('.prc-tbl'),
                miniPriceTableData = '';

            lines = lines < 4 ? lines : 4;
            numMoreStores = $priceGrids.length - lines;

            for(var i = 0;i < lines; i++) {
                var $priceGrid = $priceGrids.eq(i); // Fetch each individual grid
                gridData.store = $priceGrid.data('storename').toLowerCase();
                if(gridData.store === 'ebay_1') {
                    gridData.store = 'ebay';
                }
                gridData.storeLogoUrl = 'https://assets.mspcdn.net/q_auto/logos/partners/' + gridData.store + '_store.png';
                gridData.price = $priceGrid.find('.prc-grid__prc-val').text().replace(/[^0-9,]/g,'');
                gridData.shippingInfo = $priceGrid.find('.prc-grid__shpng').text();
                gridData.gtsUrl = $priceGrid.find('.js-prc-tbl__gts-btn').data('url');
                miniPriceTableData += gridTemplater(gridData.storeLogoUrl, gridData.price, gridData.shippingInfo, gridData.gtsUrl);
            }

            if(numMoreStores > 0) {
                miniPriceTableData += [
                    '<div class="prc-tbl__more-info clearfix">',
                        '<div class="prc-tbl__more-strs text-link js-inpg-link" data-href="price-table">',
                            numMoreStores + ' more stores »',
                        '</div>',
                    '</div>'
                ].join('');
            }

            $miniPriceTable.html(miniPriceTableData);
        },

        "byFilter": function(storetype, location) { // pass storetype as 'undefined' for all data
            var _loadingMaskHTML = PriceTable.components.loadingMask(),
                _innerPriceTable = $(".prc-grid-wrpr"),
                _sort = $('.sort-wrpr__ctgry-inpt:checked').attr('value'),
                _type = storetype || $('.js-ctgry-inpt:checked').attr('value'),
                _appliedFilters = PriceTable.dataPoints.getAppliedFilters(),
                _colour = PriceTable.dataPoints.getSelectedColor();

            _innerPriceTable.append(_loadingMaskHTML);

            PriceTable.fetch.tableByFilter(_type, _sort, _appliedFilters, location, _colour).done(function(json) {
                if (json) {
                    // if pricetable data is available update price table with html received
                    if (json.pricetable) {
                        // check for no stores in response
                        var _searchValue = "prc-grid",
                            _responsePriceTable = json.pricetable,
                            _index = _responsePriceTable.search(_searchValue);

                        if (_index == -1) {
                            _innerPriceTable.html('<div class="no-strs">No stores available</div>');
                        } else {
                            _innerPriceTable.html(json.pricetable);

                            var $allStores = $(".prc-grid, .prc-grid--ofln"),
                                $moreCard = $(".prc-grid--more");

                            if ($allStores.length > PriceTable.dataPoints.defaultRows) {
                                $allStores.slice(PriceTable.dataPoints.defaultRows).hide();

                                var $priorityStores = $(".prc-grid[data-storename='amazon'], .prc-grid[data-storename='flipkart']").not(":visible");
                                if ($priorityStores.length) {
                                    $priorityStores.insertAfter($(".prc-grid").eq(PriceTable.dataPoints.defaultRows - 1)).show();
                                    PriceTable.dataPoints.defaultRows = $allStores.filter(":visible").length;

                                    var hiddenStores = $allStores.not(":visible").length;
                                    if (hiddenStores)
                                        $(".prc-grid__more-inr").text("See " + hiddenStores + " more " + (hiddenStores > 1 ? "stores" : "store"));
                                    else
                                        $moreCard.hide();
                                }
                            }

                            $moreCard.css("margin-left", ($moreCard.index(".prc-card:visible") % 3) ? "14px" : "0");

                            //PriceTable.updateMoreStores();
                        }
                    }

                    // color change affects online stores
                    if (PriceTable.dataPoints.colorChange) {
                        if (json.online_store_count) {
                            $('.prdct-dtl__slr-onln .lghtr').html('Starting from');
                            $('.prdct-dtl__slr-onln .prdct-dtl__slr-hghlght').html('₹ ' + json.online_best_price);
                            $('.js-onln-click.btn.btn-strs').html('View ' + json.online_store_count + ' Online Stores &#187;');
                        } else {
                            $('.prdct-dtl__slr-onln .lghtr').html('No Online stores available');
                            $('.prdct-dtl__slr-onln .prdct-dtl__slr-hghlght').html('');
                            $('.js-onln-click.btn.btn-strs').html('No Online stores listed');
                        }
                        // lowest price will be online price if offline isn't available 
                        // (overwritten in offline check - next if)
                        $('.prdct-dtl__slr-prc-rcmnd-val').text(json.online_best_price).data('value', json.online_best_price_raw);
                    }

                    // for only offline calculations
                    // check if offline stores are returned (first check)
                    if ($(".prdct-dtl__ttl").data("offlinedelivery") == "Y" || $(".prdct-dtl__ttl").data("jdavailable") == "Y") {
                        // Display the brand auth seller widget to the right within product pane
                        // Parse the location values from localstorage and cookie respectively

                        // other offline calculations
                        PriceTable.dataPoints.partialOnlineRows = false;
                        if (PriceTable.dataPoints.onload || PriceTable.dataPoints.colorChange) {
                            // set lowest price btw online and offline 
                            var _lowest = parseInt($('.prdct-dtl__slr-prc-rcmnd-val').data('value')) || 99999999;
                            if (_lowest > json.offline_best_price_raw) {
                                $('.prdct-dtl__slr-prc-rcmnd-val').text(json.offline_best_price).data('value', json.offline_best_price_raw);
                            }

                            $('.prc-tbl__ctrls').css('display', 'block');
                            $('.prc-tbl-hdr').css('border-top', '1px solid #dfe1e8');
                            $('.js-strs-offln-prc').html('₹ ' + json.offline_best_price);
                            $('.js-strs-offln-cnt').html('View ' + json.offline_store_count + ' Nearby Stores &#187;');
                            $('.prdct-dtl__slr').addClass('js-offln-avl');
                            PriceTable.dataPoints.onload = false;
                        }
                    }

                    alignPriceCards();

                    // set colorChange to default
                    PriceTable.dataPoints.colorChange = false;

                } else {
                    _innerPriceTable.html('<div class="no-strs">No stores returned</div>');
                }
                // display online/offline store based on availability
                if ($('.js-offln-avl').length) { // both offline and online are available
                    var _allStores = $('.prdct-dtl__slr-strs'),
                        _unavailableStores = $('.prdct-dtl__slr-strs-ntfy'),
                        _onlineStores = $('.prdct-dtl__slr-onln');
                    if (!_onlineStores.length) { // no online stores
                        _unavailableStores.remove();
                    } else { // online stores available
                        _allStores.removeClass('prdct-dtl__slr-strs--l');
                    }
                }
            }).fail(function() {
                _innerPriceTable.find('.js-fltr-ldng-mask').remove();
            });
        }
    },
    "sort": function(sortby) {
        var $priceTableContainer = $('.prc-tbl-inr'),
            $priceTableRows = $('.prc-tbl-row'),
            sortColumn = sortby.split(":")[0],
            sortOrder = sortby.split(":")[1],
            sortTypes,
            $hideXtrscashback = $('.js-xtrs-msg-box-trgt.cashback').find('msg-box--show'),
            $hideXtrsoffline = $('.js-xtrs-msg-box-trgt.offline').find('msg-box--show'),
            $hideOffers = $('.js-xtrs-msg-box-trgt').not('.cashback');

        // close all messageBoxes before sorting priceTable
        $hideOffers.find('.js-msg-box__cls, .js-xtrs-msg-box__cls').click();
        $hideXtrsoffline.removeClass('msg-box--show');
        $hideXtrscashback.removeClass('msg-box--show');

        sortTypes = {
            "popularity": { "attr": "data-relrank" },
            "price": { "attr": "data-pricerank" },
            "price": { "attr": "data-pricerank" },
            "rating": { "attr": "data-rating" },
            "rating": { "attr": "data-rating" }
        };

        $priceTableContainer.css({
            height: $priceTableContainer.height(),
            display: 'block'
        });

        $priceTableRows.show();
        $priceTableRows.each(function(i, el) {
            var iY = $(el).position().top;
            $.data(el, 'h', iY);
        });

        if (sortby === 'popularity') {
            $('.prc-tbl-row--NA').attr("data-relrank", "9999");
        } else if (sortby === 'price:asc') {
            $('.prc-tbl-row--NA').attr("data-pricerank", "9999999");
        } else if (sortby === 'price:desc') {
            $('.prc-tbl-row--NA').attr("data-pricerank", "0");
        } else if (sortby === 'rating:asc') {
            $('.prc-tbl-row--NA').attr("data-rating", "6");
            $('.prc-tbl-row--NA').find('.js-prc-tbl__str-rtng').attr("data-rating", "6");
        } else if (sortby === 'rating:desc') {
            $('.prc-tbl-row--NA').attr("data-rating", "-1");
            $('.prc-tbl-row--NA').find('.js-prc-tbl__str-rtng').attr("data-rating", "-1");
        }

        $('.prc-tbl-row').tsort({
            "attr": sortTypes[sortColumn].attr,
            "order": sortOrder
        }).each(function(i, el) {
            var $El = $(el);
            var iFr = $.data(el, 'h');
            var iTo = 0;
            $El.prevAll('.prc-tbl-row:visible').each(function() {
                iTo += $(this).outerHeight();
            });
            $El.css({
                position: 'absolute',
                top: iFr
            }).stop().animate({
                top: iTo
            }, 500, function() {
                $priceTableRows.css({
                    position: 'relative',
                    top: 'auto'
                });
                $priceTableContainer.css({
                    height: 'auto',
                    display: 'block'
                });

                if ($(".js-prc-tbl__show-more").data("collapsed")) {
                    $('.prc-tbl-row').slice(PriceTable.dataPoints.defaultRows).hide();
                } else {
                    $('.prc-tbl-row').slice(PriceTable.dataPoints.defaultRows).show();
                }
            });
        });
    },
    "components": {
        "loadingMask": function() {
            return [
                '<div class="js-fltr-ldng-mask">',
                '<div class="ldr">',
                '<div class="ldr__crcl"></div>',
                '<div class="ldr__text" style="">Loading...</div> ',
                '</div>',
                '</div>'
            ].join("");
        },
        "offersMsgBox": function(offerDetails) {
            var offerCount = 1,
                offerRows, msgBoxHtml,
                _regex = /<li>/;

            if (_regex.test(offerDetails)) {
                offerCount = $(offerDetails).find("li").length || 1,
                    offerRows = (function() {
                        var result = "";
                        if (offerCount) {
                            $(offerDetails).find("li").each(function() {
                                result += '<div class="msg-box__row">' + $(this).html() + '</div>';
                            });
                        } else {
                            result += '<div class="msg-box__row">' + $(offerDetails).html() + '</div>';
                        }
                        return result;
                    }());
            } else {
                offerRows = '<div class="msg-box__row">' + offerDetails + '</div>';
            }

            msgBoxHtml = [
                '<div class="msg-box prc-tbl__xtrs-clm-pop">',
                '<div class="msg-box__hdr clearfix">',
                offerCount + ' Offers',
                '<span class="msg-box__cls js-xtrs-msg-box__cls">×</span>',
                '</div>',
                '<div class="msg-box__inr">',
                offerRows,
                '</div>',
                '</div>',
            ].join("");

            return msgBoxHtml;
        }
    },
    "fetch": {
        "allTableData": Modules.memoize(function(mspID, color) {
            var dfd = $.Deferred(),
                query = {
                    "mspid": mspID,
                    "data": "table",
                    "color": color
                };

            setServingLocation();

            $.ajax({
                "url": "/mobile/ptrows_details.php",
                "data": query
            }).done(function(response) {
                dfd.resolve(response);
            }).fail(function(response) {
                dfd.reject(response);
            });
            return dfd.promise();
        }, {
            cacheLimit: 10
        }),
        "cardData": Modules.memoize(function(mspID) {
            var dfd = $.Deferred(),
                query = {
                    "mspid": mspID,
                    "data": "store"
                };

            $.ajax({
                "url": "/mobile/ptrows_details.php",
                "dataType": "json",
                "data": query
            }).done(function(response) {
                dfd.resolve(response);
            }).fail(function(response) {
                dfd.reject(response);
            });
            return dfd.promise();
        }, {
            cacheLimit: 10
        }),
        "tableByFilter": Modules.memoize(function(type, sort, appliedFilters, location, selectedColor) {
            var dfd = $.Deferred(),
                query = {
                    "mspid": PriceTable.dataPoints.mspid,
                    "mrp": PriceTable.dataPoints.price.getMrp() || 0,
                    "sort": PriceTable.dataPoints.getAppliedSort(),
                    "colour": (PriceTable.dataPoints.getSelectedColor() || "").toLowerCase(),
                    "cod": appliedFilters.indexOf("cod") !== -1,
                    "emi": appliedFilters.indexOf("emi") !== -1,
                    "returnpolicy": appliedFilters.indexOf("returnPolicy") !== -1,
                    "offers": appliedFilters.indexOf("offers") !== -1,
                    "coupons": appliedFilters.indexOf("coupons") !== -1,
                    "storetype": type || "recommended",
                    "sort": sort || "popularity",
                    "latitude": location && location.latitude,
                    "longitude": location && location.longitude,
                    "colour": selectedColor || false
                };

            $.ajax({
                "url": "/mobile/filter_response_new.php",
                "dataType": "json",
                "data": query
            }).done(function(response) {
                dfd.resolve(response);
            }).fail(function(response) {
                dfd.reject(response);
            });

            return dfd.promise();
        }, {
            cacheLimit: 10
        }),
        "offersPopups": Modules.memoize(function(mspid, color) {
            var dfd = $.Deferred();
            $.ajax({
                "url": "/msp/offertext_ajax.php",
                "type": "GET",
                "dataType": "json",
                "data": {
                    "mspid": mspid,
                    "color": color
                }
            }).done(function(response) {
                dfd.resolve(response);
            });
            return dfd.promise();
        }, {
            cacheLimit: 10
        })
    },
    // Update top stores section
    "updateMoreStores": function() {
        var moreRowsCount = $(".prc-grid").length - 1;
        if (moreRowsCount > 0) {
            $(".js-str-cnt").html(moreRowsCount + " More " + (moreRowsCount === 1 ? "Store" : "Stores")).show();
        } else {
            $(".js-str-cnt").hide();
        }
    }
};
PriceTable.init();

// To Notify user when product becomes available
// Includes both cases - "Coming soon" as well as "Out of Stock"
Modules.$doc.on('submit', '.js-ntfy-frm', function() {
    var $inputField = $(this).find(".js-ntfy-eml"),
        $errorNode = $(this).find(".js-ntfy-err");
    MSP.utils.validate.form([{
        "type": "email",
        "inputField": $inputField,
        "errorNode": $errorNode
    }]).done(function() {
        $.ajax({
            "url": "/price_alert/capture_email.php",
            "data": {
                "email": $inputField.val(),
                "mspid": PriceTable.dataPoints.mspid,
                "capture_point": "outofstock",
                "popupname": "pricealert"
            }
        });
        // hide form & show success message.
        $(".js-ntfy-eml").hide();
        $(".js-ntfy-sbmt").hide();
        $(".js-ntfy-sccss").fadeIn();
    });
    return false;
});

// if GTS is not a popup target then open storeUrl in new tab.
Modules.$doc.on("click", ".js-prc-tbl__gts-btn", function() {
    debugger
    var $this = $(this),
        storeUrl = $this.data("url"),
        hasPopup = $this.hasClass("js-popup-trgt") || $this.hasClass("js-lylty-popup-trgt") || $this.hasClass("js-instatab-popup"),
        isEnabled = !$this.hasClass("btn-GTS--dsbld");

    if (!hasPopup && isEnabled) {
        window.open(storeUrl);
    }

    return false;
});

Modules.$doc.on("click", ".js-ntfy-sbmt", function() {
    var $form = $(this).closest(".js-ntfy-frm"),
        $inputField = $form.find(".js-ntfy-eml"),
        $errorNode = $form.find(".js-ntfy-err");
    MSP.utils.validate.form([{
        "type": "email",
        "inputField": $inputField,
        "errorNode": $errorNode
    }]).done(function() {
        $.ajax({
            "url": "/price_alert/capture_email.php",
            "data": {
                "email": $inputField.val(),
                "mspid": PriceTable.dataPoints.mspid,
                "capture_point": "outofstock",
                "popupname": "pricealert"
            }
        });
        // hide form & show success message.
        $form.hide();
        $(".js-ntfy-sccss").fadeIn();
    });
    return false;
});

/* Load GA events for GTS Clicks */
Modules.$doc.on('click', '.prc-tbl__btn .js-prc-tbl__gts-btn', function(e) {
        var $parent = $(this).closest('.prc-tbl');
        if($parent.hasClass('cards')) {
            if($parent.hasClass('full')) {
                logGTSEvent('Top-Price-Table--FullCards');
            } else {
                logGTSEvent('Top-Price-Table--Cards');
            }
        } else {
            logGTSEvent('Top-Price-Table');
        }
    }).on('click', '.prc-grid__clmn-4 .js-prc-tbl__gts-btn', function(e) {
        logGTSEvent('Bottom-Price-Table');
    }).on('click', '.js-gts-sidebar', function(e) {
        logGTSEvent('Sidebar-Price-Table');
    });

(function backToStoreAndLowestPrice() {
        var lowestPrice = $('.prdct-dtl__prc-val').text().replace(/\D/g, '');
        // find lowest price store grid:
        $('.prc-grid[data-pricerank=' + lowestPrice + ']').addClass('prc-grid--lwst-price');
        // find visited store grid:
        if(url.getAQueryParam && url.getAQueryParam('utm_medium')) {
            $('.prc-grid[data-storename=' + url.getAQueryParam('utm_medium') + ']').addClass('prc-grid--vstd-store');
        }
    }());

    (function NCgaEvents() {
        if ($(".prc-grid__gts-btn--mdl--ncCompare")[0]) {
            $(".prc-grid__gts-btn--mdl--ncCompare").on("click", function() {
                if (window.ga) {
                    ga('send', 'event', 'Non-Comparables', 'Click', 'price-table-gts');
                }
            });
        }

        if($(".prdct-dtl__ttl").data("page-type")=="nc" && $(".prc-grid").length && window.ga){
            ga('send', 'event', 'Non-Comparables', 'gtsLoad', 'price-table-gts', { nonInteraction: true });
        }
    }());

function adjustGridStyle() {
    $(".prc-grid--no-brdr").removeClass("prc-grid--no-brdr");
    $(".prc-grid").filter(":visible:last").addClass("prc-grid--no-brdr");
}

function matchChildHeight($element, childSelector) {
    var newHeight = $element.children(childSelector).outerHeight(true);
    $element.css("height", newHeight + "px");
}

function alignPriceCards(showAll) {
    if (showAll) {
        $(".prc-grid").show();
    } else {
        $(".prc-grid:visible").slice(6).hide();
    }


    if ($(".prc-grid").length >= 6) {
        $(".js-more-strs").show();
    } else {
        $(".js-more-strs").hide();
    }
    adjustGridStyle();
}
alignPriceCards();

/* A/B Testing; 20% users see cards in Price Table */
(function() {
    var mspUid = +Modules.Cookie.get('msp_uid');
    if(mspUid % 10 < 2) { // 20% of users 
        $('.prc-tbl').addClass('cards'); 
        if(mspUid % 10 < 1) { // 10% of users see only cards
            window.ga && ga('send', 'event', 'Comparables', 'GTS-Page-View', 'Top-Price-Table--Cards');
        } else { // Rest 10% of users see full width cards
            $('.prc-tbl').addClass('full'); 
            window.ga && ga('send', 'event', 'Comparables', 'GTS-Page-View', 'Top-Price-Table--FullCards');
        }
    } else { // Remaining 80% of users (Normal pricetable)
        window.ga && ga('send', 'event', 'Comparables', 'GTS-Page-View', 'Top-Price-Table');
    }
})();

$(document).on("click", ".prc-grid__instl-extnsn-btn", function(e) {

    var $thisButton = $(this),
        $form = $(this).closest(".prc-grid__no-stck-form");

    if($thisButton.hasClass("btn--dsbld"))
        return false;

    $thisButton.html("Checking ...");
    $thisButton.addClass("btn--dsbld");
    $thisButton.removeClass("btn--blue");
    window.open("https://chrome.google.com/webstore/detail/mysmartprice/bofbpdmkbmlancfihdncikcigpokmdda?hl=en");

    var totalTimeElapsed = 0,
        checkExtensionInterval = setInterval(function(){ 
            totalTimeElapsed += 10;
            console.log("here");
            if(totalTimeElapsed > 120)
                clearInterval(checkExtensionInterval);

            if(Modules.isInstalled('plugin_id')) {
                $form.hide();
                $form.siblings(".prc-grid__no-stck-scs").fadeIn();
                $form.siblings(".prc-grid__no-stck-sub").hide();

                clearInterval(checkExtensionInterval);
            } else {
                if(totalTimeElapsed > 120){
                    $thisButton.html("Add Extension");
                    $thisButton.removeClass("btn--dsbld");
                    $thisButton.addClass("btn--blue");   
                }
            }
        }, 10000);
});

// populating users email in notify me widget
var msp_login_email = Modules.Cookie.get("msp_login_email") || ""
$(".prc-grid__no-stck-inpt").val(msp_login_email);

/* function to create pricetable on the fly:
 * should be called everytime top price table changes */
function createSidebarPriceTable(storesInfo) {
    "use strict";

    var $inrSctn, $hdrSctn, $sctn,
        storesHTML = '',
        featuredHTML = '',
        $featuredStores, 
        $topPTMoreStore = $('.prc-tbl__more-info'),
        favIconTemplate = function favIconTemplate(strname) {
            return 'https://assets.mspcdn.net/msp-ui/fav-icon/' + strname + '.png';
        },
        logoTemplate = function logoTemplate(strname) {
            return 'https://assets.mspcdn.net/q_auto/logos/partners/' + strname + '_store.png';
        },
        createFeaturedStore = function createFeaturedStore(store) {
            return ['<div class="cols1-prdcts__ftrd" data-strname="' + store.storeName + '">',
                    '<div>',
                        '<div class="cols1-prdcts__ftrd-stre"><img src="' + logoTemplate(store.storeName) + '"></div>',
                        '<div class="cols1-prdcts__ftrd-prc">' + store.price + '</div>',
                    '</div>',
                    '<a rel="nofollow" target="_blank" href="' + store.gtsURL + '" class="cols1-prdcts__ftrd-gts js-gts-sidebar ' + store.storeName + ' ' + store.classes + '" data-url="' + store.gtsURL + '"></a>',
                '</div>'].join('');
        },
        $viewAll = $('<div class="cols1-prdcts__view-all text-link js-inpg-link" data-href="price-table">View all stores &raquo;</div>');

    if(storesInfo) {
        storesInfo.stores.forEach(function(store, idx) {
            if(store.storeName.toLowerCase() === 'amazon' || store.storeName.toLowerCase() === 'flipkart') {
                featuredHTML += createFeaturedStore(store);
            } else {
                storesHTML += [
                    '<div class="cols1-prdcts__str">',
                        '<div class="cols1-prdcts__str-name" data-strname="' + store.storeName + '">',
                            '<img class="cols1-prdcts__str-icon" src="' + favIconTemplate(store.storeName) + '">',
                            '<span>' + (store.storeName.charAt(0).toUpperCase() + store.storeName.slice(1)) + '</span>',
                        '</div>',
                        '<a rel="nofollow" target="_blank" href="' + store.gtsURL + '" class="cols1-prdcts__gts-btn js-gts-sidebar ' + store.classes + '" data-url="' + store.gtsURL + '">',
                            store.price + ' &#10141;',
                        '</a>',
                    '</div>'
                ].join('');
            }
        });
        // Sort amazon & flipkart featured stores (Amazon first):
        $featuredStores = $(featuredHTML).sort(function(a, b) {
            return $(a).data('strname') < $(b).data('strname') ? -1 : 1;
        });
        // inner section:
        $inrSctn = $('<div class="sctn__inr clearfix"></div>')
                    .prepend($(storesHTML))
                    .prepend($featuredStores);
        // full section:
        $sctn = $('<div class="sctn cols1-prdcts clearfix"></div>')
                .append($inrSctn);

        // View all only if there are actually more stores: 
        if($topPTMoreStore.length) {
            $sctn.append($viewAll);
        }

        return $sctn;
    }
}

function fetchTopPriceTableData() {
    if($('.prc-tbl').length) {
        var $topPriceTable = $('.prc-tbl'),
            $rows = $topPriceTable.find('.prc-tbl__row'),
            storesData = [];

        if($rows) {
            $rows.each(pushTopStoresData);
        }

        return {
            product: $('.prdct-dtl__ttl').text() + $('.prdct-dtl__ttl-vrnt').text(),
            productImage: $('.prdct-dtl__img').attr('src'),
            stores: storesData
        }
    }

    // *************

    function pushTopStoresData(idx, store) {
        var _$store = $(store),
            _gtsURL = _$store.find('.js-prc-tbl__gts-btn').attr('data-url'),
            newUrlObj = new Url(_gtsURL);
        storesData.push({
            storeName: newUrlObj.getAQueryParam('store'),
            price: _$store.find('.prc-tbl__prc').text().trim(), // saving price as text (rupee + commas)
            gtsURL: _gtsURL,
            classes: _$store.find('.js-prc-tbl__gts-btn').attr('class').match(/js[^\s]*/g, '').join(' ')
        });
    }
}

function updateSidebarPriceTable() {
    var $newSidebarSection = createSidebarPriceTable(fetchTopPriceTableData());
    if($('.cols1-prdcts').length) {
        $('.cols1-prdcts').remove();
    }
    $('.main-wrpr__cols1').prepend($newSidebarSection);
}

/*
 * Throttled sidebar scroller for pdp pages (holds pricetable info)
 */
(function sidebarScrollerPDP() {
    "use strict";

    var $mainWrapper = $('.main-wrpr'),
        mainTop = $mainWrapper.offset().top,
        mainLeft = $mainWrapper.offset().left,
        $sidebar = $('.js-pdp-sidebar'),
        $mainCol3 = $('.main-wrpr__cols3'),
        mainCol3Width = $mainCol3.width(),
        $mainCol1 = $('.main-wrpr__cols1'),
        $ftr = $('.ftr'),
        storesInfo = fetchTopPriceTableData();

    if(!storesInfo) {
        return;
    } else {
        $mainCol1.prepend(createSidebarPriceTable(storesInfo));
        $sidebar.css('left', (mainLeft + mainCol3Width) + 'px');
        Modules.$win.scroll(Modules.throttle(sidebarScrollEvent, 100));
    }

    // ********************

    function sidebarScrollEvent() {
        var $win = $(this),
            winTop = $win.scrollTop(),
            winHeight = $win.height(),
            padding = 100;
        if(winTop - padding > mainTop) {
            if(!(winTop + winHeight > $ftr.offset().top)) {
                showSidebar();
            } else {
                hideSidebar();
            }
        } else {
            hideSidebar();
        }
    }
    function showSidebar() {
        $sidebar.addClass('main-wrpr__cols1--fixed');
        if(!$sidebar.is(":visible")) {
            $sidebar.show();
        }
    }
    function hideSidebar() {
        $sidebar.removeClass('main-wrpr__cols1--fixed');
        if($sidebar.is(":visible")) {
            $sidebar.hide();   
        }
    }
})(); // end sidebar pdp IIFE
function jsAppend(js_file) {
    var js_script = document.createElement("script");
    js_script.type = "text/javascript";
    js_script.src = "https://www.mysmartprice.com/mobile/js/" + js_file;
    document.getElementsByTagName("head")[0].appendChild(js_script);
}

// Alternate text for image
function handleImageError(img) {
    var $img = $(img);
    if ($img.attr("alt"))
        $img.replaceWith("<div class='str-name'>" + $img.attr("alt") + "</div>");
}

function hideImage(img) {
    $(img).hide();
}

//Collapse lengthy offers on top section for NC only
(function() {
    if ($(".prdct-dtl__ttl").data("page-type") == "nc") {
        if ($(".prdct-dtl__str-offr li").length > 2) {
            $(".prdct-dtl__str-offr li:nth-child(2)").append("<span class='prdct-dtl__shw-ofr js-show-offer'>Show More</span>")
        };

        Modules.$doc.on("click", ".js-show-offer", function() {
            var linkText = $(this).text().trim(),
                newText, index;
            $(".prdct-dtl__offr-sctn").toggleClass("prdct-dtl__offr-sctn--expnd");
            if (linkText.toLowerCase() == "show more") {
                newText = "Show Less";
                index = $(".prdct-dtl__str-offr li").length;
            } else {
                newText = "Show More";
                index = 2;
            }
            $(this).remove();
            $(".prdct-dtl__str-offr li:nth-child(" + index + ")").append("<span class='prdct-dtl__shw-ofr js-show-offer'>" + newText + "</span>")
        });
    }
})();


Modules.$doc.on("click", ".prc-grid__no-stck-sbmt", function() {
    var $inputField = $(this).prev(".prc-grid__no-stck-inpt"),
        $form = $(this).closest(".prc-grid__no-stck-form"),
        $errorNode = $form.find(".js-vldtn-err"),
        capturePoint = $(this).data("capture-point");
    MSP.utils.validate.form([{
        "type": "email",
        "inputField": $inputField,
        "errorNode": $errorNode
    }]).done(function() {
        $.ajax({
            "url": "/price_alert/capture_email.php",
            "data": {
                "email": $inputField.val(),
                "mspid": PriceTable.dataPoints.mspid,
                "capture_point": capturePoint,
                "popupname": "pricealert"
            }
        });
        $form.hide();
        $form.siblings(".prc-grid__no-stck-scs").fadeIn();
        $form.siblings(".prc-grid__no-stck-sub").hide();
    });
    return false;
});

// show more techspecs.
if ($(".prdct-dtl__spfctn-more-wrpr").length) {
    Modules.$doc.on("click", ".js-prdct-dtl__spfctn-show-more, .js-prdct-dtl__spfctn-show-less", function() {
        var delay = $(this).hasClass("js-prdct-dtl__spfctn-show-less") ? 400 : 0;
        setTimeout(function() {
            $(".js-prdct-dtl__spfctn-show-more").toggle();
        }, delay);
        $(".prdct-dtl__spfctn-more-wrpr").toggleClass("prdct-dtl__spfctn-more-wrpr--show");
    });
}

Modules.$doc.on("click", ".js-xpnd-prc-box-item", function() {
    var $this = $(this),
        $thisItem = $this.closest(".prdct-dtl__box-item");
    if (!$thisItem.hasClass("prdct-dtl__box-item--open")) {
        var $openItem = $(".prdct-dtl__box-item--open");
        if ($openItem.length) {
            $openItem.removeClass("prdct-dtl__box-item--open").find(".prdct-dtl__box-btm").slideUp("fast");
        }
        $this.siblings(".prdct-dtl__box-btm").slideDown("fast");
        $thisItem.addClass("prdct-dtl__box-item--open");
        if (window.ga && $thisItem.hasClass("prdct-dtl__box-item--ofln")) {
            ga("send", "event", "Offline", "CPL Clicks Tech 1", PriceTable.dataPoints.mspid + "");
        }
    }
});

// Multiple Image Show on Top Section - Start
$(".prdct-dtl__thmbnl").on("mouseenter", function(e) {
    var $thumbnailImage = $(this).find(".prdct-dtl__thmbnl-img"),
        newSrc = $thumbnailImage.attr("src"),
        thumbId = $thumbnailImage.data("thumb-id");

    //Destination Image
    $(".prdct-dtl__img").attr("src", newSrc).data("thumb-id", thumbId).data("media_position",thumbId);
    //$(".prdct-dtl__img").attr("src", newSrc).data("thumb-id", thumbId);
    $(".prdct-dtl__img-wrpr").data("href", $(this).data("href"));

    $(".prdct-dtl__thmbnl").removeClass("prdct-dtl__thmbnl--slctd");
    $(this).addClass("prdct-dtl__thmbnl--slctd");
});
$(".prdct-dtl__thmbnl-wrpr").on("mouseleave", function(e) {
    var newSrc = $(".prdct-dtl__img").data("image");
    $(".prdct-dtl__img").attr("src", newSrc);
});
$(".prdct-dtl__img-wrpr, .prdct-dtl__thmbnl").on("click", function(e) {
    
    //Params to work with NC
    var videoUrl = $(this).parent().data("video-id") ? $(this).parent().data("video-id").trim() : "";
    var maxThumbs = videoUrl ? ($(".prdct-dtl__thmbnl-wrpr .prdct-dtl__thmbnl").length - 1) : ($(".prdct-dtl__thmbnl-wrpr .prdct-dtl__thmbnl").length);
    //Params for Comp redesigned popup
    var offset_media_key = $(this).find("img").data("media_key");
    var offset_media_position = $(this).find("img").data("media_position");
    var query = [
        'mspid=' + $(".prdct-dtl__ttl").data("mspid"),
        'offset_media_key='+offset_media_key,
        'offset_position=' + offset_media_position,
        /*Params to work with old popup in NC*/
        'primaryThumb=' + $(".prdct-dtl__img").data("image"),
        'maxThumbs=' + maxThumbs,
        'thumbId=' + $(".prdct-dtl__img").data("thumb-id"),
        'videoUrl=' + videoUrl
    ].join("&");
    var images_popup = $(".prdct-dtl__thmbnl").data("href");
    openPopup("/mobile/"+images_popup+"?" + query);
});
// Multiple Image Show on Top Section - End

// save to list button handlers - start 
Modules.$doc.on('click', ".prdct-dtl__save", function(e) {
    loginCallback(function() {
        $(".prdct-dtl__save").addClass("prdct-dtl__save--svd");
        $.get("/users/add_to_list.php", {
            mspid: PriceTable.dataPoints.mspid
        }, function(data) {});
    });
    return false;
});

Modules.$doc.on("click", ".js-user-lgt", function(e) {
    $(".prdct-dtl__save").removeClass("prdct-dtl__save--svd");
});
// save to list button handlers - end

// Extension install cashback offer for products (incl. mobile category)
if(Modules.isInstalled()) {
    if (!$(".prdct-dtl__offr-sctn li").length) {
        $(".prdct-dtl__offr-sctn").hide();
    }

    // if the extension is not installed
    // and it is an upcoming mobile page
    // show install extension link
    // hide notify me widget
    if($(".prc-grid__upcmng-mbl").length) {
        $(".prc-grid__upcmng-mbl").removeClass("hide");
        $(".prc-grid__instl-extnsn").addClass("hide");
    }
} else {
    if ($(".prdct-dtl__ttl").data("page-type") == "nc") {
        if(dataLayer[0]['min-price-store'] === 'amazon') {
            return;
        }
        $(".prdct-dtl__coin-wrpr").after([
            "<div>",
            $(".prdct-dtl__coin-wrpr").length ? "Extra <strong>upto 25% cashback</strong>" : "<strong>Upto 25% cashback</strong>",
            " on adding our Chrome extension",
            " <span class='help-icon js-tltp' data-tooltip='Maximum cashback of &#8377;100'>i</span>",
            " <span class='text-link js-add-chrome'><strong>Know more</strong></span>",
            "</div>"
        ].join(""));
        ga("send", "event", "NC", "nc_single_pv", "js-log-nc", { nonInteraction: true });
    } else {
        if(dataLayer[0]['min-price-store'] === 'amazon') {
            if($('.prdct-dtl__offr-sctn li').length === 0) {
                $('.prdct-dtl__offr-sctn').remove();
            }
            return;
        }
        $(".prdct-dtl__offr-sctn").append([
            "<ul><li>",
            $(".prdct-dtl__coin-wrpr").length ? "Extra <strong>upto 25% cashback</strong>" : "<strong>Upto 25% cashback</strong>",
            " on adding our Chrome extension",
            " <span class='help-icon js-tltp' data-tooltip='Maximum cashback of &#8377;100'>i</span>",
            " <span class='text-link js-add-chrome'><strong>Know more</strong></span>",
            "</li></ul>"
        ].join(""));
        window.ga && ga("send", "event", "Comparables", "comparables_single_pv", "js-log-comparables", { nonInteraction: true });
    }
}

// Windows App popup event handlers:     
$(document).on('click', '.js-windows-app', function(e) {
    e.preventDefault();
    initWindowsAppDownload($(this).data('url'));
    $('.prdct-dtl__box-GTS:not(.js-inpg-link), .bttn--gts').addClass('js-prc-tbl__gts-btn').removeClass('js-windows-app');
    return false;
});
/* RUI:: save product item button - start */
Modules.$doc.on('mousedown', '.js-save-btn', function() {
    var $this = $(this),
        mspid = $this.closest(".prdct-item").data("mspid") || $(".prdct-dtl__ttl").data("mspid");

    if (!mspid) {
        return false;
    }

    if (!$this.hasClass("prdct-item__save-btn--svd")) {
        loginCallback(saveProduct, this, [mspid, $this]);
    }

    return false;
});
/* RUI:: save product item button - start */
if($('.list-main').length) {
    var ListPage = {
        "settings": {
            "filterLength": 8
        },
        "controller": {
            "init": function() {
                var lp_changes = ListPage.model.params.changes,
                    lp_defaults = ListPage.model.params.defaults,
                    lp_current = ListPage.model.params.current,
                    lp_page = ListPage.model.params.page,
                    lp_clipboard = ListPage.model.clipboard;

                // get page params and default values to get default filters to be applied.
                ListPage.controller.getDefaults();

                ListPage.controller.updatePage();


                $(document).on('click', '.js-load-more', function() {
                    lp_clipboard.scroll.isTrigger = true;
                    lp_clipboard.scroll.isLoading = true;
                    lp_clipboard.scroll.counter++;
                    ListPage.controller.updatePage();
                });

                

                // Add listeners to all inputs for applying or removing filters
                ;(function addActionListeners() {
                    var filterGroupQueue = [],
                        listenerTypes = [
                            ".fltr:not([data-groupname='price']) .js-fltr-val--mltpl input:not([disabled])",
                            ".fltr:not([data-groupname='price']) .js-fltr-val--sngl input:not([disabled])",
                            ".fltr[data-groupname='price'] .js-fltr-val--sngl input:not([disabled])"
                        ];


                    // globalSearch is comes from from hash so no listener.

                    // localSearch within the loaded product list
                    $('.list-hdr-srch').on('submit', function() {
                        var localSearch = $.trim($(this).find('.list-hdr-srch__fld').val());
                        if (localSearch !== "") {
                            lp_changes.add.ss = localSearch;
                        } else if (lp_clipboard.prevLocalSearch) {
                            lp_changes.remove.ss = lp_clipboard.prevLocalSearch;
                        } else {
                            return false;
                        }

                        lp_changes.inFilterBox = false;
                        ListPage.controller.updatePage();
                        return false;
                    });

                    $('.list-hdr-srch__btn').on("click", function() {
                        $('.list-hdr-srch').submit();
                    });

                    // onclick a non-price multi value filter.
                    Modules.$doc.on("click", ".fltr:not([data-groupname='price']) .js-fltr-val--mltpl input:not([disabled])", function() {
                        var groupName = $(this).closest(".fltr").data("groupname");

                        if (filterGroupQueue.length === 0) {
                            $.merge(filterGroupQueue, $(this));
                        }
                        $(filterGroupQueue).each(function(i, item) {
                            var context = (!lp_current.property || lp_current.property.indexOf($(item).attr("value")) === -1) ? "add" : "remove",
                                changes = lp_changes[context];

                            changes.property = changes.property || [];
                            changes.property.push($(item).attr("value"));
                        });
                        filterGroupQueue = [];

                        lp_changes.inFilterBox = true;
                        ListPage.controller.updatePage();
                        ListPage.controller.redirectPage();
                    });

                    // onclick a non-price single value filter.
                    Modules.$doc.on("click", ".fltr:not([data-groupname='price']) .js-fltr-val--sngl input:not([disabled])", function() {
                        var groupName = $(this).closest(".fltr").data("groupname");
                        if (filterGroupQueue.length === 0) {
                            $.merge(filterGroupQueue, $(this).closest(".fltr").find(".fltr-val__inpt:checked"));
                        }
                        $(filterGroupQueue).each(function(i, item) {
                            var context = lp_current[groupName] !== $(item).attr("value") ? "add" : "remove",
                                changes = lp_changes[context];
                            //var groupName = "";
                            changes[groupName] = $(item).attr("value");
                        });
                        filterGroupQueue = [];

                        lp_changes.inFilterBox = true;
                        ListPage.controller.updatePage();
                        ListPage.controller.redirectPage();
                    });

                    // onclick a price single value filter.
                    Modules.$doc.on("click", ".fltr[data-groupname='price'] .js-fltr-val--sngl input:not([disabled])", function() {
                        var filterVal = $(this).attr("value"),
                            values = filterVal.split(";"),
                            minPrice = parseInt(values[0], 10),
                            maxPrice = parseInt(values[1], 10),
                            context = (lp_current.price !== $(this).attr("value")) ? "add" : "remove",
                            displayPrices = {};

                        $.extend(lp_changes[context], {
                            "price": minPrice + ";" + maxPrice
                        });

                        lp_changes.inFilterBox = true;
                        ListPage.controller.updatePage();
                        ListPage.controller.redirectPage();
                    });

                    // clear all apllied filters in a filtergroup
                    Modules.$doc.on("click", ".fltr__cler", function() {
                        var $currentGroup = $(this).closest(".fltr"),
                            groupname = $currentGroup.data("groupname"),
                            $activeFilters = $currentGroup.find(".fltr-val__inpt:checked");
                        if (groupname === "price") {
                            $.extend(lp_changes.remove, {
                                "price": lp_clipboard.prevMinPrice + ";" + lp_clipboard.prevMaxPrice
                            });

                            lp_changes.inFilterBox = true;
                            ListPage.controller.updatePage();
                        } else {
                            $.merge(filterGroupQueue, $currentGroup.find("input:checked"));
                            $activeFilters.eq(0).click();
                        }

                        //Hide SEO Text
                        $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").hide();

                    });

                    //Add event to window scroll (To load more pages)
                    if (lp_clipboard.pageType === "nc") {
                        $(window).on("scroll", function(e) {
                            var $docheight = $(document).height();
                            var productCount = parseInt($(".js-prdct-cnt__rng").html().split("-")[1]);
                            var totalProducts = parseInt($(".js-prdct-cnt__totl").html());

                            if ($docheight - $(e.target).scrollTop() < 1800) {
                                if (lp_clipboard.scroll.isEnabled && !lp_clipboard.scroll.isLoading && lp_clipboard.scroll.counter < 3 && productCount<totalProducts) {
                                    if (lp_clipboard.scroll.isAutoLoad) {
                                        lp_clipboard.scroll.counter++;
                                        lp_clipboard.scroll.isTrigger = true;
                                        lp_clipboard.scroll.isLoading = true;
                                        lp_clipboard.isOnLoad = false;
                                        ListPage.controller.updatePage();
                                    }
                                }
                            }
                        });
                    }

                    // edit min and max price numbers in inputfiled
                    Modules.$doc.on("change", ".js-fltr-prc__inpt-min, .js-fltr-prc__inpt-max", function() {
                        $(".fltr-val__inpt[name=price]").prop('checked', false);
                        var numRegEx = /^[0-9]+$/,
                            $minPriceInpt = $(".js-fltr-prc__inpt-min"),
                            $maxPriceInpt = $(".js-fltr-prc__inpt-max"),
                            minPrice = $minPriceInpt.val(),
                            maxPrice = $maxPriceInpt.val(),
                            lp_clipboard = ListPage.model.clipboard;

                        if (numRegEx.test(minPrice) && numRegEx.test(maxPrice)) {
                            minPrice = parseInt(minPrice, 10);
                            maxPrice = parseInt(maxPrice, 10);
                            if (minPrice < maxPrice) {
                                if (minPrice < lp_defaults.priceMin) {
                                    minPrice = lp_defaults.priceMin;
                                    $minPriceInpt.val(minPrice);
                                }
                                if (maxPrice > lp_defaults.priceMax) {
                                    maxPrice = lp_defaults.priceMax;
                                    $maxPriceInpt.val(maxPrice);
                                }
                                if (minPrice !== lp_defaults.priceMin || maxPrice !== lp_defaults.priceMax) {
                                    // if new price range is subset of total range then apply filter
                                    $.extend(lp_changes.add, {
                                        "price": minPrice + ";" + maxPrice
                                    });
                                } else {
                                    // if new price range is total range then remove existing price filter.
                                    $.extend(lp_changes.remove, {
                                        "price": lp_clipboard.prevMinPrice + ";" + lp_clipboard.prevMaxPrice
                                    });
                                }

                                lp_changes.inFilterBox = true;
                                ListPage.controller.updatePage();
                                return;
                            }
                        }
                        $minPriceInpt.val(lp_clipboard.prevMinPrice);
                        $maxPriceInpt.val(lp_clipboard.prevMaxPrice);
                    });

                    ;(function AppliedFilterHandler() {
                        var remfilterQueue = [];

                        function removeAppliedFilters() {
                            var filterVal, $filterItem, minPrice, maxPrice;

                            // batch changes(DOM write operatations ie. to uncheck filters/remove tags) to trigger only one render operation.
                            $.each(remfilterQueue, function(i, filter) {
                                if ($(filter).closest(".js-fltrs-apld").data("groupname") === "searchTerm") {
                                    lp_changes.remove.s = $(filter).data("value");
                                } else if ($(filter).closest(".js-fltrs-apld").data("groupname") === "localSearch") {
                                    lp_changes.remove.ss = $(filter).data("value");
                                } else if ($(filter).closest(".js-fltrs-apld").data("groupname") === "price") {
                                    lp_changes.remove.price = $(filter).data("value");
                                } else if ($(filter).closest(".js-fltrs-apld").data("groupname") === "discount") {
                                    lp_changes.remove.discount = $(filter).data("value");
                                } else {
                                    filterVal = $(filter).data("value");
                                    $filterItem = $('.fltr-val__inpt[value="' + filterVal + '"]').closest(".fltr-val");

                                    lp_changes.remove.property = lp_changes.remove.property || [];
                                    lp_changes.remove.property.push($filterItem.find("input").attr("value")?$filterItem.find("input").attr("value"):filterVal);
                                }
                            });
                            remfilterQueue = [];

                            lp_changes.inFilterBox = false;
                            ListPage.controller.updatePage();
                        }

                        // remove applied filter by clicking tags shown above product list.
                        $(".js-fltrs-apld-wrpr1").on("click", ".js-fltrs-apld__item", function removeTag() {
                            $.merge(remfilterQueue, $(this));
                            removeAppliedFilters();
                        });

                        // remove applied filter by clicking tags shown above product list.
                        $(".js-fltrs-apld-wrpr1").on("click", ".js-fltrs-apld__lbl", function removeGroup() {
                            $.merge(remfilterQueue, $(this).closest(".js-fltrs-apld").find(".js-fltrs-apld__item"));
                            removeAppliedFilters();
                        });

                        $(".js-fltrs-apld-wrpr1").on("mouseover", ".js-fltrs-apld__lbl", function() {
                            $(this).closest(".js-fltrs-apld").addClass("js-fltrs-apld--strk");
                        }).on("mouseout", ".js-fltrs-apld__lbl", function() {
                            $(this).closest(".js-fltrs-apld").removeClass("js-fltrs-apld--strk");
                        });

                        $(".js-fltrs-apld-wrpr1").on("click", ".js-fltrs-apld-cler", function removeAll() {
                            $(".js-fltrs-apld__item").each(function() {
                                $.merge(remfilterQueue, $(this));
                            });
                            removeAppliedFilters();
                        });
                    }());

                    // sorting options.
                    Modules.$doc.on("change", ".js-list-sort", function() {
                        var sortVal = $(this).val();
                        lp_changes.add.sort = sortVal;

                        lp_changes.inFilterBox = false;
                        ListPage.controller.updatePage();
                    });

                    // pagination.
                    Modules.$doc.on("click", ".js-pgntn__item", function() {
                        if (!$(this).hasClass("pgntn__item--crnt")) {
                            var pgno = $(this).data("pgno");
                            lp_changes.add.page = pgno;

                            lp_changes.inFilterBox = false;
                            ListPage.controller.updatePage();
                        }
                        return false;
                    });
                }());
            },
            "getDefaults": function() {
                var lp_defaults = ListPage.model.params.defaults,
                    lp_clipboard = ListPage.model.clipboard,
                    pageParams = (function() {
                        var $bodyWrapper = $(".body-wrpr"),
                            params = {},
                            startInr, endInr;

                        if ($bodyWrapper.data("refurb")) {
                            params.refurb = $bodyWrapper.data("refurb");
                        }
                        if ($bodyWrapper.data("category") && $bodyWrapper.data("page-type") != "nc") {
                            params.subcategory = $bodyWrapper.data("category");
                        }
                        if ($bodyWrapper.data("start_price") || $bodyWrapper.data("end_price")) {
                            startInr = parseInt($bodyWrapper.data("start_price") || $(".js-fltr-prc__inpt-min").attr("val"), 10);
                            endInr = parseInt($bodyWrapper.data("end_price") || $(".js-fltr-prc__inpt-max").attr("val"), 10);
                            params.price = startInr + ";" + endInr;
                        }
                        if ($bodyWrapper.data("brand")) {
                            params.property = params.property || "";
                            params.property += $(".fltr-val__inpt[dispname='" + $bodyWrapper.data("brand") + "']").attr("value") + "|";
                        }
                        if ($bodyWrapper.data("property")) {
                            params.property = params.property || "";
                            params.property += $bodyWrapper.data("property") + "|";
                        }
                        if ($bodyWrapper.data("properties")) {
                            params.property = params.property || "";
                            params.property += $bodyWrapper.data("properties");
                        }
                        if ($bodyWrapper.data("discount")) {
                            params.discount = $bodyWrapper.data("discount");
                        }
                        if (params.property) {
                            params.property = $.grep(params.property.split("|").sort(), function(e, i) {
                                return (e !== "");
                            });
                        }

                        return params;
                    }());

                $.extend(ListPage.model.params.page, pageParams);

                // get supported values of min and max price values by the slider.
                $.extend(lp_defaults, {
                    "priceMin": parseInt($(".fltr-prc__sldr").attr("value").split(";")[0], 10),
                    "priceMax": parseInt($(".fltr-prc__sldr").attr("value").split(";")[1], 10)
                });

                // store inital values as previous values when values change.
                $.extend(lp_clipboard, {
                    "prevMinPrice": lp_defaults.priceMin,
                    "prevMaxPrice": lp_defaults.priceMax,
                    "pageType": $(".body-wrpr").data("page-type"),
                    "pageName": $(".body-wrpr").data('page-name')
                });
            },
            "redirectPage": function(){
                
                if(ListPage.model.clipboard.pageType ==="nc-filter"){
                    window.location.href = "//mysmartprice.com"+"/"+dataLayer[0].category+"/"+dataLayer[0].subcategory+ListPage.model.URLParams+"&ref=config_page";
                }
            },
            // once changes are update the page state before rendering the view.
            "updatePage": function() {
                var lp_current = ListPage.model.params.current,
                    lp_changes = ListPage.model.params.changes,
                    lp_defaults = ListPage.model.params.defaults,
                    lp_page = ListPage.model.params.page,
                    lp_clipboard = ListPage.model.clipboard,
                    lp_services = ListPage.services,
                    initHash, prop_strings;

                lp_clipboard.isOnLoad = $.isEmptyObject(lp_current);
                
                // Clear list page deals countdown timer
                clearInterval(timerInterval);

                if (!lp_clipboard.isOnLoad) {
                    if (lp_clipboard.pageType === "nc" && !lp_current.subcategory) {
                        lp_changes.add.subcategory = $(".body-wrpr").data("category");
                    }
                    //apply additions in current state params
                    $.each(lp_changes.add, function(key) {
                        if (key === "property") {
                            if ($.isArray(lp_changes.add.property)) {
                                lp_current.property = $.isArray(lp_current.property) ? lp_current.property : [];
                                $.merge(lp_current.property, lp_changes.add.property);
                            }
                        } else {
                            lp_current[key] = lp_changes.add[key];
                        }
                    });
                    //apply deletions in current state params
                    $.each(lp_changes.remove, function(key) {
                        var index;
                        if (key === "property") {
                            $.each(lp_changes.remove.property, function(i, removedProperty) {
                                index = lp_current.property.indexOf(removedProperty);
                                lp_current.property.splice(index, 1);
                            });
                            if (lp_current.property.length === 0) {
                                delete lp_current.property;
                            }
                        } else {
                            delete lp_current[key];
                        }
                    });
                } else {
                    // if isOnLoad get current params from url hash.

                    var urlQuery = "";

                    if (lp_clipboard.pageType === "nc") {
                        urlQuery = window.location.href.split("?")[1];
                    } else {
                        urlQuery = window.location.hash.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    }

                    $.extend(lp_current, lp_services.filterURL.toParams(urlQuery));

                    ;(function() {
                        var currentLength = 0;
                        $.each(lp_current, function() {
                            currentLength++;
                        });

                        // if no hash or if its a quicklink page inherit page params.
                        if (currentLength === 0 || lp_current.ql === "1") {
                            $.each(lp_page, function(param, pageParamValue) {
                                if ($.isArray(pageParamValue)) {

                                    lp_current[param] = $.isArray(lp_current[param]) ? lp_current[param] : [];

                                    $.each(pageParamValue, function(i, prop) {
                                        if (lp_current[param].indexOf(prop) === -1) {
                                            lp_current[param].push(prop);
                                        }
                                    });
                                } else {
                                    lp_current[param] = pageParamValue;
                                }
                            });
                            delete lp_current.ql;
                        }

                        // since every registered params on current is new add them to changes also.
                        $.each(lp_current, function(key) {
                            lp_changes.add[key] = lp_current[key];
                        });
                    }());

                    lp_current.subcategory = lp_current.subcategory || lp_page.subcategory;
                    lp_clipboard.isLoadParamsEqualtoPageParams = (ListPage.services.filterURL.fromParams(lp_current) === ListPage.services.filterURL.fromParams(lp_page));

                    // nc filter not working if there isn't any query with url
                    if(lp_clipboard.pageType === "nc" && ListPage.services.filterURL.fromParams(lp_current) === "")
                        lp_clipboard.isLoadParamsEqualtoPageParams = false;

                    ListPage.view.init();
                }

                //generate new hash, and start view rendering.
                ListPage.model.URLParams = ListPage.services.filterURL.fromParams(lp_current);
                if(lp_clipboard.pageType!=="nc-filter"){
                    ListPage.view.render();
                }
            }
        },
        "model": {
            "URLParams": "",
            "params": {
                "current": {},
                /* {
                    "s" : "", //globalSearch
                    "ss" : "", //localSearch
                    "subcategory" : "",
                    "price" : startInr + ";" + endInr,
                    "property" : [],
                    "sort" : "",
                    "page" : "" //pagination no
                } */
                "changes": {
                    "add": {},
                    "remove": {},
                },
                "page": {},
                "defaults": {}
            },
            // mode of tranferring valued from one component(M, V, C) to another.
            "clipboard": {
                "prevMinPrice": "",
                "prevMaxPrice": "",
                "slider": {},
                "prevLocalSearch": "",
                "pageType": "",
                "pageName" : "",
                "scroll": {
                    "isAutoLoad": true,
                    "isEnabled": true,
                    "counter": 0,
                    "isLoading": false,
                    "isTrigger": false
                }
            }
        },
        "services": {
            "filterURL": {
                "toParams": function(filterURL) {

                    var separator = ListPage.model.pageType == "nc" ? "?" : "#";

                    var params = {},
                        prop_strings = decodeURIComponent(filterURL).replace(separator, "").split("&");

                    if (prop_strings[0] !== "") {
                        $.each(prop_strings, function(i, prop_string) {
                            params[prop_string.split("=")[0]] = prop_string.split("=")[1];
                        });

                        if ("property" in params) {
                            params.property = $.grep(params.property.split("|").sort(), function(e, i) {
                                return (e !== "");
                            });
                        }

                        if (params.startinr !== params.priceMin || params.endinr !== params.priceMax) {
                            params.price = parseInt(params.startinr, 10) + ";" + parseInt(params.endinr, 10);
                        }

                        delete params.startinr;
                        delete params.endinr;
                    }

                    return params;
                },
                "fromParams": function(params) {
                    var pageType = $(".body-wrpr").data("page-type"),
                        separator = (pageType == "nc" || pageType == "nc-filter") ? "?" : "#",
                        URLParams = [],
                        filterURL;

                    $.each(params, function(key) {
                        var value;
                        if (params[key]) {
                            if (pageType == "nc" && key === "subcategory") {
                                URLParams.unshift(key + "=" + params[key]); // 'subcategory' should always be the first param in NC
                            }
                            else if (key === "price") {
                                URLParams.push("startinr=" + params[key].split(";")[0]);
                                URLParams.push("endinr=" + params[key].split(";")[1]);
                            }
                            else if (key === "property") {
                                URLParams.push(key + "=" + params[key].join("|"));
                            }
                            else {
                                URLParams.push(key + "=" + params[key]);
                            }
                        }
                    });

                    filterURL = URLParams.length > 0 ? separator + URLParams.join("&") : "";

                    return filterURL;
                }
            },
            "fetch": {
                // generate query from all the new page state params
                "apiQuery": function(params) {
                    var subCategory = ListPage.model.clipboard.pageType === "nc"? (subCategory = $(".body-wrpr").data("category")):params.subcategory;

                    return [
                        "subcategory=" + subCategory,
                        params.category ? ("&category=" + params.category) : "",
                        params.refurb ? ("&refurb=" +params.refurb) : "",
                        params.s ? ("&s=" + params.s) : "",
                        params.property ? ("&property=" + params.property.join("|")) : "",
                        params.price ? ("&startinr=" + params.price.split(";")[0]) : "",
                        params.price ? ("&endinr=" + params.price.split(";")[1]) : "",
                        params.sort ? ("&sort=" + params.sort) : "",
                        params.ss ? ("&ss=" + params.ss) : "",
                        params.page ? ("&page=" + params.page) : "",
                        params.start ? ("&start=" + params.start) : "",
                        params.rows ? ("&rows=" + params.rows) : "",
                        params.discount ? ("&discount=" + params.discount) : "",
                        params.pageName ? ("&pageName=" + params.pageName) : "",
                        params.source ? ("&source=" + url.getAQueryParam('source')) : ""
                    ].join("");
                },
                "productList": Modules.memoize(function(currentParams) {
                    var dfd = $.Deferred(),
                        query = this.apiQuery(currentParams),
                        _productList = ListPage.services.fetch.productList;

                    if (_productList.XHR) _productList.XHR.abort();


                    var service_url = "";

                    if (ListPage.model.clipboard.pageType === "nc") {
                        service_url = "/fashion/filters/filter_get_redesign?" + query;
                if(window.location.href.indexOf("bestsellers") > -1){
                 service_url = "/fashion/bestsellers_filters/filter_get_redesign?" + query; 
                }
                    } else {
                        service_url = ($('.list-main').length ? '/msp/processes/property/api/msp_get_html_for_property_new.php?' : '/msp/search/msp_search_new.php?') + query;
                        log_data('property_info',{'subcategory':currentParams.subcategory,'property':query}, service_url);
                    }

                    //For Refurbished products
                    if(currentParams.refurb==1) {
                        service_url = ($('.list-main').length ? '/msp/processes/property/api/msp_get_html_for_property_refurb.php?' : '/msp/search/msp_search_new.php?') + query;
                    }
                    _productList.XHR = $.ajax({
                        url: service_url,
                    }).done(function(response) {
                        dfd.resolve(response);
                    }).fail(function(error) {
                        dfd.reject(error);
                    });

                    return dfd.promise();
                }, {
                    "cacheLimit": 15
                }),
                // hourly deals ajax loading
                "hourlyDeals": Modules.memoize(function(currentParams) {
                    var dfd = $.Deferred(),
                        query = this.apiQuery(currentParams),
                        _hourlyDeals = ListPage.services.fetch.hourlyDeals;

                    if (_hourlyDeals.XHR) _hourlyDeals.XHR.abort();

                    _hourlyDeals.XHR = $.ajax({
                        "url": "/msp/autodeals/hourly_deals.php?" + query
                    }).done(function(response) {
                        dfd.resolve(response);
                    }).fail(function(error) {
                        dfd.reject(error);
                    });

                    return dfd.promise();
                }, {
                    "cacheLimit": 15
                })
            }
        },
        "view": {
            "init": function() {
                var lp_current = ListPage.model.params.current,
                    lp_defaults = ListPage.model.params.defaults;

                ListPage.view.filterPlugins.init({
                    "priceSlider": {
                        "min": lp_current.price ? lp_current.price.split(";")[0] : lp_defaults.priceMin,
                        "max": lp_current.price ? lp_current.price.split(";")[1] : lp_defaults.priceMax
                    }
                });
            },
            "render": function() {
                var lp_current = ListPage.model.params.current,
                    lp_changes = ListPage.model.params.changes,
                    lp_defaults = ListPage.model.params.defaults,
                    lp_page = ListPage.model.params.page,
                    lp_clipboard = ListPage.model.clipboard,
                    lp_filterPlugins = ListPage.view.filterPlugins,
                    pushStateValue = ListPage.model.URLParams,
                    filterControls;


                if (lp_clipboard.pageType === "nc") {
                    if(pushStateValue === "")
                        pushStateValue = window.location.pathname;
                    window.history.pushState("", "Filters", pushStateValue);
                } else if(lp_clipboard.pageType === "nc-filter"){
                    // TODO: Skip for now. Add any hash changes required on Configured Filter Page
                } else {
                    window.location.hash = ListPage.model.URLParams;
                }

                if (lp_clipboard.isOnLoad) {
                    $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").show();
                }
                if (ListPage.services.filterURL.fromParams(lp_current) !== ListPage.services.filterURL.fromParams(lp_page)) {
                    $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").hide();
                    $(".js-list-ttl").html($(".list-info__ttl").html());
                }

                if (lp_clipboard.pageType === "nc") {
                    if ($(".body-wrpr").data("indexed")) {
                        $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").show();
                    } else {
                        $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").hide();
                    }
                }

                ;(function updateProductListAndOtherWidgets() {
                    var lp_changes = $.extend({}, ListPage.model.params.changes),
                        lp_current = $.extend({}, ListPage.model.params.current),
                        loadingMaskHtml = ListPage.view.components.loadingMask(),
                        loadingMaskSmall = ListPage.view.components.loadingMaskSmall(),
                        loadingStart = +new Date();

                    if (lp_clipboard.pageType === "nc") {
                        if (!lp_clipboard.scroll.isLoading) {
                            lp_clipboard.scroll.counter = 0;
                        }

                        $.extend(lp_current, {
                            "start": lp_clipboard.scroll.counter * 24,
                            "rows": 24,
                            "pageName": lp_clipboard.pageName
                        });

                    }

                    // get new product list and filters based on updated current params
                    if (lp_clipboard.pageType === "nc" && lp_clipboard.isOnLoad){
                        //no rerender needed here 
                    }
                    // get new product list and filters based on updated current params
                    else if ($(".body-wrpr").length !== 0) {

                        if (!(lp_clipboard.isOnLoad && lp_clipboard.isLoadParamsEqualtoPageParams)) {

                            // if($(".js-fltr-ldng-mask").length !== 0)
                            if(lp_clipboard.scroll.isLoading || lp_clipboard.pageType == "search"){
                                $(".js-prdct-grid-wrpr").append(loadingMaskSmall);
                            }
                            else{
                                $(".js-prdct-grid-wrpr").append(loadingMaskHtml);    
                            }

                            $(".js-load-more").hide();
                            ListPage.services.fetch.productList(lp_current).done(function(response) {
                                var freshData = response.split("//&//#"),
                                    lp_filterPlugins = ListPage.view.filterPlugins;

                                //Remove No Data DOM
                                $(".prdct-grid__no-data").remove();
                                ListPage.model.params.current.page = undefined;

                                if (lp_changes.inFilterBox) {
                                    // manipulate loaded filter html
                                    var $newFilterBox = $(freshData[0]),
                                        $groupsToReplace,
                                        replacedGroups = [];

                                    $groupsToReplace = (function() {
                                        var affectedGroups = (function() {
                                            var result = [];
                                            $.each(["add", "remove"], function(i, context) {
                                                if ("price" in lp_changes[context]) {
                                                    result.push("price");
                                                }
                                                if ("property" in lp_changes[context]) {
                                                    $.each(lp_changes[context].property, function(i, propValue) {
                                                        var groupname = $(".fltr-val[value='" + propValue + "']").closest(".fltr").data("groupname");
                                                        result.push(groupname);
                                                    });
                                                }
                                            });
                                            return result;
                                        }());

                                        return $newFilterBox.find(".fltr").filter(function() {
                                            return affectedGroups.indexOf($(this).data("groupname")) === -1;
                                        });
                                    }());

                                    $groupsToReplace.each(function() {
                                        var $newFilterBlock = $(this),
                                            groupname = $newFilterBlock.data("groupname"),
                                            $exisingFilterBlock = $(".fltr[data-groupname='" + groupname + "']");
                                        replacedGroups.push(groupname);
                                        $exisingFilterBlock.replaceWith($newFilterBlock);
                                    });

                                    lp_filterPlugins.init({
                                        "priceSlider": {
                                            "min": lp_clipboard.slider.priceMin,
                                            "max": lp_clipboard.slider.priceMax
                                        }
                                    }, replacedGroups);
                                } else {
                                    // load new filters
                                    $(".fltr-wrpr1").html(freshData[0]);
                                    lp_filterPlugins.init({
                                        "priceSlider": {
                                            "min": lp_clipboard.slider.priceMin,
                                            "max": lp_clipboard.slider.priceMax
                                        }
                                    });
                                }

                                if (!lp_clipboard.isLoadParamsEqualtoPageParams || lp_clipboard.scroll.isLoading) {

                                    if (lp_clipboard.pageType === "nc") {
                                        $(".js-pgntn-cnt-ajax, .js-prdct-cnt-ajax").remove();

                                        if (lp_clipboard.scroll.isLoading) {
                                            $(".js-prdct-grid-wrpr").append(freshData[1]);
                                        } else {
                                            $(".js-prdct-grid-wrpr").html(freshData[1]);
                                        }

                                        //Update bottom pagination counter
                                        $(".js-pgntn-cnt__crnt").text($(".js-pgntn-cnt-ajax").data('current'));
                                        $(".js-pgntn-cnt__totl").text($(".js-pgntn-cnt-ajax").data('total'));

                                    } else {
                                        $(".js-prdct-grid-wrpr").html(freshData[1]);
                                    }

                                    //Update top left product counter
                                    var productCount = $(".js-prdct-cnt-ajax").data('count');
                                    var totalProducts = $(".js-prdct-cnt-ajax").data('total');

                                    if (productCount && productCount.split("-")[1] >= totalProducts) {
                                        $(".js-load-more").hide();
                                    }
                                    else {
                                        $(".js-load-more").show();   
                                    }


                                    $(".js-prdct-cnt__rng").text(productCount);
                                    $(".js-prdct-cnt__totl").text(totalProducts);
                                } else {
                                    lp_clipboard.isLoadParamsEqualtoPageParams = false;
                                }

                               if(ListPage.model.clipboard.pageType === "search"){
                                     $('.srch-fdbck').show();
                                }

                                lazyLoadImages();
                                lazyLoadBgImages();
                                attachFilterScroll();
                            }).always(function() {
                                var loadingTime = +new Date() - loadingStart,
                                    loadingMaskDelay = (loadingTime < 250) ? (250 - loadingTime) : 0;
                                ProductList.initGrid();

                                setTimeout(function() {
                                    $(".ldng-mask-wrpr").remove();
                                    $(".js-fltr-ldng-mask").remove();
                                }, loadingMaskDelay);

                                lp_clipboard.scroll.isLoading = false;
                            });
                        } else {
                            lp_clipboard.scroll.isLoading = false;
                            $(".js-fltr-ldng-mask").remove();
                            lp_clipboard.isLoadParamsEqualtoPageParams = false;
                        }
                    }

                    // get new hourly deals based on updated current params
                    if ($(".js-hrly-deals-grid").length) {
                        ;(function _getHourlyDeals() {
                            var $hourlyDealsWidget = $(".js-hrly-deals-grid");

                            ListPage.services.fetch.hourlyDeals(lp_current).done(function(html) {
                                var $timer, dataMinutes, dataSeconds, timerStart, clockStart,
                                    timerHtml = html.split("//&//#")[0],
                                    productsHtml = html.split("//&//#")[1];

                                function parseTime(value) {
                                    value = parseInt(value, 10);
                                    return (isNaN(value) || value < 0 || value > 59) ? 59 : value;
                                }

                                $hourlyDealsWidget.find(".sctn__inr").html(productsHtml);
                                $hourlyDealsWidget.find(".js-hrly-deals__cntdwn-wrpr").html(timerHtml);

                                if ($(productsHtml).filter(".prdct-item-with-bdg").length > 2) {
                                    $hourlyDealsWidget.find(".sctn__view-all-link").show();
                                } else {
                                    $hourlyDealsWidget.find(".sctn__view-all-link").hide();
                                }

                                $timer = $hourlyDealsWidget.find(".cntdwn");
                                if ($timer.length) {
                                    dataMinutes = parseTime($timer.find(".cntdwn__mins").data("minutes"));
                                    dataSeconds = parseTime($timer.find(".cntdwn__scnds").data("seconds"));
                                    timerStart = dataMinutes * 60 + dataSeconds;
                                    clockStart = parseInt(+new Date() / 1000, 10);

                                    if (!(dataMinutes === 0 && dataSeconds === 0)) {
                                        timerInterval = setInterval((function timer() {
                                            var elapsedTime = (Math.floor(+new Date() / 1000) - clockStart),
                                                minutes = Math.floor((timerStart - elapsedTime) / 60),
                                                seconds = (timerStart - elapsedTime) % 60;

                                            if (seconds <= 0) {
                                                seconds = 59;
                                                if (minutes <= 0) {
                                                    clearInterval(timerInterval);
                                                    _getHourlyDeals();
                                                    return;
                                                }
                                            }
                                            $timer.find(".cntdwn__mins").text(minutes < 10 ? "0" + minutes : minutes);
                                            $timer.find(".cntdwn__scnds").text(seconds < 10 ? "0" + seconds : seconds);
                                            return timer;
                                        }()), 1000);
                                    } else {
                                        $timer.hide();
                                        $hourlyDealsWidget.find(".hrly-deals-expry-lbl").hide();
                                    }
                                }
                            }).fail(function() {
                                $hourlyDealsWidget.find(".cntdwn").hide();
                                $hourlyDealsWidget.find(".hrly-deals-expry-lbl").hide();
                            });
                        }());
                    }
                }());

                // operations to be done to add/remove filters.
                filterControls = {
                    "add": function() {
                        var $filterGroupOptions,
                            appliedFilterComponents = ListPage.view.components.appliedFilter;

                        // initialize all filtergroups, cleargroups as inactive and activate based on current params
                        $(".fltr__cler").removeClass("fltr__cler--show");
                        //$('.fltr__val').removeClass('active');

                        // apply all filters registered on filterControls.add.queue
                        $.each(filterControls.add.queue, function(i, filterItem) {
                            // batch html of all the filters to append all filter tags in one go.
                            if ("unitValue" in filterItem) {
                                $filterGroupOptions = $(".fltr[data-groupname='" + filterItem.groupName + "'] .fltr-val__inpt");
                                if ($filterGroupOptions.closest(".fltr-val").hasClass("js-fltr-val--sngl") || filterItem.groupName == "localSearch" || filterItem.groupName == "price") {
                                    $(".js-fltrs-apld[data-groupname='" + filterItem.groupName + "']").remove();
                                }
                                $filterGroupOptions.filter("[value='" + filterItem.unitValue + "']").prop("checked", true);
                                setTimeout(function() {
                                    $(".fltr[data-groupname='" + filterItem.groupName + "']").find(".fltr__cler").addClass("fltr__cler--show");
                                }, 0);
                            }
                            if (filterItem.groupName == "price") {
                                // update priceSlider range points
                                $(".fltr-prc__sldr").slider("values", [
                                    lp_filterPlugins.priceSlider.priceToRange(filterItem.unitValue.split(";")[0]),
                                    lp_filterPlugins.priceSlider.priceToRange(filterItem.unitValue.split(";")[1])
                                ]);
                                $(".js-fltr-prc__inpt-min").val(filterItem.unitValue.split(";")[0]);
                                $(".js-fltr-prc__inpt-max").val(filterItem.unitValue.split(";")[1]);
                            }
                            // batch html of all the filters to append all filter tags in one go.
                            if ($(".js-fltrs-apld[data-groupname='" + filterItem.groupName + "']").length !== 0) {
                                $(".js-fltrs-apld[data-groupname='" + filterItem.groupName + "']").append(appliedFilterComponents.unit(filterItem));
                            } else {
                                $(".js-fltrs-apld-wrpr").append(appliedFilterComponents.group(filterItem));
                            }
                        });

                        if (filterControls.add.queue.length !== 0) {
                            $(".js-fltrs-apld-wrpr1").show();

                            ;(function showFollowThisSearchButton() {

                                if (lp_clipboard.pageType !== "nc") {

                                    var subcatName = $('.body-wrpr').data('listname'),
                                        subcatCode = $('.body-wrpr').data('listcode'),
                                        URLParams = encodeURIComponent(window.location.hash);

                                    var hrefVal = "../../promotions/savesearchpopup.php?subcatname=" + encodeURIComponent(subcatName) + "&subcatcode=" + encodeURIComponent(subcatCode) + "&filterhash=" + URLParams;
                                    $(".list-hdr__save").data("href", hrefVal).show();
                                }

                            }());
                        }
                    },
                    "remove": function() {
                        // remove all filters registered on filterControls.remove.queue
                        $.each(filterControls.remove.queue, function(i, filterItem) {
                            var $remfilterGrp = $(".js-fltrs-apld[data-groupname='" + filterItem.groupName + "']"),
                                $remfilterUnit = $remfilterGrp.find(".js-fltrs-apld__item[data-value='" + filterItem.unitValue + "']"),
                                $filterOption = $(".fltr-val__inpt[value='" + filterItem.unitValue + "']");

                            if ($remfilterGrp.find(".js-fltrs-apld__item").length === 1) {
                                $remfilterGrp.remove();
                            } else {
                                $remfilterUnit.remove();
                            }

                            // FIXME:: on clearing --multi filter block first item remains selected
                            // -> setTimeout is a temporary fix to do unchecking after handler is executed.
                            setTimeout(function() {
                                $filterOption.prop("checked", false);

                                if ($filterOption.closest(".fltr").find(".fltr-val__inpt:checked").length === 0) {
                                    $filterOption.closest(".fltr").find(".fltr__cler").removeClass("fltr__cler--show");
                                }
                            }, 0);

                            if (filterItem.groupName === "price") {
                                // update priceSlider range points
                                $(".fltr-prc__sldr").slider("values", [0, 200]);
                                $(".js-fltr-prc__inpt-min").val(lp_defaults.priceMin);
                                $(".js-fltr-prc__inpt-max").val(lp_defaults.priceMax);
                            }
                        });

                        // if all filter tags removed remove "clear all" filter tag also
                        if ($(".js-fltrs-apld").length === 0) {
                            $(".js-fltrs-apld-wrpr1").hide();
                            $(".list-hdr__save").hide();
                        }
                    }
                };

                // after all filters added/removed reinitialize queue to empty.
                filterControls.add.queue = [];
                filterControls.remove.queue = [];

                // register all filter changes to filterControls queue to batch applying and removing operations.
                $.each(["add", "remove"], function(i, action) {
                    if ("s" in lp_changes[action]) {
                        $(".js-hdr-srch").val(lp_changes[action].s);
                        filterControls[action].queue.push({
                            "unitValue": lp_changes[action].s,
                            "unitLabel": lp_changes[action].s,
                            "groupName": "searchTerm",
                            "groupLabel": "Search"
                        });
                    }
                    if ("sort" in lp_changes[action]) {
                        $('.js-list-sort option[value="' + lp_changes[action].sort + '"]').attr("selected", "selected");
                    }

                    if ("ss" in lp_changes[action]) {
                        $(".list-hdr-srch__fld").val(lp_current.ss);
                        filterControls[action].queue.push({
                            "unitValue": lp_changes[action].ss,
                            "unitLabel": lp_changes[action].ss,
                            "groupName": "localSearch",
                            "groupLabel": "List Search"
                        });
                    }
                    if ("price" in lp_changes[action]) {
                        ;(function() {
                            var startInr = lp_changes[action].price.split(";")[0],
                                endInr = lp_changes[action].price.split(";")[1],
                                unitValue = lp_changes[action].price,
                                unitLabel = startInr.toLocaleString() + "-" + endInr.toLocaleString(),
                                minSlider, maxSlider;

                            filterControls[action].queue.push({
                                "unitValue": unitValue,
                                "unitLabel": unitLabel,
                                "groupName": 'price',
                                "groupLabel": 'price'
                            });

                            // if price filter is to be added update slider values to new values
                            if (action === "add") {
                                lp_clipboard.slider.priceMin = startInr;
                                lp_clipboard.slider.priceMax = endInr;
                                // if price filter is to be removed update slider values to min and max values.
                            } else {
                                lp_clipboard.slider.priceMin = lp_defaults.priceMin;
                                lp_clipboard.slider.priceMax = lp_defaults.priceMax;
                            }
                        }());
                    }
                    if ("property" in lp_changes[action]) {
                        $.each(lp_changes[action].property, function(i, value) {
                            var $filterItem = $('.fltr-val__inpt[value="' + value + '"]'),
                                $topFilter = $('.js-fltrs-apld__item[data-value="' + value + '"]'),
                                unitValue = value,
                                unitLabel = $filterItem.attr("dispname"),
                                groupName = $filterItem.closest(".fltr").data("groupname")?$filterItem.closest(".fltr").data("groupname"):$topFilter.closest(".js-fltrs-apld").data("groupname"),
                                groupLabel = $.trim($filterItem.closest(".fltr").find(".fltr__ttl").text());

                            filterControls[action].queue.push({
                                "unitValue": unitValue,
                                "unitLabel": unitLabel,
                                "groupName": groupName,
                                "groupLabel": groupLabel
                            });
                        });
                    }
                    if ("discount" in lp_changes[action]) {
                        var unitValue = lp_changes[action].discount,
                            unitLabel = lp_changes[action].discount.split(";")[0] + "% - " + lp_changes[action].discount.split(";")[1] + "%";
                        filterControls[action].queue.push({
                            "unitValue": unitValue,
                            "unitLabel": unitLabel,
                            "groupName": 'discount',
                            "groupLabel": 'discount'
                        });
                    }
                });

                $.each(["add", "remove"], function(i, action) {
                    if (filterControls[action].queue.length) {
                        filterControls[action]();
                    }
                });

                $.extend(lp_clipboard, {
                    "prevMinPrice": lp_current.price ? lp_current.price.split(";")[0] : lp_defaults.minPrice,
                    "prevMaxPrice": lp_current.price ? lp_current.price.split(";")[1] : lp_defaults.maxPrice,
                    "prevLocalSearch": lp_current.ss || ""
                });

                // after all changes reflected in the view re-initialize changes to empty.
                $.extend(lp_changes, {
                    "add": {},
                    "remove": {}
                });
            },
            "filterPlugins": {
                "init": function(settings, replacedGroups) {
                    ListPage.view.filterPlugins.nanoScrollbarInit(replacedGroups);
                    ListPage.view.filterPlugins.priceSlider.init(settings.priceSlider, replacedGroups);
                },
                "priceSlider": {
                    "init": function(settings, replacedGroups) {
                        var minPrice = settings.min,
                            maxPrice = settings.max,
                            minSlider = minPrice ? this.priceToRange(minPrice) : 0,
                            maxSlider = maxPrice ? this.priceToRange(maxPrice) : 200,
                            lp_changes = ListPage.model.params.changes,
                            lp_filterPlugins = ListPage.view.filterPlugins;

                        if ($.isArray(replacedGroups) && replacedGroups.indexOf("price") === -1) {
                            return;
                        }

                        $(".fltr-prc__sldr").slider({
                            "range": true,
                            "min": 0,
                            "max": 200,
                            "values": [minSlider || 0, maxSlider || 200],
                            "step": 1,
                            "animate": true,
                            "slide": lp_filterPlugins.priceSlider.callback,
                            "stop": function(a, b) {
                                var startInr, endInr;

                                if (b.values[0] === 0 && b.values[1] === 200) {
                                    startInr = ListPage.model.clipboard.prevMinPrice;
                                    endInr = ListPage.model.clipboard.prevMaxPrice;

                                    // if range is equal to total range then remove price filter
                                    lp_changes.remove.price = startInr + ";" + endInr;
                                } else {
                                    startInr = lp_filterPlugins.priceSlider.rangeToPrice(b.values[0]);
                                    endInr = lp_filterPlugins.priceSlider.rangeToPrice(b.values[1]);

                                    // if range is not equal to total range then add new price filter
                                    lp_changes.add.price = startInr + ";" + endInr;
                                }

                                lp_changes.inFilterBox = true;
                                ListPage.controller.updatePage();
                                $(".fltr-val__inpt:checked").prop("checked", false);
                                $(".fltr-prc__sldr").slider("values", [b.values[0], b.values[1]]);
                            }
                        });

                        if (minPrice || maxPrice) {
                            $(".js-fltr-prc__inpt-min").val(minPrice || ListPage.model.params.defaults.price.split(";")[0]);
                            $(".js-fltr-prc__inpt-max").val(maxPrice || ListPage.model.params.defaults.price.split(";")[1]);
                        }
                    },
                    // get price value from slider range value
                    "rangeToPrice": function(a) {
                        var priceMin = ListPage.model.params.defaults.priceMin,
                            priceMax = ListPage.model.params.defaults.priceMax,
                            b = Math.exp(Math.log(priceMax / priceMin) / 200),
                            priceValue = priceMin * Math.pow(b, a),
                            roundOff = Math.pow(10, Math.floor(Math.log(priceValue - (priceValue / b)) / Math.log(10)));

                        priceValue = Math.ceil(priceValue / roundOff) * roundOff;
                        if (a === 0 || priceValue < priceMin) return priceMin;
                        else if (a == 200 || priceValue > priceMax) return priceMax;
                        else return priceValue;
                    },
                    // get slider range from price value
                    "priceToRange": function(price) {
                        var result = (function binarySearch(a, fn, min, max) {
                            binarySearch.old = binarySearch.current;
                            binarySearch.current = Math.floor((min + max) / 2);
                            if (binarySearch.old === binarySearch.current) {
                                return binarySearch.current;
                            }
                            if (a > fn(binarySearch.current)) {
                                min = binarySearch.current;
                            } else if (a < fn(binarySearch.current)) {
                                max = binarySearch.current;
                            } else {
                                return binarySearch.current;
                            }
                            return binarySearch(a, fn, min, max);
                        }(price, ListPage.view.filterPlugins.priceSlider.rangeToPrice, 0, 200));
                        return result;
                    },
                    // run this function while sliding the price slider.
                    "callback": function(a, b) {
                        var minPrice, maxPrice;
                        if ((b.values[0] + 1) >= b.values[1]) {
                            return false;
                        }
                        minPrice = ListPage.view.filterPlugins.priceSlider.rangeToPrice(b.values[0]);
                        maxPrice = ListPage.view.filterPlugins.priceSlider.rangeToPrice(b.values[1]);
                        $(".js-fltr-prc__inpt-min").val(minPrice);
                        $(".js-fltr-prc__inpt-max").val(maxPrice);
                    },
                },
                // init nanoscrollbar plugin to get overflow scroll to filterGroups
                "nanoScrollbarInit": function(filterGroups) {
                    var $nanoElements;

                    if (filterGroups) {
                        $nanoElements = $(".fltr-val-wrpr.nano").filter(function() {
                            return filterGroups.indexOf($(this).closest(".fltr").data("groupname")) !== -1;
                        });
                    } else {
                        $nanoElements = $(".fltr-val-wrpr.nano");
                    }

                    $nanoElements.each(function() {
                        var totalHeight;
                        $filteritem = $(".fltr-val", $(this));
                        if ($filteritem.length <= ListPage.settings.filterLength) {
                            totalHeight = 0;
                            $filteritem.each(function() {
                                totalHeight += $(this).outerHeight(true);
                            });
                            if (totalHeight < 224) $(this).css("height", totalHeight + 'px');
                        }
                    });
                    $nanoElements.nanoScroller({
                        "alwaysVisible": true
                    });
                },
            },
            "components": {
                "appliedFilter": {
                    "group": function(filterItem) {
                        return [
                            '<div class="js-fltrs-apld" data-groupname="' + filterItem.groupName + '">',
                            '<div class="js-fltrs-apld__lbl">' + filterItem.groupLabel + ':</div>',
                            this.unit(filterItem),
                            '</div>'
                        ].join("");
                    },
                    "unit": function(filterItem) {
                        return [
                            '<div class="js-fltrs-apld__item" data-value="' + filterItem.unitValue + '">',
                            '<span class="js-fltrs-apld__item-label">' + filterItem.unitLabel + '</span>',
                            '<img class="js-fltrs-apld__item-cler" src="https://assets.mspcdn.net/msp-ui/icons/cross-grey-small.png"/>',
                            '</div>'
                        ].join("");
                    }
                },
                "loadingMask": function() {
                    return [
                        '<div class="js-fltr-ldng-mask">',
                        '<div class="ldr">',
                        '<div class="ldr__crcl"></div>',
                        '<div class="ldr__text" style="">Loading...</div> ',
                        '</div>',
                        '</div>'
                    ].join("");
                },
                "loadingMaskSmall": function() {
                  return [
                        '<div class="ldng-mask-wrpr">',
                        '<div class="js-fltr-ldng-mask">',
                        '<div class="ldr ldr--sml">',
                        '<div class="ldr__crcl"></div>',
                        '<div class="ldr__text" style="">Loading...</div> ',
                        '</div>',
                        '</div>',
                        '</div>'
                    ].join("");  
                }
            }
        }
    };

    // if category is mobile then first show mobile list and then show applied filters list.
    if ($("#mobilefilterwrapper").length) {
        $.ajax({
            url: "/msp/prop_filters/mobile-new.html"
        }).done(function(response) {
            var data = response.split("//&//#");
            $("#mobilefilterwrapper").html(data[0]);
            ListPage.controller.init();
        });
    } else {
        ListPage.controller.init();
    }

    var ProductList = {
        "initGrid": function() {
            if(ListPage.model.clipboard.pageType==="nc-filter"){
                return;
            }
            if (localStorage.getItem("gridType") === "large") {
                this.setGridType("large");
            } else if (localStorage.getItem("gridType") === "small") {
                this.setGridType("small");
            }
            Modules.$doc.on("click", ".js-list-hdr-view", function() {
                if ($(this).hasClass("list-hdr-view__prdct-l")) {
                    ProductList.setGridType("large");
                } else {
                    ProductList.setGridType("small");
                }
            });
        },
        "setGridType": function(type) {
            $(".list-hdr-view__prdct-l").removeClass("list-hdr-view__prdct-l--slctd");
            $(".list-hdr-view__prdct-s").removeClass("list-hdr-view__prdct-s--slctd");

            if (type === "large") {
                $(".prdct-grid").addClass("prdct-grid--prdct-l");
                $(".prdct-grid").removeClass("prdct-grid--prdct-s");
                $(".list-hdr-view__prdct-l").addClass("list-hdr-view__prdct-l--slctd");
                localStorage.setItem("gridType", "large");
            } else {
                $(".prdct-grid").addClass("prdct-grid--prdct-s");
                $(".prdct-grid").removeClass("prdct-grid--prdct-l");
                $(".list-hdr-view__prdct-s").addClass("list-hdr-view__prdct-s--slctd");
                localStorage.setItem("gridType", "small");
            }
        }
    };

    ProductList.initGrid();

    $(document).on('change', '.fltr-val__inpt', function() {
      var group = $(this).parents('.fltr').data('groupname');
      var label = $(this).next('.fltr-val__text').children('.fltr-val__lbl').text().trim();
      
      if(window.ga) {
          ga('send', 'event', 'listpage_filters', group, label);
      }

      //Hide SEO Text
      $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").hide();
    });

    // search in filter groups.
    $(".fltr-wrpr1").on("keyup", ".fltr-srch__fld", function() {
        var filterSearchQuery = $.trim($(this).val()),
            $filterGroup = $(this).closest(".fltr");
        if (filterSearchQuery === "") {
            $filterGroup.find(".fltr-val").show();
            $filterGroup.find(".fltr-srch__icon--srch").removeClass("fltr-srch__icon--hide");
            $filterGroup.find(".fltr-srch__icon--cler").addClass("fltr-srch__icon--hide");
            $filterGroup.find(".nano").nanoScroller();
        } else {
            $filterGroup.find(".fltr-val").hide();
            $filterGroup.find(".fltr-srch__icon--srch").addClass("fltr-srch__icon--hide");
            $filterGroup.find(".fltr-srch__icon--cler").removeClass("fltr-srch__icon--hide");
            $filterGroup.find(".fltr-val").filter(function() {
                var itemText = $.trim($(this).text()).toLowerCase(),
                    index = itemText.indexOf(filterSearchQuery),
                    result = false;
                if (index === 0) {
                    result = true;
                } else if (index > 0) {
                    if (itemText.toLowerCase().charAt(index - 1) === " ") {
                        result = true;
                    }
                }
                return result;
            }).show();
            $filterGroup.find(".nano").nanoScroller();
        }
    });

    // clear search in filterGroups
    $(".fltr-wrpr1").on("click", ".js-fltr-srch__cler", function() {
        var $filterGroup = $(this).closest(".fltr");
        $filterGroup.find(".fltr-srch__fld").val("");
        $filterGroup.find(".fltr-srch__icon").toggleClass("fltr-srch__icon--hide");
        $filterGroup.find(".fltr-val").show();
        $filterGroup.find(".nano").nanoScroller();
    });

    ;(function goToFilterOnScroll() {
        var $listMain = $('.list-main'),
            $filter = $('.fltr-wrpr1');
        if($listMain.length) {
            $listMain.append([
                '<span class="btn btn--s show-fltr js-show-fltr js-inpg-link" data-href="list-filter">',
                    'Show Filters',
                '</span>'].join(''));
            $filter.attr('data-id', 'list-filter');

            window.onscroll = function(e) {
                var $showFilter = $('.js-show-fltr'),
                    filterBottom = $filter.offset().top + $filter.outerHeight(),
                    additionalSpace = Modules.$win.height();
                    scrolledBottom = Modules.$win.scrollTop() + Modules.$win.height(),
                    listMainBottom = $listMain.offset().top + $listMain.outerHeight();

                if (scrolledBottom <= filterBottom + additionalSpace) {
                    if($showFilter.filter(':visible').length) {
                        $showFilter.hide(0);
                    }
                } else {
                    $showFilter.show(0);
                    if (scrolledBottom > listMainBottom) {
                        $showFilter
                            .removeClass('fixed')
                                .addClass('abslt');
                    } else {
                        $showFilter
                            .removeClass('abslt')
                                .addClass('fixed')
                                    .css('left', $filter.offset().left + 'px');
                    }
                }
            };
        }
    })();
}
if (location.pathname === "/") {
    Modules.$doc.on("click", ".mCycleItemWrapper:first-child", function() {
        window.ga && ga("send", "event", "HomePage", "promo-bnr-click", "first-bnr");
    });
}

/* Search scoring functionality [Start] */

var QnASearch = {
    settings: {
        mspId: function() {
            if (dataLayer[0].pagetype === 'single') {
                return dataLayer[0].mspid && dataLayer[0].mspid;
            } else if ($('.js-prdct-ttl').data('mspid') || dataLayer[0].pagetype === 'qna_single') {
                return dataLayer[0].mspid && dataLayer[0].mspid;
            } else if (dataLayer[0].pagetype === 'qna_list') {
                return dataLayer[0].mspid && dataLayer[0].mspid;
            }
        },
        qnaApi: function() {
            return '/review/qna/search/?mspid=' + QnASearch.settings.mspId();
        },
        inputSelector: function() {
            if (dataLayer[0].pagetype === 'single') {
                return '.js-qstn-txt';
            } else if (dataLayer[0].pagetype === 'qna_single') {
                return '.js-qstn-txt';
            } else if (dataLayer[0].pagetype === 'qna_list') {
                return '.js-qstn-txt';

            }
        },
        questionCount: 5, // number of questions in search result
        answerCount: 3, // number of answers in respective question search result if keyword found
        weightage: {
            fullMatch: 2,
            partialMatch: 1,
            uniqueMatch: 3,
            repeatMatch: 2,
            sequence: 1.5,
            caseMatch: 2,
            minRelevance: .6
        },
        stopWords: ['i', 'the', 'is', 'a', 'all', 'am', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'in', 'into', 'it', 'its', 'my', 'no', 'nor', 'not', 'of', 'on', 'or', 'that', 'then', 'this', 'to', 'was', 'were', 'does', 'has', 'have', 'had', 'when', 'where', 'which', 'what', 'how', 'do', 'why', 'who', 'whose', 'if', 'both', 'we', 'will', 'with', 'without']
    },
    data: {
        searchWordsArr: [],
        sDataJson: {},
        sequence: [],
        qnaJson: '',

    },
    buildFunction: {
        init: function(url) {
            return QnASearch.data.searchWordsArr = QnASearch.buildFunction.getJson(url).done(function(response) {
                //var jsonData = sDataJson = response;
                QnASearch.data.qnaJson = response;
                QnASearch.data.sDataJson = response;
                return QnASearch.buildFunction.splittingInWordsArray(QnASearch.data.qnaJson);
            });
        },
        getJson: function(url) {
            var dfd = $.Deferred();
            $.ajax({
                url: url,
                dataType: 'json'
            }).done(function(response) {
                mData = response;
                return dfd.resolve(response);
            });
            return dfd.promise();
        },
        keywordArrayToJson: function(questionId, searchArr, wordArr, valueFactor, arrayType, answerWordIndex) {
            for (var i = 0; i < wordArr.length; i++) {
                if (wordArr[i] == '') {
                    break;
                }
                searchArr.push({
                    'word': wordArr[i],
                    'questionId': questionId,
                    'answerWordIndex': answerWordIndex,
                    'valueFactor': valueFactor,
                    'sentenceIndex': i,
                    'searchArrayIndex': searchArr.length
                });
            }
            return searchArr;
        },
        splittingInWordsArray: function(mData) {
            var tempObj = {},
                searchArr = [],
                answerWordIndex;
            for (id in mData) {
                var wordArr = (mData[id].question).replace(/[^a-zA-Z0-9' ]/g, '').split(' ').filter(function() {
                    return true;
                });
                answerWordIndex = id + '-' + '0';
                searchArr = QnASearch.buildFunction.keywordArrayToJson(id, searchArr, wordArr, 0.2, "question", answerWordIndex);
                for (var j = 0; j < mData[id].answer.length; j++) {
                    var answerWords = mData[id].answer[j].replace(/[^a-zA-Z0-9' ]/g, '').split(' ').filter(function() {
                        return true;
                    });
                    answerWordIndex = id + '-' + j;
                    searchArr = QnASearch.buildFunction.keywordArrayToJson(id, searchArr, answerWords, 0.2, 'answer', answerWordIndex);
                    QnASearch.generalFunction.wipeAnArray(answerWords);
                    answerWords = [];
                }
                wordArr = [];
            };
            searchArr = QnASearch.generalFunction.sortedByWord(searchArr);
            QnASearch.data.builtData = searchArr;
            return searchArr;
        }

    },
    domObject: {
        $loader: '<div class="ldr__ovrly" style="height:50px;position: relative; overflow: hidden;">\
                    <div class="ldr ldr--s">\
                        <div class="ldr__crcl"></div>\
                    </div>\
                </div>',
    },
    generalFunction: {
        sortedByWord: function(searchArray) {
            searchArray.sort(function(a, b) {
                var alc = a.word.toLowerCase().toString(),
                    blc = b.word.toLowerCase().toString();
                return alc > blc ? 1 : alc < blc ? -1 : 0;
            });
            return searchArray;
        },
        sortQuestionsAns: function(resultArr) {
            resultArr.sort(function(a, b) {
                return b.matchScore - a.matchScore
            });
            return resultArr;
        },
        wipeAnArray: function(array) {
            return array = [];
        },
        highlightText: function(selectorObj, searchItems) {
            for (var i = 0; i < searchItems.length; i++) {
                selectorObj.highlight(searchItems[i]);
            }
        },
        keywordCleaner: function(term) {
            if (!term) {
                return false;
            }
            var stopWords = QnASearch.settings.stopWords;
            return term.replace(/[.\,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ').replace(
                /[\s]+/g, ' ').split(' ').reduce(function(a, v) {
                if (v.length > 0 || (v === v.toUpperCase() && v.length > 1)) {
                    if (stopWords.indexOf(v.toLowerCase()) == -1) {
                        a.push(v);
                    }
                }
                return a;
            }, []);
        }
    },
    binarySearch: function(searchArray, searchElement, caseInsensitive) {
        if (typeof searchArray === 'undefined' || searchArray.length <= 0 || typeof searchElement === 'undefined' ||
            searchElement === '') {
            return -1;
        }
        var array = searchArray,
            key = searchElement,
            keyArr = [],
            len = array.length,
            ub = (len - 1),
            p = 0,
            mid = 0,
            lb = p;

        key = caseInsensitive && key && typeof key == 'string' ? key.toLowerCase() : key;

        function isCaseInsensitive(caseInsensitive, element) {
            return caseInsensitive && element.word && typeof element.word == 'string' ? (element.word).toLowerCase() :
                element.word;
        }
        while (lb <= ub) {
            mid = parseInt(lb + (ub - lb) / 2, 10);

            if (isCaseInsensitive(caseInsensitive, array[mid]).indexOf(key) > -1) {
                keyArr.push(mid);
                if (keyArr.length > len) {
                    return keyArr;
                } else if (array[mid + 1] && isCaseInsensitive(caseInsensitive, array[mid + 1]).indexOf(key) > -1) {
                    for (var i = 1; i < len; i++) {
                        if (array[mid + 1] && isCaseInsensitive(caseInsensitive, array[mid + i]).indexOf(key) == -1) {
                            break;
                        } else {
                            keyArr.push(mid + i);

                        }
                    }
                }
                if (keyArr.length > len) {
                    return keyArr;
                } else if (array[mid - 1] && isCaseInsensitive(caseInsensitive, array[mid - 1]).indexOf(key) > -1) {
                    for (var i = 1; i < len; i++) {

                        if (isCaseInsensitive(caseInsensitive, array[mid - i]).indexOf(key) == -1) {
                            break;
                        } else {
                            keyArr.push(mid - i);
                        }
                    }
                }
                return keyArr;
            } else if (key > isCaseInsensitive(caseInsensitive, array[mid])) {
                lb = mid + 1;
            } else {
                ub = mid - 1;
            }
        }
        return -1;

    },
    getSearchResult: function(searchKeywordsArr, builtData) {
        var builtData = builtData,
            termArr = searchKeywordsArr,
            resultArr = [],
            tempObj = [],
            wordOccurrence;
        if (termArr.length > 0) {
            for (var i = 0, iLen = termArr.length; i < iLen; i++) {
                termArrIndex = QnASearch.binarySearch(builtData, termArr[i], true, 'multiple');
                if (termArrIndex !== -1 && termArrIndex.length >= 1) {
                    $.each(termArrIndex, function(indx, vlu) { // if results are comming in array ie. multiple occurrence of a word;
                        var questionId = builtData[vlu].questionId; // Every pair of answer and question contains a unique id.
                        var answerWordIndex = builtData[vlu].answerWordIndex; // If it is answer keyword it contains word index in that sentence

                        //Pass only array of object of highest matchScore question and answer;

                        if (!QnASearch.data.sDataJson[questionId].wordOccurrence) {
                            QnASearch.data.sDataJson[questionId].wordOccurrence = [];
                            QnASearch.data.sDataJson[questionId].wordOccurrence.push(builtData[vlu].word);
                            wordOccurrence = 1;
                        } else if (QnASearch.data.sDataJson[questionId].wordOccurrence.indexOf(builtData[vlu].word) > -1) {
                            QnASearch.data.sDataJson[questionId].wordOccurrence.push(builtData[vlu].word);
                            wordOccurrence = 2;
                        } else {
                            QnASearch.data.sDataJson[questionId].wordOccurrence.push(builtData[vlu].word);
                            wordOccurrence = 1;
                        }

                        //squnc_id
                        var matchScore = 0;

                        if (wordOccurrence > 1) {
                            //Repeat Word [Tested]
                            matchScore += parseInt(QnASearch.settings.weightage.repeatMatch);
                        } else if (wordOccurrence === 1) {
                            //Unique Word [Tested]
                            matchScore += parseInt(QnASearch.settings.weightage.uniqueMatch);
                        }

                        if (termArr[i].toLowerCase() === builtData[vlu].word.toLowerCase()) {
                            //Full Search [Tested]
                            matchScore *= QnASearch.settings.weightage.fullMatch;
                        } else {
                            //Partial Search [Tested]
                            matchScore *= QnASearch.settings.weightage.partialMatch;
                        }

                        if (termArr[i] === builtData[vlu].word) {
                            //Case Sensitive [Tested]
                            matchScore *= QnASearch.settings.weightage.caseMatch;
                        } else {
                            //Case Insensitive
                            //Do Nothing as of now
                        }

                        // sequence search matchscore
                        /* At first iteration saving the keyword's original index position(searchArrayIndex) in keywords array with
                        sequence id(searchArrayIndex). Onwords iterations, Checking if the sequence id exist in sequence array
                        if not push again in sequence array if current word's previous id (searchArrayIndex-1) contains in sequence array,
                        we are alloting match score. */
                        if (QnASearch.data.sequence.length === 0 && termArr[i].toLowerCase() === builtData[vlu].word.toLowerCase()) {
                            QnASearch.data.sequence.push(builtData[vlu].searchArrayIndex);
                        } else {
                            if ((QnASearch.data.sequence.indexOf((builtData[vlu].searchArrayIndex - 1)) > -1)) { // On every input 
                                matchScore *= QnASearch.settings.weightage.sequence;
                            } else {
                                QnASearch.data.sequence.push(builtData[vlu].searchArrayIndex);
                            }
                        }

                        if (tempObj.length < 1) {
                            tempObj.push({
                                questionId: questionId,
                                answerWordIndex: answerWordIndex,
                                matchScore: matchScore
                            });
                        } else {
                            var flag = false;
                            for (var p = 0, pLen = tempObj.length; p < pLen; p++) {
                                if (tempObj[p].questionId === questionId) {
                                    tempObj[p].matchScore += parseInt(matchScore);
                                    tempObj[p].answerWordIndex += ((tempObj[p].answerWordIndex).indexOf(answerWordIndex) > -1) ? '' : '|' +
                                        answerWordIndex;
                                    flag = true;
                                }
                            }
                            if (!flag) {
                                tempObj.push({
                                    questionId: questionId,
                                    answerWordIndex: answerWordIndex,
                                    matchScore: matchScore
                                });
                            }

                        }
                    });

                }
            }
        }
        for (var d = 0, dlen = tempObj.length; d < dlen; d++) {
            delete QnASearch.data.sDataJson[tempObj[d].questionId].wordOccurrence
        }
        QnASearch.data.sequence = QnASearch.generalFunction.wipeAnArray(QnASearch.data.sequence)
        return tempObj;
    },
    processSearch: function(searchKeywords) {
        var searchResultArr,
            sortedSearchResult,
            status,
            builtData = QnASearch.data.builtData;

        if (searchKeywords.length < 1) {
            return false;
        }

        searchResultArr = QnASearch.getSearchResult(searchKeywords, builtData);

        sortedSearchResult = searchResultArr.length && QnASearch.generalFunction.sortQuestionsAns(searchResultArr); //resultArr; 

        var searchResultJson = sortedSearchResult.length && QnASearch.searchResultJson(sortedSearchResult);
        var dom = searchResultJson && QnASearch.domFunction.createHtml(searchResultJson);
        isAppend = QnASearch.domFunction.appendDom(dom, searchKeywords);
        QnASearch.domFunction.removeDom(isAppend, searchKeywords);
        return dom;
    },
    domFunction: {
        rsltStateMsg: function(msg) {
            var askQstn = '\<div class="" style="display:block;text-align:center; margin-top: 30px; margin-bottom: 30px;"> \
                <span class="rslt__state" style="line-height: 20px; font-size:18px; margin-right: 15px;"> ' + msg + '</span>\
                <div style="padding: 8px 36px" class="bttn bttn--blue ask-qstn--wdgt js-ask-qstn--wdgt js-popup-trgt" href="/review/qna/popup/ask_a_question.php?source=desktop_q_list&amp;mspid=' + $('.prdct-dtl__ttl').data('mspid') + '">Ask a Question</div>\
            </div>';
            return askQstn;
        },
        createHtml: function(jsonObj) {
            var dom = '',
                questionId,
                questionIdNumeric,
                answer = '',
                answerCount;
            for (id in jsonObj) {
                questionId = jsonObj[id].q_id;
                questionIdNumeric = (questionId).replace(/[^0-9]/g, ''),
                    answerCount = jsonObj[id].answer.length
                answer += ' <div class="qna__answr-wrpr">';
                if (answerCount > 0) {
                    for (var i = 0; i < jsonObj[id].answer.length; i++) {
                        answer += '<div class="qna__answr clearfix" style="display:block">' + jsonObj[id].answer[i] + '</div>';
                    }
                } else {
                    //answer += '<div class="qna__answr clearfix" style="display:block; opacity: 0.3;">' + 'This question has no answer yet ' + '</div>';
                    answer += '<div class="qna__answr clearfix">' + '<span  style="opacity: 0.3;">' + 'This question has no answer yet ' + '</span>' + '<span class="js-qna__rqst-answr qstn-answr__flw" data-qid="' + questionIdNumeric + '"><span class="flw__lbl js-flw__lbl">Request Answer </span></span>' + '</div>';
                }
                answer += '</div>';
                var tempDom = '<div class="qna__item js-qna__item clearfix" data-qid="' + questionId + '" data-ans-count="' + answerCount + '">\
                   <a class="qna__item--href js-qna__item--href" target="_blank" href="/review/qna/redesign/single.php?ref=qna-search&q_id=' + questionIdNumeric + '"> <div class="qna__qstn">' + jsonObj[id].question + '</div>\
                       ' + answer + '\
                   </a></div>';

                dom += tempDom;
                answer = question = tempDom = '';
            }
            return dom;
        },
        removeDom: function(status, searchKeyword) {
            var notFndText = QnASearch.domFunction.rsltStateMsg("No results found.");
            var pageType = ["single", "qna_single", "qna_list"];
            if ((pageType.indexOf(dataLayer[0].pagetype)) >= 0) {
                if (!status && searchKeyword) {
                    $('.ldr__ovrly').remove();
                    $('.qna__body--search').html(notFndText);
                    $(".qna > .js-open-link").hide();
                } else if (!status && !searchKeyword) {
                    $('.ldr__ovrly, .js-ldr--stts').remove();
                    $('.qna__body--search').html('');
                    $('.qna__body').css('display', 'block');
                    $(".qna > .js-open-link").show();
                    $(".js-qna__srch-kywrds").show();


                }
                return true;
            }
            return false;
        },
        appendDom: function(dom, filteredSearchKeywords) {
            var $qnaDiv;
            var pageType = ["single", "qna_single", "qna_list"];
            var firstResult = QnASearch.domFunction.rsltStateMsg("Didn't find what you're looking for? ");
            if (dom) {
                if ((pageType.indexOf(dataLayer[0].pagetype)) >= 0) {
                    $qnaDiv = $('.qna__body--search');
                    $('.ldr__ovrly, .qna__body').css('display', 'none');


                }
                $qnaDiv.append(dom);
                QnASearch.generalFunction.highlightText($qnaDiv, filteredSearchKeywords);
                $qnaDiv.prepend(firstResult);
            } else {
                return false;
            }
            return true;
        },
        loaderHandler: function() {
            var pageType = ["single", "qna_single", "qna_list"];
            if ((pageType.indexOf(dataLayer[0].pagetype)) >= 0) {

                $('.qna__body').css('display', 'none'); // existing qna container
                $('.qna__body--search').html(''); // wiping search result container for new results 
                $('.qna__body--search').append(QnASearch.domObject.$loader); // appending loader in search container untill processing
                $('.ldr__ovrly').css({ // made loader visible
                    'display': 'block',
                });
            }
        }
    },
    searchResultJson: function(sortedSearchedInfo) {
        var len = sortedSearchedInfo.length > QnASearch.settings.questionCount ? QnASearch.settings.questionCount : sortedSearchedInfo.length,
            searchResultObj = {},
            question,
            matchScore,
            questionId,
            questionIdNumeric,
            answer = [],
            ansId;
        for (var p = 0; p < len; p++) {
            questionId = sortedSearchedInfo[p].questionId;
            matchScore = sortedSearchedInfo[p].matchScore;
            questionIdNumeric = (questionId).replace(/[^0-9]/g, '');
            question = QnASearch.data.sDataJson[questionId].question;
            var ansGroup = sortedSearchedInfo[p].answerWordIndex ? (sortedSearchedInfo[p].answerWordIndex).split('|') : 0;

            ansGroupLength = ansGroup.length > QnASearch.settings.answerCount ? QnASearch.settings.answerCount : ansGroup.length;
            for (var i = 0; i < ansGroupLength; i++) {
                ansId = ansGroup[i] ? ansGroup[i].split('-') : '';
                answer.push(QnASearch.data.sDataJson[questionId].answer[ansId[1]]);
            }

            searchResultObj[p] = {};
            searchResultObj[p].question = question;
            searchResultObj[p].answer = answer[0] === undefined ? [] : answer;
            searchResultObj[p].q_id = questionId;
            searchResultObj[p].matchScore = matchScore;
            answer = []; // resetting the answer array for new object
        }
        return searchResultObj;
    },
    eventFunction: {
        searchInput: function($this) {
            var searchKeyword = $this.val().trim(),
                filteredSearchKeywords;
            filteredSearchKeywords = QnASearch.generalFunction.keywordCleaner(searchKeyword);
            dom = QnASearch.processSearch(filteredSearchKeywords);

        }
    }
};

// QnA Search code
var timeout,
    searchTrigger;
$(document).on('input', QnASearch.settings.inputSelector(), function($jsonUrl) {
    if (!QnASearch.settings.inputSelector()) {
        return;
    }
    var $this = $(this);
    if (QnASearch.data.searchWordsArr.length < 1) {
        QnASearch.data.searchWordsArr = QnASearch.buildFunction.init(QnASearch.settings.qnaApi());
    } else {
        QnASearch.domFunction.loaderHandler();
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            QnASearch.eventFunction.searchInput($this);
        }, 200);
    }
    if (window.ga && !searchTrigger) {
        ga('send', 'event', 'QNA', 'search', QnASearch.settings.inputSelector());
        searchTrigger = true;
    }
});

jQuery.fn.highlight = function(pat) {
    function innerHighlight(node, pat) {
        var skip = 0;
        if (node.nodeType == 3) {
            var pos = node.data.toUpperCase().indexOf(pat);
            pos -= (node.data.substr(0, pos).toUpperCase().length - node.data.substr(0, pos).length);
            if (pos >= 0) {
                var spannode = document.createElement('span');
                spannode.className = 'word__hglght--ylw';
                var middlebit = node.splitText(pos);
                var endbit = middlebit.splitText(pat.length);
                var middleclone = middlebit.cloneNode(true);
                spannode.appendChild(middleclone);
                middlebit.parentNode.replaceChild(spannode, middlebit);
                skip = 1;
            }
        } else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
            for (var i = 0; i < node.childNodes.length; ++i) {
                i += innerHighlight(node.childNodes[i], pat);
            }
        }
        return skip;
    }
    return this.length && pat && pat.length ? this.each(function() {
        innerHighlight(this, pat.toUpperCase());
    }) : this;
};
var qnaScrolled = false,
    recommScrolled = false,
    visited;

var QnA = {
    data: {
        mspId: $('.js-prdct-ttl').data('mspid'),
        leastAnsweredQuestionsList: [],
        answeringSingleQuestion: false // Excludes reading of a single question (ONLY answering)
    },
    generalFunctions: {
        randomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

    },

    ajaxFunctions: {
        submitQuestion: function(emailInput, quesInput, $successDiv) {
            $.ajax({
                url: "/review/qna/submit_qna.php",
                data: {
                    email: emailInput,
                    question: quesInput,
                    mspid: QnA.data.mspId,
                    capture_point: document.referrer
                }
            }).done(function() {
                $successDiv.slideDown();
            });
        },
        submitAnswer: function(emailInput, ansInput, questionId) {
            $.ajax({
                url: "/review/qna/submit_qna.php",
                data: {
                    email: emailInput,
                    answer: ansInput,
                    mspid: QnA.data.mspId,
                    questionId: questionId,
                    capture_point: document.referrer
                }
            }).done(function() {
                var $successDiv = $this.closest('.wrt-answr-form').find('.wrt-answr-form__sccss');
                $successDiv.slideDown();

                // Automatically go to the next question:
                if (QnA.data.answeringSingleQuestion) {
                    $successDiv.append(' | Loading Next Question ... ');
                    setTimeout(function() {
                        QnA.eventFunctions.gotoNextQuestion();
                    }, 2000);
                }
            });
        },

        followQuestion: function($this) {
            $.ajax({
                url: "/review/qna/submit_user_action.php",
                data: {
                    entity_type: "q",
                    email_id: Modules.Cookie.get('msp_login_email'),
                    entity_id: questionId,
                    action: type,
                    source: "desktop_" + dataLayer[0].pagetype
                }
            }).done(function(response) {
                $this.each(function(i, v) {
                    $this = $(this);
                    if ($this.closest('.js-qstn-answr').data("question-id") == questionId) {
                        var followCount = parseInt($this.find($(".js-qstn-answr__flw__count")).html());
                        $this.data("followstate", "unfollow");
                        $this.find($(".js-qstn-answr__flw__count")).html(followCount + 1);

                        $this.find($(".js-flw__lbl")).html("Answer Requested");
                        window.ga && ga('send', 'event', "QNA", "click", "follow");
                        closePopup();
                        return false;
                    }
                });
            });

        },
        voteQuestion: function(questionId, type, $this) {
            $.ajax({
                url: "/review/qna/submit_user_action.php",
                data: {
                    entity_id: questionId,
                    entity_type: 'q',
                    email_id: Modules.Cookie.get('msp_login_email'),
                    action: type,
                    source: "desktop_" + dataLayer[0].pagetype
                }
            }).done(function(response) {
                var $count = $this.closest('.qstn-vote').find('.vte-cnt');
                if (response.count) {
                    if (response.count > 0) {
                        $count.removeClass('ngtv').addClass('pstv').text('+' + response.count);
                    } else {
                        $count.removeClass('pstv').addClass('ngtv').text('-' + response.count);
                    }
                } else {
                    $count.removeClass('pstv ngtv').text(response.count);
                }
            });
        },
        voteAnswer: function(answerId, type, $this) {
            //console.log(answerId);
            $.ajax({
                url: "/review/qna/submit_user_action.php",
                data: {
                    entity_id: answerId,
                    entity_type: 'a',
                    email_id: Modules.Cookie.get('msp_login_email'),
                    action: type,
                    source: "desktop_" + dataLayer[0].pagetype
                }
            }).done(function(response) {
                if (type === 'upvote') {
                    $this.text(response.likes);
                } else {
                    $this.text(response.dislikes);
                }
            });
        }
    },
    eventFunctions: {
        showQuestionForm: function($this) {
            $this.closest('.ask-qstn').removeClass('collapse');
        },
        showAnswerForm: function($this) {
            $this.slideUp();
            $this.closest('.wrt-answr').find('.wrt-answr-form').slideDown();
        },
        upvoteQuestion: function($this) {
            if ($this.hasClass('js-is-active-vote')) {
                return;
            }
            var questionId = $this.closest('.qstn-answr').data('question-id') || $this.closest('.qna__item').data('question-id'),
                upvoteCount = parseInt($this.find(".vte-cnt").html());
            $this.addClass('clckd-vte js-is-active-vote').find(".vte-cnt").html(upvoteCount + 1);

            QnA.ajaxFunctions.voteQuestion(questionId, 'upvote', $this);
        },
        downvoteQuestion: function($this) {
            if ($this.hasClass('js-is-active-vote')) {
                return;
            }
            var questionId = $this.closest('.qstn-answr').data('question-id');
            $this.addClass('clckd-vte js-is-active-vote')
                .closest('.qstn-vote')
                .find('.upvt')
                .removeClass('clckd-vte js-is-active-vote');
            QnA.ajaxFunctions.voteQuestion(questionId, 'downvote', $this);
        },

        followQuestion: function($this) {
            var $this = $this;
            var followCount = parseInt($this.find($(".js-qstn-answr__flw__count")).html());
            var questionId = $this.closest(".js-qstn-answr").data('question-id');
            if ($this.data("followstate") == "unfollow") {
                return;
            }
            if ($this.data("followstate") == "follow") {

                openPopup('/review/qna/popup/request_answer.php?source=desktop_q_list&q_id=' + questionId);
            } else {
                $this.data("followstate", "follow");
                $this.find($(".js-qstn-answr__flw__count")).html(followCount - 1);

                $this.find($(".js-flw__lbl")).html("Request Answer");
                window.ga && ga('send', 'event', "QNA", "click", "unfollow");
                QnA.ajaxFunctions.followQuestion(questionId, "unfollow", $this);
            }
        },
        upvoteAnswer: function($this) {
            if ($this.hasClass('js-is-active-vote')) {
                return;
            }
            var answerId = $this.closest('.qna__answr').data('answerid') || $this.closest('.user-answrs__answr').data('answerid');
            $this.addClass('clckd-vte js-is-active-vote')
                .closest('.answr-vote')
                .find('.dwnvt')
                .removeClass('clckd-vte js-is-active-vote');
            $this.closest(".answr-vote").removeClass("answr-vote");
            $this.html("Marked Helpful (" + (parseInt($this.find(".upvt-cnt").html()) + 1) + ")"); // Increasing the count when user clicks
            window.ga && ga('send', 'event', "QNA", "click", "upVote");
            QnA.ajaxFunctions.voteAnswer(answerId, 'upvote', $this);
        },
        downvoteAnswer: function($this) {
            if ($this.hasClass('js-is-active-vote')) {
                return;
            }
            var answerId = $this.closest('.user-answrs__answr').data('answerid');
            console.log(answerId);
            $this.addClass('clckd-vte js-is-active-vote')
                .closest('.answr-vote')
                .find('.upvt')
                .removeClass('clckd-vte js-is-active-vote');
            $this.html(parseInt($this.find(".upvt-cnt").html()) + 1); // decreasing the count when user clicks
            window.ga && ga('send', 'event', "QNA", "click", "downVote");
            // QnA.ajaxFunctions.voteAnswer(answerId, 'dislike', $this); 
        },
        viewAllAnswers: function($this) {
            var questionId = $this.closest('.qstn-answr').data('question-id');
            window.location.hash = 'ans-qstn-' + questionId;
        },
        gotoNextQuestion: function($this) { // `$this` is an optional parameter (NOT applicable when next question is AUTOMATICALLY loaded)
            if (!QnA.data.leastAnsweredQuestionsList[0]) {
                if ($this) {
                    $this.closest('.answr-next-qstn').text('No more questions');
                }
                return;
            }
            var questionId = QnA.data.leastAnsweredQuestionsList[0].questionId,
                hash = window.location.hash;
            if (/hide-ans/.test(hash)) {
                window.location.hash = 'ans-qstn-hide-ans-' + questionId;
            } else {
                window.location.hash = 'ans-qstn-' + questionId;
            }
            QnA.data.leastAnsweredQuestionsList.shift();
        }
    },
    inputHandler: {
        email: function(emailInput, $emailError) {
            var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!regex.test(emailInput)) {
                $emailError.slideDown();
                return false;
            }
            return true;
        },
        text: function(textInput, $textError) {
            var regex = /^[a-z\d\-_\s?]+$/i;
            if (!regex.test(textInput) || textInput.length < 2) {
                $textError.slideDown();
                return false;
            }
            return true
        }
    },
    prefillEmail: function() {
        if (Modules.Cookie.get) {
            $('input[type=email]').val(Modules.Cookie.get('msp_login_email'));
        }
    },
    setEmailCookie: function(emailInput) {
        if (!Modules.Cookie.get('msp_login_email')) {
            setCookie("msp_login_email", emailInput, 365);
        }
    },
    hashHandler: function(hash) {
        var id;
        if (hash.length) {
            /*
            if ( /ask-qstn/.test(hash)) {
                $('.ask-qstn').removeClass('collapse');
                $('.js-user-answrs').addClass('all-shwn'); // show question and its answers as one
                $('.js-user-answrs, .js-qstn-answr').show(); // Show all the AnswerQues + UserAns divs
                $('.js-qstn-answr .js-wrt-answr__ttl').show(); // show button/link to open an answer form
                $('.js-qstn-answr .js-wrt-answr-form').hide(); // hide the answer forms themselves
                QnA.data.answeringSingleQuestion = false;
            } else if ( /read-qstn/.test(hash)) {
                id = hash.split('-').pop(); // Fetch Question ID from hash 
                $('.js-user-answrs').removeClass('all-shwn'); // Do not club a question close to its answers
                QnA.data.answeringSingleQuestion = false;
                $('.js-ask-qstn__btn').closest('.ask-qstn').addClass('collapse'); // Hide ask question form
                $('.js-user-answrs, .js-qstn-answr').hide(); // Hide all the AnswerQues + UserAns divs
                $('.js-qstn-answr[data-question-id=' + id + ']').show(); // show only required AnswerQues
                $('.js-user-answrs[data-question-id=' + id + ']').show(); // show only required UserAns
            } else if ( /ans-qstn/.test(hash)) {
                id = hash.split('-').pop(); // Fetch Question ID from hash 
                $('.js-user-answrs').removeClass('all-shwn'); // Do not club a question close to its answers
                QnA.data.answeringSingleQuestion = true;
                $('.js-ask-qstn__btn').closest('.ask-qstn').addClass('collapse'); // Hide ask question form
                $('.js-user-answrs, .js-qstn-answr').hide(); // Hide all the AnswerQues + UserAns divs
                $('.js-qstn-answr[data-question-id=' + id + '] .js-wrt-answr__ttl').hide(); // show only required AnswerQues
                $('.js-qstn-answr[data-question-id=' + id + '], .js-qstn-answr[data-question-id=' + id + '] .js-wrt-answr-form').show(); // show only required AnswerQues and AnswerForm
                $('.answr-next-qstn').show(); // Display option to answer other questions
                if (!/hide-ans/.test(hash)) {
                    $('.js-dsply-answrs').hide();
                    $('.js-user-answrs[data-question-id=' + id + ']').show(); // show all the UserAns divs for that question if 'hide-ans' is not in hash
                } else {
                    $('.js-dsply-answrs').show();
                }
            } else 
            */
            if (/ans-qstn/.test(hash)) {
                var q_id = $(".wrt-answr__ttl").data("qid");
                (Modules.Cookie.get('msp_uid') % 2) ?
                openPopup("/review/qna/popup/answer_question.php?source=desktop_q_single&q_id=" + q_id):
                    openPopup("/review/qna/popup/fb_answer_question.php?source=desktop_q_single&q_id=" + q_id);
                //openPopup("/review/qna/popup/answer_question.php?source=desktop_q_single&q_id="+q_id);
                $(".popup-overlay") && $(".popup-overlay").addClass("noclose");
                $(".popup-closebutton").on("click", function() {
                    //window.location.hash = '';
                });
            }
        } else {
            /*
            // No hash condition: (Show all questions and answers):
            QnA.data.answeringSingleQuestion = false;
            $('.js-user-answrs').addClass('all-shwn'); // show question and its answers as one
            $('.js-user-answrs, .js-qstn-answr').show(); // Show all the AnswerQues + UserAns divs
            $('.js-qstn-answr .js-wrt-answr__ttl').show(); // show button/link to open an answer form
            $('.js-qstn-answr .js-wrt-answr-form').hide(); // hide the answer forms themselves
            */
        }
    },
    addAndSortQuestions: function() { // sorts questions on page from least answered to most answered.
        // Should be called on load to fetch all questions for a product at one time.
        // MUST BE CALLED after hashHandler() function.
        var hash = window.location.hash,
            id = false;
        if (QnA.data.answeringSingleQuestion) {
            id = +hash.split('-').pop();
        }
        $('.qstn-answr').each(function() {
            var questionId = +$(this).data('question-id'),
                answerCount = $('.user-answrs[data-question-id=' + questionId + '] .user-answrs__answr').length;
            // If currently viewing one particular question, 
            // Do not add it to the list of least answered questions (We don't want to see it again).
            if (id !== questionId) {
                QnA.data.leastAnsweredQuestionsList.push({
                    questionId: questionId,
                    numAnswers: answerCount
                });
            }
        });
        QnA.data.leastAnsweredQuestionsList.sort(function(q1, q2) {
            return q1.numAnswers - q2.numAnswers;
        });
    },
    init: function() {
        /* Initial Hash Trigger (On Load): */
        QnA.hashHandler(window.location.hash);
        /* Make a list of all questions and sort them (ONE time operation - on load) */
        QnA.addAndSortQuestions(); // MUST COME AFTER hashHandler function (on load).

        /* Hash change on user action: */
        $(window).on('hashchange', function() {
            QnA.hashHandler(window.location.hash);
        });

        /* Prefill data functions: */
        QnA.prefillEmail();

        /* Puting random numbers in upvote, downvote and follow */
        $(".upvt").each(function(index) {
            //fetching numbers from backend for now.
            //$(this).html(QnA.generalFunctions.randomInt(20, 40));
            //$($(".dwnvt")[index]).html(QnA.generalFunctions.randomInt(0, 20));
            //$($(".js-qstn-answr__flw__count")[index]).html(QnA.generalFunctions.randomInt(10, 100));

        });

        /* Event Handlers for showing/hiding: */
        $('.js-ask-qstn__btn').on('click', function(e) {
            e.preventDefault();
            //QnA.eventFunctions.showQuestionForm($(this));

            window.ga && ga('send', 'event', "QNA", "click", "ask-qstn");
        });

        $(".js-qstn-answr__flw").on('click', function() {
            QnA.eventFunctions.followQuestion($(this));
        });

        $('.js-wrt-answr__ttl').on('click', function() {
            //QnA.eventFunctions.showAnswerForm($(this));

            window.ga && ga('send', 'event', "QNA", "click", "write-ans");
        });

        $('.js-dsply-answrs').on('click', function(e) {
            e.preventDefault();
            QnA.eventFunctions.viewAllAnswers($(this));
        });

        $('.js-next-qstn-link').on('click', function(e) {
            e.preventDefault();
            QnA.eventFunctions.gotoNextQuestion($(this));
        });

        /* Form submit & Ajax handlers: */
        $(".js-ask-qstn__submit").on("click", function(e) {
            e.preventDefault();
            var emailInput = $('.ask-qstn-form__ttl').val(),
                $emailError = $('.ask-qstn__ttl-err'),
                quesInput = $('.ask-qstn-form__desc').val(),
                $quesError = $('.ask-qstn-form__desc-err'),
                $successDiv = $('.ask-qstn__scs');

            if (!QnA.inputHandler.email(emailInput, $emailError) ||
                !QnA.inputHandler.text(quesInput, $quesError)) {
                return;
            }
            QnA.setEmailCookie(emailInput);
            QnA.ajaxFunctions.submitQuestion(emailInput, quesInput, $successDiv);
        });

        $('.js-wrt-answr-form__sbmt').on('click', function(e) {
            e.preventDefault();
            var $this = $(this),
                emailInput = $this.closest('.wrt-answr-form').find('.wrt-answr-form__eml').val(),
                $emailError = $this.closest('.wrt-answr-form').find('.wrt-answr-form__eml-error').slideDown(),
                ansInput = $this.closest('.wrt-answr-form').find('.wrt-answr-form__desc').val(),
                $ansError = $this.closest('.wrt-answr-form').find('.wrt-answr-form__desc-error').slideDown(),
                questionId = $this.closest('.qstn-answr').data('question-id');

            if (!QnA.inputHandler.email(emailInput, $emailError) ||
                !QnA.inputHandler.text(ansInput, $ansError)) {
                return;
            }
            QnA.setEmailCookie(emailInput);
            QnA.ajaxFunctions.submitAnswer(emailInput, ansInput, questionId);
        });

        $(".js-qsnt-upvt").on('click', function() {
            QnA.eventFunctions.upvoteQuestion($(this));
        });
        $('.qstn-vote .upvt').on('click', function() {
            QnA.eventFunctions.upvoteQuestion($(this));
        });
        $('.qstn-vote .dwnvt').on('click', function() {
            QnA.eventFunctions.downvoteQuestion($(this));
        });

        $('.answr-vote .upvt').on('click', function() {
            QnA.eventFunctions.upvoteAnswer($(this));
        });
        $('.answr-vote .dwnvt').on('click', function() {
            QnA.eventFunctions.downvoteAnswer($(this));
        });

        $(".js-ask-qstn__view-all-qstn--href").on("click", function() {
            window.ga && ga('send', 'event', "QNA", "click", "read-more-questions");
        });
        //View all ques btn on single page
        $(".ask-qstn__view-all-qstn__inr").on("click", function() {
            window.ga && ga('send', 'event', "QNA", "click", "viewall-ques-goto-list");
        });
        //Back to product link
        $(".ask-qstn__rtrn--href").on("click", function() {
            window.ga && ga('send', 'event', "QNA", "click", "back-to-pdp");
        });
    }
};

$(document).ready(function() {
    /* Initialize QnA Page functionality: */
    QnA.init();

    Modules.$doc.on("click", ".js-user-answr__more-answr", function() {
        var state = $(this).data("state"),
            question_id = $(this).parents(".js-user-answrs").data("question-id"),
            answers_count = $(this).parents(".js-qstn-answr").data("ans-count"),
            moreAnswr = "More Answers (" + (parseInt(answers_count, 10) - 1) + ")";
        if (state === "collapsed") {
            $(this).text("Collapse Answers").data("state", "opened");
            if (parseInt(answers_count) > 10)
                $(this).before('<a class="user-answr__all-answrs js-all-answrs" href="single.php?q_id=' + question_id + '" target="_blank">Show all answers (' + answers_count + ')</a>');
            window.ga && ga('send', 'event', "QNA", "click", "read-more-answers");
        } else {

            $(this).text(moreAnswr).data("state", "collapsed");
            // $(this).parent().find(".js-answr-qstn").remove();
            $(this).parent().find(".js-all-answrs").remove();
            window.ga && ga('send', 'event', "QNA", "click", "collapse-more-answers");
        }
        $(this).toggleClass("qna__more-answr--opnd");
        $(this).parent().parent().find(".user-answrs__answr").toggleClass("user-answrs__answr--show");
    });

    Modules.$doc.on("submit", ".js-ask-qstn__frm", function() {
        $(".js-ask-qstn").click();
        return false;
    });

    $(".js-qstn-txt").on("focus", function() {
        $(".qna__ask-wrpr, .ask-qstn__ask-wrpr").css("border-color", "#999");
    }).on("blur", function() {
        $(".qna__ask-wrpr, .ask-qstn__ask-wrpr").css("border-color", "#bbb");
    });
});

$('body').on('click', '.js-ask-qstn', function(e) {
    if (!validInput(e)) {
        return false;
    }
});

Modules.$doc.on("keyup", ".js-qstn-txt", function() {
    console.log($(this).val().length);
    var queryLength = $(this).val().length;
    $(".qna__ask-wrpr").removeClass("qna__ask-wrpr-err");
    $(".qna__ask-wrpr-msg").hide();
    $(".js-qna__srch-kywrds").show();
    $(".ask-qstn__ask-wrpr").removeClass("ask-qstn__ask-wrpr-err");
    $(".ask-qstn__ask-wrpr-msg").hide();
});

//If header is scrollable then dont hide the subheader
Modules.$win.scroll(Modules.throttle(function(e) {
    var scrollTop = Modules.$win.scrollTop(),
        delta = 5,
        $subHeader = $('.sub-hdr'),
        $header = $('.hdr'),
        subHeaderHeight = $subHeader.outerHeight(),
        footerOffset = $($(".ftr")[0]).offset().top,
        $adSidebar = $('.ad-sdbr'),
        sidebarHeight = $adSidebar.height() + 40;

    if (footerOffset < (sidebarHeight + scrollTop) && !visited) {
        var pos = footerOffset - 620;
        $adSidebar.css("position", "absolute").css("top", pos + "px");
        visited = true;
    } else if (footerOffset > (sidebarHeight + scrollTop) && visited) {
        $adSidebar.css("position", "fixed").css("top", "20px");
        visited = false;
    } else if (footerOffset > (sidebarHeight + scrollTop)) {
        if ($header.height() > scrollTop) {
            $adSidebar.css("position", "absolute").css("top", "120px");
        } else {
            $adSidebar.css("position", "fixed").css("top", "20px");
        }
    }

    // QnA Scrolling Event
    if ($('.qna').length > 0) {
        if (scrollTop >= $('.qna').position().top && !qnaScrolled) {
            ga('send', 'event', 'QNA', 'qna-scroll', "", {
                nonInteraction: true
            });
            qnaScrolled = true;
        }
    }

    // Recommendations Scrolling Event
    if ($('#recomm').length > 0) {
        if (scrollTop >= $('#recomm').position().top && !recommScrolled) {
            ga('send', 'event', 'recommendations', 'scrollTo', "", {
                nonInteraction: true
            });
            recommScrolled = true;
        }
    }

    // Hide Menu on Scroll
    if ($('.drpdwn-menu-ovrly--show').length) {
        $('.js-ctgry-btn').click(); //if browse menu is displayed close it  
    }
    if (!$header.hasClass("hdr--scrl")) {

        if (scrollTop <= 0) {
            $subHeader.removeClass('not-vsbl');
            if ($(".lead-hdr-wrpr").length && !Modules.Cookie.get("msp_lead_hdr_hide")) {
                $(".lead-hdr-wrpr").slideDown();
            }
            return;
        }
        if (Math.abs(lastScrollTop - scrollTop) <= delta) return;

        if (scrollTop > lastScrollTop && scrollTop > subHeaderHeight) {
            // Scroll Down
            $header.addClass('hdr--sld');
            $subHeader.addClass('not-vsbl');
            if ($(".lead-hdr-wrpr").length && !Modules.Cookie.get("msp_lead_hdr_hide")) {
                $(".lead-hdr-wrpr").slideUp();
            }
            $(".ad-sdbr").addClass("ad-sdbr--top");
        } else {
            // Scroll Up
            if (scrollTop + Modules.$win.height() < Modules.$doc.height()) {
                $subHeader.removeClass('not-vsbl');
                $header.removeClass('hdr--sld');
                $(".ad-sdbr").removeClass("ad-sdbr--top");
                if ($(".lead-hdr-wrpr").length && !Modules.Cookie.get("msp_lead_hdr_hide")) {
                    $(".lead-hdr-wrpr").slideDown();
                }
            }
        }

        lastScrollTop = scrollTop;
    }

    //Run tasks assigned to Lazy Load which run when scroll position hits the corresponding nodes.
    Modules.lazyLoad.run();
}, 100));
/* RUI:: reveal new subheader when user scrolls - end */


//When coming for answer ackg email to asker.Clicks on say thanks btn.
if (url.getAQueryParam && url.getAQueryParam('ref') === "email") {
    openPopup("/review/qna/popup/thankyou.html");
}

function validInput(e) {
    var searchText = $('.js-qstn-txt').val().length;
    if (!searchText) {
        $(".qna__ask-wrpr").addClass("qna__ask-wrpr-err");
        $(".js-qna__srch-kywrds").hide();
        $(".qna__ask-wrpr-msg").show();
        $(".ask-qstn__ask-wrpr").addClass("ask-qstn__ask-wrpr-err");
        $(".ask-qstn__ask-wrpr-msg").show();
        return false;
    } else {
        return true;
    }
}

function validInput(e) {
    var searchText = $('.js-qstn-txt').val().length; 
    if (!searchText) {
        
        $(".qna__ask-wrpr").addClass("qna__ask-wrpr-err");
        $(".js-qna__srch-kywrds").hide();
    $(".qna__ask-wrpr-msg").show();
    return false;
    } else {
        return true;
    }
}

Modules.$doc.on("focus", ".js-qstn-txt", function () {
   
    if (window.ga) {
        ga('send', 'event', 'QNA', 'focus', 'search-input');
    }
});

Modules.$doc.one("click", ".js-qna__srch-kywrd", function() {
    if(window.QnASearch) {
        QnASearch.data.searchWordsArr = QnASearch.buildFunction.init(QnASearch.settings.qnaApi());
    }
});

Modules.$doc.on("click", ".js-qna__srch-kywrd", function() {
    window.ga && ga('send', 'event', 'qna', 'click', 'qna-suggested-search');
    $('.js-qstn-txt').val($(this).text()).trigger('input');
});

Modules.$doc.on("click", ".js-more-answr", function () {
    var state = $(this).data("state"),
        question_id = $(this).parents(".qna__item").data("qid") || $(this).parents(".qna__item").data("question-id"),
        answers_count = $(this).parents(".qna__item").data("ans-count");
    if(state==="collapsed"){
        $(this).text("Collapse Answers").data("state","opened");
        if(parseInt(answers_count) > 5)
            $(this).before('<a class="qna__all-answrs js-all-answrs" href="/qna/single/?q_id='+ question_id +'" target="_blank">Show all answers ('+ answers_count +')</a>');
    } else {
        var moreAnswr = "More Answers (" + ( parseInt(answers_count,10) -1 ) + ")";
        $(this).text(moreAnswr).data("state","collapsed");
        $(this).parent().find(".js-all-answrs").remove();
    }
    $(this).toggleClass("qna__more-answr--opnd");
    $(this).parent().find(".qna__answr").toggleClass("qna__answr--show");
    $(this).parent().find(".qna__answr-upvt").toggleClass("hide");
});


Modules.$doc.off('.qns__frm').on("submit", ".qna__frm", function (e) {
    if (!validInput(e)) {
        return false;
    }
    $(".js-ask-qstn").click();
    return false;   
});

$('body').on('click' , '.js-ask-qstn' , function (e) {
    if (!validInput(e)) {
        return false;
    }
})

Modules.$doc.on("click", ".js-qna-bbl", function(){
    $(this).hide();
});

Modules.$doc.on("click", ".js-ask-qstn__submit", function (e) {
    e.preventDefault();
    var emailInput = $(".ask-qstn-form__ttl").val(),
        quesInput = $(".ask-qstn-form__desc").val(),
        email = /^(([^<>()[\]\.,;:\s@"]+(\.[^<>()[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        text = /^[a-z\d\-_\s?]+$/i;
    if (!email.test(emailInput)) {
        $(".ask-qstn__ttl-err").slideDown();
        return false;
    }
    if (!text.test(quesInput) || quesInput.length < 20) {
        $(".ask-qstn-form__desc-err").slideDown();
        return false;
    }
    $.ajax({
        "url": "/review/qna/submit_qna.php",
        "data": {
            "email": emailInput,
            "question": quesInput,
            "mspid": PriceTable.dataPoints.mspid
        }
    }).done(function () {
        $(".ask-qstn__scs").slideDown();
    });
    return false;
});

$(document).on("click", ".js-qna__rqst-answr", function(e) {
    $this = $(this);
    e.preventDefault();
    e.stopPropagation();
    var questionId = $(this).data("qid");
    if ($this.data("followstate") == "unfollow") {
        return;
    } else {
        $this.addClass('js-qna__rqst-answr-actv');
    }
    openPopup('/review/qna/popup/request_answer.php?source=desktop_q_list&q_id=' + questionId);
});

Modules.$doc.on("focus", ".js-qstn-txt", function() {
    if (window.ga) {
        ga('send', 'event', 'QNA', 'focus', 'search-input');
    }
});
function storeProductInfo() {
    var url = document.URL;
    if (dataLayer[0].url !== undefined && (url.indexOf('-msp') > -1 || url.indexOf('-msf') > -1 || url.indexOf('products') > -1 || url.indexOf('-dealid') > -1)) {
        var productInfo = {
            title: dataLayer[0].title,
            image: dataLayer[0].image,
            price: dataLayer[0]["min-price"],
            url: dataLayer[0].url,
            mspid: dataLayer[0].mspid,
            productType: dataLayer[0]["product-type"],
            timeStamp: Date.now()
        }
        if (window.indexedDB) {
            var request = window.indexedDB.open("userDb", 1);
            request.onupgradeneeded = function(event) {
                var db = event.target.result;
                // Create an objectStore for this database
                if (!db.objectStoreNames.contains("recentlyViewed")) {
                    var objectStore = db.createObjectStore("recentlyViewed", { autoIncrement: true });
                    objectStore.createIndex("url", "url", { unique: true });
                    objectStore.createIndex("timeStamp", "timeStamp", { unique: false });
                }
            };
            request.onerror = function(event) {
                // Do something with request.errorCode!
                console.log("error on indexdb open");
            };
            request.onsuccess = function(event) {
                db = event.target.result;
                var transaction = db.transaction(["recentlyViewed"], "readwrite");
                var store = transaction.objectStore("recentlyViewed");
                var myIndex = store.index('url');
                var getKeyRequest = myIndex.getKey(productInfo.url);
                getKeyRequest.onsuccess = function(event) {
                    var key = getKeyRequest.result;
                    if (key === undefined) {
                        store.put(productInfo);
                    } else {
                        var getRequest = store.get(key);
                        getRequest.onsuccess = function(event) {
                            var oldPrice = getRequest.result.price;
                            var newPrice = productInfo.price;
                            var lastVisited = new Date(getRequest.result.timeStamp).toDateString();
                            if (lastVisited == new Date().toDateString()) {
                                lastVisited = '';
                            } else {
                                lastVisited = ' on ' + lastVisited;
                            }
                            if (oldPrice > newPrice && oldPrice != '0' && newPrice != '0') {
                                var priceDiff = ((oldPrice - newPrice) * 100 / oldPrice).toFixed(1);
                                var priceText = "Price dropped by " + priceDiff + "% since your last visit" + lastVisited;
                                var eventAction = 'Dropped';
                            } else if (oldPrice < newPrice && oldPrice != '0' && newPrice != '0') {
                                var priceDiff = ((newPrice - oldPrice) * 100 / oldPrice).toFixed(1);
                                var priceText = "Price increased by " + priceDiff + "% since your last visit" + lastVisited;
                                var eventAction = 'Increased';
                            } else if (oldPrice = newPrice && oldPrice != '0' && newPrice != '0') {
                                var priceDiff = 0;
                                var priceText = "Price remained same since your last visit" + lastVisited;
                                var eventAction = 'Remainedsame';
                            }
                            //disabled by mallik
                            if (false && priceText !== undefined) {
                                var priceDiffHtml = "<div class='prdct-dtl__str-ftrs'><span class='prdct-dtl__str-ftr prdct-dtl__str-ftr--hghlght'>" + priceText + "</span>  </div>";
                                $(".prdct-dtl__str-dtls").append(priceDiffHtml);
                                ga('send', 'event', 'pricetool', eventAction, getRequest.result.mspid, priceDiff);
                            }
                            store.put(productInfo, key);
                        }
                    }
                }
                var countRequest = store.count();
                countRequest.onsuccess = function() {
                    if (countRequest.result > 20) {
                        delCount = countRequest.result - 20;
                        store.index("timeStamp").openCursor().onsuccess = function(event) {
                            var cursor = event.target.result;
                            if (cursor && delCount > 0) {
                                delCount--;
                                console.log(delCount);
                                store.delete(cursor.primaryKey);
                                cursor.continue();
                            }
                        };
                    }
                }
            };
        }
    }
}

function fillRecentlyViewedSection() {
    var isDealPage = window.location.pathname === "/deals/" ? true : false;

    if (window.indexedDB) {
        var request = indexedDB.open("userDb", 1);
        request.onupgradeneeded = function(event) {
            var thisDB = event.target.result;

            // Create an objectStore for this database
            if (!thisDB.objectStoreNames.contains("recentlyViewed")) {
                var objectStore = thisDB.createObjectStore("recentlyViewed", { autoIncrement: true });
                objectStore.createIndex("url", "url", { unique: true });
                objectStore.createIndex("timeStamp", "timeStamp", { unique: false });
            }
        };
        request.onerror = function(event) {
            // Do something with request.errorCode!
            console.log("error on indexdb open");
        };
        request.onsuccess = function(event) {
            db = event.target.result;
            var transaction = db.transaction(["recentlyViewed"], "readonly");
            var objectStore = transaction.objectStore("recentlyViewed");
            var cursor = objectStore.index("timeStamp").openCursor(null, "prev");
            var startHtml = '<div class="sctn" id="rcntly_vwd" data-slideitem="prdct-item" data-slideitemwrprper="sctn__inr"><div class="sctn__hdr clearfix"><div class="sctn__ttl">You Recently Viewed</div><div class="sctn__nvgtn"></div></div><div class="sctn__inr prdct-grid clearfix">';
            var snippet = '<div class="prdct-item" data-mspid="--mspid--"><div class="prdct-item__save-btn js-save-btn"></div><a class="prdct-item__img-wrpr" href="--url--"><img class="prdct-item__img" src="https://assets.mspcdn.net/w_70/logos/mysmartprice/owl/lazy.png" data-lazy-src="--image--" alt="--alttitle--"></a><div class="prdct-item__dtls"><a class="prdct-item__name" href="--hrefurl--">--title--</a><div class="prdct-item__prc"><span class="prdct-item__rpe">--priceSym--</span><span class="prdct-item__prc-val">--price--</span></div></div></div>';
            var endHtml = '</div></div>';
            var rvCount = 0;
            cursor.onsuccess = function(e) {
                var res = e.target.result;
                console.log(res);
                if (rvCount == 5) {
                    res = null;
                }
                if (res) {
                    newSnippet = snippet;
                    var price = res.value.price,
                        productType = res.value.productType;

                    if ((isDealPage && productType == "deals") || (!isDealPage && productType != "deals")) {
                        price = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        var priceSym = '₹';
                        if (price == '0') {
                            var priceSym = '';
                            price = 'Not Available';
                        }
                        newSnippet = newSnippet.replace('--url--', res.value.url + '?ref=rv').replace('--title--', res.value.title).replace('--image--', res.value.image).replace('--price--', price).replace('--mspid--', res.value.mspid).replace('--alttitle--', res.value.title).replace('--hrefurl--', res.value.url).replace('--priceSym--', priceSym);
                        rvCount++;
                        startHtml += newSnippet;
                    }

                    res.continue();

                } else {
                    if (rvCount > 0) {
                        startHtml += endHtml;
                        if ($('.spnsr-cntnt').length) {
                            $('.spnsr-cntnt').before(startHtml);
                        } else {
                            $('.main-wrpr').append(startHtml);
                        }
                        lazyLoadImages();
                    }
                }
            }
        }
    }
}

// Function to store current viewed item to indexed db
storeProductInfo();

$(document).ready(function() {
    if (window.location.pathname == '/' || window.location.pathname == '/deals/') {
        fillRecentlyViewedSection();
    }
});
// expert review page gallery js
Modules.$doc.on("click", "#exprt-rvw__prvw .exprt-rvw__glry-img", function(e) {
  if(!$(this).parent().hasClass("exprt-rvw__glry-thmbnl")) {
    return;
  }
  var $imageGalleryThumbnail = $(this).closest(".exprt-rvw__glry-thmbnl"),
    imageLeftCoordinate = $(this).offset().left,
    imageRightCoordinate = $(this).width() + imageLeftCoordinate,
    firstImageLeftCoordinate = $imageGalleryThumbnail.find(".exprt-rvw__glry-img:first").offset().left,
    parentLeftCoordinate = $imageGalleryThumbnail.offset().left,
    parentWidth = $imageGalleryThumbnail.width() + 15,
    imageGallery = $(this).closest(".exprt-rvw__glry");

  $(imageGallery).find(".exprt-rvw__glry-img-active").removeClass("exprt-rvw__glry-img-active");
  $(this).addClass("exprt-rvw__glry-img-active");
  $(imageGallery).find(".exprt-rvw__glry-main-img").attr("src", $(this).data("image-src"))

    $(imageGallery).find(".exprt-rvw__glry-cntr").html(($(this).data("image-index") + 1) + " of " + ($(imageGallery).find("img").length - 1));
    $(imageGallery).find(".exprt-rvw__glry-main-img").data("href", "/mobile/review_image_popup.php?image_url=" + encodeURIComponent($(this).data("image-src")));
    $(imageGallery).find(".exprt-rvw__glry-main-img").data("image-index", $(this).data("image-index"));

  // scroll image if not visible
  if (imageRightCoordinate > parentLeftCoordinate + parentWidth) {
    $imageGalleryThumbnail.animate({
      scrollLeft: imageRightCoordinate - (firstImageLeftCoordinate + parentWidth) + 40
    }, "fast");
  }
  else if (imageLeftCoordinate < parentLeftCoordinate) {
    $imageGalleryThumbnail.animate({
      scrollLeft: firstImageLeftCoordinate - imageLeftCoordinate
    }, "fast");
  }
});

// expert review page gallery js
Modules.$doc.on("click", "#exprt-rvw__prvw .zoom-viewer__arrow", function(e) {
    var imageGallery = $(this).closest(".exprt-rvw__glry"),
      currentImageIndex = $(imageGallery).find(".exprt-rvw__glry-main-img").data("image-index"),
      newImageElement = null;

    currentImageIndex = currentImageIndex !== undefined ? parseInt(currentImageIndex, 10) : 0;

    currentImageIndex = $(this).hasClass("zoom-viewer__arrow--prev") ? currentImageIndex - 1 : currentImageIndex + 1;

    if(currentImageIndex > $(imageGallery).find("img").length - 2)
      currentImageIndex = 0;

    if(currentImageIndex < 0)
      currentImageIndex = $(imageGallery).find("img").length - 2;

    newImageElement = $(imageGallery).find(".exprt-rvw__glry-img[data-image-index='"+ currentImageIndex +"']");
    $(newImageElement).click();
  });

//Show video on click of thumbnail - Start
$(".exprt-rvw__vid-play").on("click", function(e) {
    var $playNode = $(this);
    $imageNode = $playNode.siblings(".exprt-rvw__vid-img"),
        $container = $playNode.parent(),
        height = $container.height(),
        width = $container.width(),
        videoId = $imageNode.data("video-id");

    $imageNode.remove();
    $playNode.remove();
    $container.append('<iframe class="exprt-rvw__vid-iframe" width="' + width + '" height="' + height + '" src="//www.youtube.com/embed/' + videoId + '?rel=0&autoplay=1" frameborder="0" allowfullscreen></iframe>');
});
//Show video on click of thumbnail - End
Modules.$doc.ready(function() {
    if ($(".usr-rvw-form--sngl").length) {

        // this class is being added from php
        // if the msp uid is even
        if ($(".usr-rvw-form__ttl-wrpr-vsbl").length > 0) {
            window.ga && ga('send', 'event', "user-review", "landing", "title-visible");
        } else {
            window.ga && ga('send', 'event', "user-review", "landing", "title-hidden");
        }

        var ratingWidth = $(".usr-rvw-form__rtng-wrpr .rtng-star").width(),
            $ratingInr = $(".usr-rvw-form__rtng-wrpr .rtng-star__inr"),
            $ratingRemark = $(".usr-rvw-form__rtng-rmrk"),
            remarksList = $ratingRemark.data("remarks").split(","),
            $ratingInput = $(".usr-rvw-form__rtng-inpt");
        isUserDetailsDisplayed = false;

        if (url.getAQueryParam && url.getAQueryParam('rating')) {
            var inrWidth = parseInt(url.getAQueryParam('rating')) * 20,
                rating = parseInt(url.getAQueryParam('rating')) || 1,
                remarks = ["Terrible", "Bad", "Average", "Good", "Excellent"];

            $ratingRemark.data("remark", remarks[rating - 1]);
            $ratingInput.val(rating);
            $ratingInr.data("width", inrWidth).addClass("rtng-star__inr--rated");
            $ratingInr.width((rating * 20) + "%");
            $ratingRemark.text(remarks[rating - 1]);

            setTimeout(function() {
                $(".usr-rvw-form__desc-wrpr").slideDown("fast");
                $(".usr-rvw-form__submit").slideDown("fast");
            }, 500)
            // enlargeCompressRating(false);
        }

        Modules.$doc.on("keyup", ".js-usr-rvw__desc", function(e) {
            if (e.target.value.trim().length > 0) {
                if ($(".usr-rvw-form__ttl-wrpr-vsbl").length === 0) {
                    $(this).closest(".usr-rvw-form--sngl").find(".usr-rvw-form__ttl-wrpr").slideDown("fast");
                }
                // enlargeCompressRating(false);
            } else {
                if ($(".usr-rvw-form__ttl-wrpr-vsbl").length === 0) {
                    $(this).closest(".usr-rvw-form--sngl").find(".usr-rvw-form__ttl-wrpr").slideUp("fast");
                }
                // enlargeCompressRating(true);
            }
        });

        Modules.$doc.on("mousemove", ".usr-rvw-form__rtng-wrpr .rtng-star", function(e) {
            var offsetX = parseInt(e.pageX - $(this).offset().left, 10),
                rating = Math.ceil((offsetX / ratingWidth) * 5) || 1;

            $ratingRemark.text(remarksList[rating - 1]);
            if (offsetX <= ratingWidth) {
                $ratingInr.width((rating * 20) + "%");
            }
        });

        Modules.$doc.on("click", ".usr-rvw-form__rtng-wrpr .rtng-star", function() {
            var inrWidth = $ratingInr.width(),
                rating = Math.ceil((inrWidth / ratingWidth) * 5) || 1;

            $ratingRemark.data("remark", $ratingRemark.text());
            $ratingInput.val(rating);
            $ratingInr.data("width", inrWidth).addClass("rtng-star__inr--rated");

            $(".usr-rvw-form__desc-wrpr").slideDown("fast");
            $(".usr-rvw-form__submit").slideDown("fast");

            // enlargeCompressRating(false);
        });

        Modules.$doc.on("mouseleave", ".usr-rvw-form__rtng-wrpr .rtng-star", function() {
            if ($ratingInr.hasClass("rtng-star__inr--rated")) {
                $ratingRemark.text($ratingRemark.data("remark"));
                $ratingInr.width($ratingInr.data("width"));
            } else {
                $ratingInr.width(0);
                $ratingRemark.empty();
            }
        });

        Modules.$doc.on("submit", ".usr-rvw-form--sngl", function() {
            MSP.utils.validate.form([{
                "type": "rating",
                "inputField": $(".usr-rvw-form__rtng-inpt"),
                "errorNode": $(".usr-rvw-form__rtng-err")
            }, {
                "type": "text",
                "inputField": $(".usr-rvw-form__ttl"),
                "errorNode": $(".usr-rvw-form__ttl-err"),
                "options": { "min": 1 }
            }, {
                "type": "required",
                "inputField": $(".usr-rvw-form__desc"),
                "errorNode": $(".usr-rvw-form__desc-err"),
                "options": { "min": 1 }
            }]).done(function() {
                var rating = $(".usr-rvw-form__rtng-inpt").val(),
                    title = $(".usr-rvw-form__ttl").val(),
                    details = $(".usr-rvw-form__desc").val(),
                    errorMessage = "There was a problem submitting your review. Please try again.",
                    email_id = "",
                    mspLoginEmail = Modules.Cookie.get("msp_login_email");

                if (false && Modules.Cookie.get("msp_login_email") && Modules.Cookie.get("msp_login")) {
                    var submit_api = "/msp/review/save_a_review.php";
                } else {
                    var submit_api = "/msp/review/save_review_basic.php";
                }

                // 1st priority: User Email Query String
                if (url.getAQueryParam && url.getAQueryParam('user')) {
                    try {
                        email_id = atob(url.getAQueryParam('user')); // throws error if unsuccessful
                        doAjax(true);
                    } catch (e) {
                        // Error in reading QS email: (Check for email cookie instead first)
                        if (mspLoginEmail) {
                            email_id = mspLoginEmail;
                            doAjax(true);
                        } else {
                            loginFetchEmail.call(this);
                        }
                    }
                } else if (mspLoginEmail) { // 2nd priority: MSP Login Email Cookie
                    email_id = mspLoginEmail;
                    doAjax(true);
                } else {
                    loginFetchEmail.call(this);
                }

                /*******************/

                function loginFetchEmail() {
                    loginCallback(doAjax, this, [false]);
                }

                function doAjax(qsEmailExists) {
                    if (!qsEmailExists) email_id = Modules.Cookie.get('msp_login_email');

                    $.ajax({
                        type: "POST",
                        url: submit_api,
                        data: {
                            "mspid": url.getAQueryParam('mspid'),
                            "title": title,
                            "details": details,
                            "rating_review": rating,
                            "email_id": email_id,
                            "source": 'desktop'
                        }
                    }).done(function(response) {
                        response = JSON.parse(response);
                        if (response.success == 1) {
                            $(".sctn__hdr").hide();
                            $(".usr-rvw-prdct").addClass("usr-rvw-prdct__scs");
                            $(".usr-rvw-form--sngl").hide();
                            $(".usr-rvw-form__wrpr").hide();
                            $(".usr-wrt-rvw__scs").fadeIn();
                            $(".usr-rvw-form").data("submitted", true);
                            $(".usr-wrt-rvw__scs-desc").after($(".usr-rvw-form--sngl").html());
                            $(".usr-rvw-form__rtng-lbl").text("You rated");

                            if ($(".usr-rvw-form__ttl-wrpr-vsbl").length > 0) {
                                window.ga && ga('send', 'event', "user-review", "submit", "title-visible");
                            } else {
                                window.ga && ga('send', 'event', "user-review", "submit", "title-hidden");
                            }

                        } else {
                            alert(errorMessage);
                        }
                    }).fail(function() {
                        alert(errorMessage);
                    });
                }
            });
            return false;
        });

        function enlargeCompressRating(enlargeCompress) {
            if (enlargeCompress) {
                $(".usr-rvw-prdct").addClass("usr-rvw-prdct--xl");
                $ratingInr.width($ratingInr.width() * 2);
            } else {
                $(".usr-rvw-prdct").removeClass("usr-rvw-prdct--xl");
                $ratingInr.width($ratingInr.width() / 2);
            }

            ratingWidth = $(".usr-rvw-form__rtng-wrpr .rtng-star").width();
        }
    }
});

;
(function() {
    if (!$(".usr-wrt-rvw").length) {
        return;
    }
    var ratingWidth = $(".usr-rvw-form__rtng-wrpr .rtng-star").width(),
        $ratingInr = $(".usr-rvw-form__rtng-wrpr .rtng-star__inr"),
        $ratingRemark = $(".usr-rvw-form__rtng-rmrk"),
        remarksList = $ratingRemark.data("remarks").split(","),
        $ratingInput = $(".usr-rvw-form__rtng-inpt");
    isUserDetailsDisplayed = false;

    if (Modules.Cookie.get("msp_login") === "1") {
        $(".usr-rvw-form__dtls-img").attr("src", Modules.Cookie.get("msp_user_image"));
        $(".usr-rvw-form__dtls-name").text(Modules.Cookie.get("msp_login_name") || "MySmartPrice User");
        $(".usr-rvw-form__dtls-email").text(Modules.Cookie.get("msp_login_email"));
        $(".usr-rvw-form__dtls").show();
        isUserDetailsDisplayed = true;
    }

    Modules.$doc.on("mousemove", ".usr-rvw-form__rtng-wrpr .rtng-star", function(e) {
        var offsetX = parseInt(e.pageX - $(this).offset().left, 10),
            rating = Math.ceil((offsetX / ratingWidth) * 5) || 1;

        $ratingRemark.text(remarksList[rating - 1]);
        if (offsetX <= ratingWidth) {
            $ratingInr.width((rating * 20) + "%");
        }
    });

    Modules.$doc.on("click", ".usr-rvw-form__rtng-wrpr .rtng-star", function() {
        var inrWidth = $ratingInr.width(),
            rating = Math.ceil((inrWidth / ratingWidth) * 5) || 1;

        $ratingRemark.data("remark", $ratingRemark.text());
        $ratingInput.val(rating);
        $ratingInr.data("width", inrWidth).addClass("rtng-star__inr--rated");
    });

    Modules.$doc.on("mouseleave", ".usr-rvw-form__rtng-wrpr .rtng-star", function() {
        if ($ratingInr.hasClass("rtng-star__inr--rated")) {
            $ratingRemark.text($ratingRemark.data("remark"));
            $ratingInr.width($ratingInr.data("width"));
        } else {
            $ratingInr.width(0);
            $ratingRemark.empty();
        }
    });

    Modules.$doc.on("click", ".js-usr-rvw-item-more", function() {
        $(this).hide();
        $(this).closest(".usr-rvw-item__text").find(".usr-rvw-item__text-hide").fadeIn();
    });

    Modules.$doc.on("submit", ".usr-rvw-form", function() {
        loginCallback(function() {
            MSP.utils.validate.form([{
                "type": "rating",
                "inputField": $(".usr-rvw-form__rtng-inpt"),
                "errorNode": $(".usr-rvw-form__rtng-err")
            }, {
                "type": "text",
                "inputField": $(".usr-rvw-form__ttl"),
                "errorNode": $(".usr-rvw-form__ttl-err"),
                "options": { "min": 20 }
            }, {
                "type": "required",
                "inputField": $(".usr-rvw-form__desc"),
                "errorNode": $(".usr-rvw-form__desc-err"),
                "options": { "min": 100 }
            }]).done(function() {
                var rating = $(".usr-rvw-form__rtng-inpt").val(),
                    title = $(".usr-rvw-form__ttl").val(),
                    details = $(".usr-rvw-form__desc").val(),
                    errorMessage = "There was a problem submitting your review. Please try again.";

                $.ajax({
                    type: "POST",
                    url: "/msp/review/save_a_review.php",
                    data: {
                        "mspid": PriceTable.dataPoints.mspid,
                        "title": title,
                        "details": details,
                        "rating_review": rating,
                        "email_id": Modules.Cookie.get("msp_login_email")
                    }
                }).done(function(response) {
                    response = JSON.parse(response);
                    if (response.success == 1) {
                        $(".usr-rvw-form").hide();
                        $(".usr-wrt-rvw__scs").fadeIn();
                        $(".usr-rvw-form").data("submitted", true);
                    } else {
                        alert(errorMessage);
                    }
                }).fail(function() {
                    alert(errorMessage);
                });
            });
        });
        return false;
    });


    // Refer https://developer.mozilla.org/en-US/docs/Web/Events/beforeunload#Example
    window.onbeforeunload = function(e) {
        var message = "You have not finished submitting your review.";
        if (!$(".usr-rvw-form").data("submitted") && $.trim($(".usr-rvw-form__desc").val()).length) {
            (e || window.event).returnValue = message; // Gecko + IE
            return message; // Gecko + Webkit, Safari, Chrome etc.
        }
    }
}());

Modules.$doc.on("click", ".js-usr-rvw-vote-up, .js-usr-rvw-vote-down", (function() {
    // private voteReview function that is declared on load.
    function voteReview(voteButton) {
        var reviewId = voteButton.closest(".usr-rvw__bttm__rvw").data("review-id"),
            mspid = PriceTable.dataPoints.mspid,
            vote = voteButton.hasClass("js-usr-rvw-vote-up") ? 1 : -1,
            parentEl = voteButton.closest('.usr-rvw__bttm__rvw-vote'),
            hasVoted = parentEl.find('span').hasClass('done');
        if(!hasVoted) {
            $.post("/msp/review/post_vote.php", {
                reviewid: reviewId,
                mspid: mspid,
                vote: vote
            });

            var otherVoteButton = parentEl.find('span:not(.text-link)').not(voteButton),
                reportSpamLink = parentEl.find('.js-usr-rvw-rprt-spam');
            otherVoteButton.removeClass('done');
            voteButton.text(Number(voteButton.text()) + 1).addClass('done');
            reportSpamLink.remove();
        }
    }

    // click handler function that runs evertime user clicks.
    return function() {
        loginCallback(voteReview, this, [$(this)]);
        return false;
    }
})());
/* Search Function/Feature */
Modules.$doc.on("submit", ".js-srch-wdgt__frm", function() {
    var srch_inpt = $(".js-hdr-srch").val();
    var search_type = '';
    if ($('.js-srch-wdgt__frm .search_type').val()) {
        search_type = $('.js-srch-wdgt__frm .search_type').val();
    }
    var typed_term = '';
    if ($('.js-srch-wdgt__frm .typed_term').val()) {
        typed_term = $('.js-srch-wdgt__frm .typed_term').val();
    }
    var srch_url = '/msp/search/search.php?search_type=' + search_type + '&typed_term=' + typed_term +
        '&s=' + srch_inpt + '#s=' + srch_inpt;
    $('.js-srch-wdgt__frm').attr('action', srch_url);
});


Modules.$doc.on("focus", ".srch-wdgt__fld", function() {
    $(this).autocomplete("search");
});
// autocomplete processing end here

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
$(".list-best__vdo").on("click", function(e) {
    //Params to work with NC
    var videoUrl = $(this).data("video-id");
    //Params for Comp redesigned popup
    var offset_media_key = $(this).data("media_key");
    var offset_media_position = $(this).data("media_position");
    var mspid = $(this).closest(".list-best__item").data("mspid");
    var query = [
        'mspid=' + mspid,
        'offset_media_key=' + offset_media_key,
        'offset_position=' + offset_media_position,
        /*Params to work with old popup in NC*/
        'primaryThumb=' + $(".list-best__img").data("image"),
        'maxThumbs=' + 0,
        'thumbId=' + $(".list-best__img").data("thumb-id"),
        'videoUrl=' + videoUrl
    ].join("&");
    var images_popup = $(".list-best__vdo").data("href");
    openPopup("http://www.mysmartprice.com/mobile/" + images_popup + "?" + query);
});

/* Open video in popup on clicking thumbnail */
function loadVideoReviews() {
    var videosIdList      = [],
        videosInfoObj     = {},
        $allVideoElements = $('.js-yt-vdo'),
        $featuredVideo    = $('.js-yt-vdo__ftrd'),
        $otherVideosList  = $('.js-vdo-list');

    if($allVideoElements.length) {
        $allVideoElements.each(pushToVideosIdList);
        ajaxVideosAndUpdateUI();
    }

    /*****************/
    function pushToVideosIdList(idx, vdo)  {
        var id = $(vdo).data('yt-vdo-id');
        videosIdList.push(id);
    }
    function ajaxVideosAndUpdateUI() {
        $.ajax({
            url: 'https://www.googleapis.com/youtube/v3/videos',
            data: {
                part: 'snippet, contentDetails',
                id: videosIdList.join(),
                key: 'AIzaSyCJrzy0GTt2WfQF8jMVCfXHIhHIOLz2luQ'
            }
        }).done(function(response) {
            prepareVideosInfoObj(response);
            MakefeaturedVideo($featuredVideo);
            ListOtherVideos($otherVideosList);
        });
    }
    function prepareVideosInfoObj(response) {
        if(response && response.items) {
            response.items.forEach(function(item, idx) {
                var snippet        = item.snippet,
                    contentDetails = item.contentDetails;

                videosInfoObj[ videosIdList[idx] ] = {
                    id          : videosIdList[idx],
                    publishedAt : snippet.publishedAt,
                    thumbnails  : snippet.thumbnails,
                    title       : snippet.title,
                    duration    : contentDetails.duration
                };
            });
        }
    }
    function MakefeaturedVideo($featuredVideo) {
        if($featuredVideo.length) {
            var firstVideo  = videosInfoObj[ videosIdList[0] ],
                id          = $featuredVideo.data('yt-vdo-id'),
                $thumb      = $featuredVideo.find('.js-thumb'),
                $duration   = $featuredVideo.find('.js-duration'),
                $playButton = $featuredVideo.find('.js-play'),
                $title      = $featuredVideo.find('.js-title');

            if($thumb.length) {
                $thumb.attr('src', firstVideo.thumbnails.medium.url);
            }
            if($duration.length) {
                $duration.text(decodeDuration(firstVideo.duration));
            }
            if($title) {
                $title.text(firstVideo.title);
            }

            $thumb.on('click', loadIframe);
            $playButton.on('click', loadIframe);
        }

        /**************/
        function loadIframe(e) {
            var frameHTML = [
                '<iframe id="vdo-rvw__ftrd__plyr" type="text/html" width="426" height="240" ',
                'src="https://www.youtube.com/embed/' + firstVideo.id + '?autoplay=1" frameborder="0" allowfullscreen></iframe>'
            ].join('');
            $featuredVideo.html(frameHTML);
            return false;
        }
    }
    function ListOtherVideos($otherVideosList) {
        if($otherVideosList.length) {
            $otherVideosList.find('.js-yt-vdo').each(function(idx, vdo) {
                var videoId      = $(vdo).data('yt-vdo-id'),
                    $thumb       = $(vdo).find('.js-thumb'),
                    $duration    = $(vdo).find('.js-duration'),
                    $title       = $(vdo).find('.js-title'),
                    $date        = $(vdo).find('.js-date'),
                    videoDetails = videosInfoObj[videoId];

                if(videoDetails) {
                    $(vdo).data('videolink', 'https://www.youtube.com/embed/' + videoId + '?autoplay=1');
                    $thumb.attr('src', videoDetails.thumbnails.medium.url);
                    $duration.text(decodeDuration(videoDetails.duration));
                    $title.text(videoDetails.title);
                    $date.text(formatDate(videoDetails.publishedAt));
                }
                $(vdo).on('click', openVideo);
            });
        }

        /*****************/
        function openVideo(e) {
            var popupParams = {
                    mspid            : $('.prdct-dtl__ttl').data('mspid'),
                    offset_media_key : 'customerReviewVideos',
                    offset_position  : $('.js-yt-vdo').index(this),
                    offset_video     : $('.js-yt-vdo').index(this)
                };
            openPopup('/mobile/multiple_media_popup.php?' + $.param(popupParams));
            return false;
        }
    }
    function decodeDuration(duration) {
        // Duration format: "PTxxHxxMxxS".
        // xxH (or xH) and xxM (or xM) are included only hours and minutes exist.
        // xxS could also be just xS.
        if(duration) {
            var hours   = duration.match(/(\d+)H/) || '',
                minutes = duration.match(/(\d+)M/) || '',
                seconds = duration.match(/(\d+)S/) || '';

            if(hours) {
                hours = (hours[1].length === 1) ? ('0' + hours[1] + ':') : (hours[1] + ':');
            }
            if(minutes) {
                minutes = (minutes[1].length === 1) ? ('0' + minutes[1] + ':') : (minutes[1] + ':');
            }
            if(seconds) {
                seconds = (seconds[1].length === 1) ? ('0' + seconds[1]) : seconds[1];
            }

            return hours + minutes + seconds;
        } else {
            return '';
        }
    }
    function formatDate(dateString) {
        if(dateString) {
            try {
                var publishDate = new Date(dateString),
                    months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                return months[publishDate.getMonth()] + ' ' + publishDate.getDate() + ', ' + publishDate.getFullYear();
            } catch(e) {
                console.error('Error', e); // Log error but do not throw it (return empty string, fail silently)
                return '';
            }
        }
    }
}
/* End video review popup */

/* Lazy load video reviews section: */
(function lazyLoadVideoReviews() {
    var $videoReview = $('.vdo-rvw-sctn');
    if($videoReview.length) {
        Modules.lazyLoad.assign({
            "node": $videoReview,
            "callback": {
                "definition": loadVideoReviews,
                "context": this,
                "arguments": []
            }
        });
        Modules.lazyLoad.run();
    }
})();
/* End lazyload of video review section */
bindAutoComplete(); // Initializing the autoComplete
initScrollToTop(); // Scroll to page top

Modules.$doc.on("click", ".js-copy", handleCopyText);
Modules.$doc.on("click", ".js-send-email", handleSendEmail);

/* ************** 4. Functions: ************** */

function handleCopyText() {
    $this = $(this);
    copyText($this, function(){
        $this.text("COPIED").removeClass("bttn--blue").addClass("bttn--grn");
    }, function(){
        //Do something when copying is not supported by browser
    })
}

function handleSendEmail(){
    var address = $(this).data("address"),
        subject = $(this).data("subject"),
        body = $(this).data("body"),
        strMail = 'mailto:' + encodeURIComponent(address) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    window.open(strMail, "_blank");
}

function bindAutoComplete() {
    var $searchBox = $(".srch-wdgt"),
        $searchField = $searchBox.find(".js-atcmplt");
    if ($searchField.length) {
        var autocompleteObj = $searchField.autocomplete({
            minLength: 0,
            delay: 110,
            autoFocus: false,
            max: 10,
            open: function(event, ui) {
                $(".ui-menu").css({
                    "width": $searchBox.width(),
                    "left": "-1px",
                    "top": "1px",
                    "clear": "both"
                });
                $searchBox.addClass("srch-wdgt--show-rslt");
            },
            close: function(event, ui) {
                $searchBox.removeClass("srch-wdgt--show-rslt");
            },
            source: function(request, response) {
                request.term = $.trim(request.term).toLowerCase();
                if (request.term.length < 3)
                    request.term = "_top_";
                var _cache = bindAutoComplete._cache_ = bindAutoComplete._cache_ || { "keys": [], "values": [] },
                    keyIndex = _cache.keys.indexOf(request.term);
                if (keyIndex > -1) {
                    response(_cache.values[keyIndex]);
                    return;
                }
                $.ajax({
                    "url": "/msp/search/auto_suggest_search.php",
                    "dataType": "json",
                    "data": request
                }).done(function(json) {
                    if (!json) {
                        response([]);
                        return;
                    }
                    var results = [];
                    if (json.subcategories && json.subcategories.length)
                        $.merge(results, json.subcategories);
                    if (json.terms && json.terms.length)
                        $.merge(results, json.terms);
                    if (json.products && json.products.length)
                        $.merge(results, json.products);
                    if (!results.length) {
                        response([]);
                        return;
                    }
                    _cache.keys.push(request.term);
                    _cache.values.push(results);
                    if (_cache.keys.length > 25) {
                        _cache.keys.shift();
                        _cache.values.shift();
                    }
                    response(results);
                }).fail(function() {
                    response([]);
                });
            },
            select: function(event, ui) {
                if (ui.item.url) {
                    var pageUrl = window.location.href.split("#"),
                        searchUrl = ui.item.url.split("#");
                    if (pageUrl[0] === searchUrl[0]) {
                        if (pageUrl[1] !== searchUrl[1]) {
                            // Same path, different hashes; update URL and force-refresh
                            window.location.href = ui.item.url;
                            window.location.reload();
                        } else
                            window.location.reload(); // Identical URLs, just reload
                    } else
                        window.location.href = ui.item.url; // Different paths, just update URL
                } else {
                    $(this).parent().find('.search_type').val('auto');
                    var typed_term = $(this).val();
                    $(this).parent().find('.typed_term').val(typed_term);
                    $(this).val(ui.item.value).closest("form").submit();
                }
            }
        }).data("ui-autocomplete");

        autocompleteObj._renderItem = function(ul, item) {
            var term = this.term.split(" ").join("|"),
                regEx = new RegExp("\\b(" + term + ")", "gi"),
                innerHtml = item.value.replace(regEx, "<strong>$1</strong>"),
                $listItem = $("<li>").data("item.autocomplete", item);
            if (item.subcategory) {
                innerHtml += " in <span style='font-weight: bold; color: #c00;'>" + item.subcategory + "</span>";
                $listItem.addClass("subcategory-item");
            } else if (item.image) {
                innerHtml = "<span class='image'><img src='" + item.image + "' alt='" + item.value + "'/></span>" + innerHtml;
                $listItem.addClass("product-item");
            } else
                $listItem.addClass("string-item");
            innerHtml = "<a>" + innerHtml + "</a>";
            return $listItem.append(innerHtml).appendTo(ul);
        };

        autocompleteObj._renderMenu = function(ul, items) {
            var that = this;
            $.each(items, function(index, item) {
                that._renderItemData(ul, item);
            });

            var $ul = $(ul);
            $ul.find(".string-item").first().not(":first-child").before("<li class='separator-item'><span>Popular terms</span></li>");
            $ul.find(".product-item").first().before("<li class='separator-item'><span>Popular products</span></li>");
        };
    }
}

/* RUI:: scroll to top button functionality - start */
function initScrollToTop() {
    var $body = $('body'),
        toTopHtml = [
            "<div class='to-top'>",
            "<div class='to-top__btn js-lazy-bg'></div>",
            "<div class='to-top__lbl'>Back to top</div>",
            "</div>"
        ].join(""),
        $toTop = $(toTopHtml),
        showScrollToTopDisplay = 'hidden';

    $body.append($toTop);

    $toTop.on("click", function() {
        $body.animate({
            'scrollTop': '0'
        }, 'slow', function() {
            showScrollToTopDisplay = 'hidden';
        });
        $toTop.stop(true, true).fadeOut();
    });

    Modules.$win.on("scroll", function() {
        if ($(this).scrollTop() > 100) {
            if (showScrollToTopDisplay == 'hidden') {
                showScrollToTopDisplay = 'display';
                $toTop.stop(true, true).fadeIn();
            }
        } else {
            if (showScrollToTopDisplay == 'display') {
                showScrollToTopDisplay = 'hidden';
                $toTop.stop(true, true).fadeOut();
            }
        }
    });
}

function copyText($selector, successCallback, failCallback) {
    var text = $selector.data("text");
    $('body').append("<input class='js-temp-txt' value=" + text + " />");
    $(".js-temp-txt").select();
    try {
        document.execCommand('copy');
        successCallback();
    } catch (e) {
        failCallback(e);
    }
}



function handleSendEmail() {
    var address = $(this).data("address"),
        subject = $(this).data("subject"),
        body = $(this).data("body"),
        cc = $(this).data("cc"),
        strMail = 'https://mail.google.com/mail/?view=cm&fs=1&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '&cc=' + encodeURIComponent(cc);
    window.open(strMail, "_blank");
}
if ($(".body-wrpr").length !== 0) { /* Enable new (RUI) scroll functionality */
    scrollToSectionNoAnimation();
} else { /* OLD::inpageLinking (Backward Compatibility) */
    Modules.$win.on('hashchange', handleHashChange);
    Modules.$doc.on('click', 'a[href^="#"]', handleAnchorLinkClick);
    Modules.$win.on('load', handleLoadEvent);
}

/* ************** 4. Functions: ************** */

function scrollToSectionNoAnimation() {
    // onload if hash has a scrollTo param then scroll to section without animation.
    var hashObj = url.hashParams;
    if (hashObj) {
        setTimeout(function() {
            if (hashObj.scrollTo) { scrollToLink(hashObj, true); }
            if (hashObj.clickElt) { clickElement(hashObj); }
        }, 300);
    }

    // on hashchange: act upon the scrollTo and clickElt hash params
    Modules.$win.on('hashchange', function() {
        hashObj = url.hashParams;
        if (hashObj.scrollTo) { scrollToLink(hashObj, false); }
    });

    // scroll hash handler
    var scrollToLink = function(hashObj, onLoad) {
        var offset = $('[data-id="' + hashObj.scrollTo + '"]').offset(),
            finalScrollPos = 0;
        if(offset) {
            finalScrollPos = Math.ceil(offset.top - $(".sctn--page-nvgtn").height() - 10);
        }

        if (onLoad) {
            $("body").scrollTop(finalScrollPos);
            return;
        }

        if (hashObj && hashObj.scrollTo && $('[data-id="' + hashObj.scrollTo + '"]').length) {
            var $roots = $("html, body");

            $roots.on("scroll.inpageLink mousedown.inpageLink wheel.inpageLink DOMMouseScroll.inpageLink mousewheel.inpageLink keyup.inpageLink touchmove.inpageLink", function() {
                $roots.stop();
            });

            $roots.animate({ "scrollTop": finalScrollPos }, "slow", function() {
                $roots.off("scroll.inpageLink mousedown.inpageLink wheel.inpageLink DOMMouseScroll.inpageLink mousewheel.inpageLink keyup.inpageLink touchmove.inpageLink");
            });
        }
    };

    // click hash handler
    var clickElement = function(hashObj) {
        if (hashObj && hashObj.clickElt) {
            $(hashObj.clickElt).trigger('click');
        }
    };

    var $pageNav = $(".sctn--page-nvgtn");
    if ($pageNav.length) {
        var stickyPoint = Math.ceil($pageNav.offset().top);
        Modules.$win.scroll(Modules.throttle(function() {
            if (Math.ceil(Modules.$win.scrollTop()) > stickyPoint) {
                $pageNav.addClass("sctn--stcky-nvgtn");
            } else {
                $pageNav.removeClass("sctn--stcky-nvgtn");
            }
        }, 100));
    }

    Modules.$doc.on("click", ".js-inpg-link", function(e) {
        var $this = $(this);
        if ($this.data("action") === "disabled") return false;

        if (!hashObj) hashObj = {};
        hashObj.scrollTo = $this.data("href");

        if (generateHash(hashObj) != window.location.hash) {
            window.location.hash = generateHash(hashObj);
        }
        scrollToLink(hashObj);
        e.preventDefault();
    });

    // scroll event handler
    Modules.$doc.on("click", ".js-inpg-link[data-href=user-reviews]", function() {
        // a/b testing for video reviews
        // sending 1/5 of users to video reviews
        // and remaining 4/5 of users to user reviews
        var $this = $(this),
            msp_uid = Modules.Cookie.get("msp_uid");
        if (msp_uid % 5 === 0) {
            $this.data("href", "video-reviews");
            window.ga && ga("send", "event", "PDPReviewLink", "click", "video-reviews");
        } else {
            window.ga && ga("send", "event", "PDPReviewLink", "click", "text-reviews");
        }
    });
}

/* Old (compatibility reasons) functions start here: */
function inpageLinking(id) {
    if (id !== "" && id !== "#") {
        try {
            if ($(id).length) {
                $('html, body').animate({
                    "scrollTop": ($(id).offset().top - 90) + "px"
                });
            }
        } catch (err) {
            // Do nothing so far... wanna change that?
        }
    }
}

function handleHashChange() {
    inpageLinking(window.location.hash);
    return false;
}

function handleAnchorLinkClick(event) {
    event.preventDefault();
    inpageLinking($(this).attr('href'));
}

function handleLoadEvent() {
    inpageLinking(window.location.hash);
}
/* Old function end here */
/* ************** 1. Classes/Objects/Variables: ************** */

var Popout = {
    closePopout: function() {
        $(".js-wdgt-flt").addClass("Popout-hide-animate");
        setTimeout(function() {
            $(".js-wdgt-flt").remove();
        }, 100);
    },

    storePopout: function(obj) {
        //console.log(obj);
        if (!$.isEmptyObject(obj)) {
            localStorage.setItem("Popout", JSON.stringify(obj));
        } else {
            return;
        }
    },
    animateProgressBar: function(perc, timeTotal) {
        var timer;
        (function animateUpdate() {
            if (perc < timeTotal) {
                perc++;
                updateProgress(perc, timeTotal);
                timer = setTimeout(animateUpdate);
                // $('.wdgt-tmr__inr-bg').addClass('wdgt-tmr__inr-bg-animate-long');
            } else {
                Popout.closePopout();
            }
        })();

        function updateProgress(percentage, timeTotal) {
            var x = (percentage / timeTotal) * 100;
            $('.wdgt-tmr__inr-bg').css("width", x + "%");
        }
    },
    showPopout: function() {
        var obj = getStorageData("local", "Popout");
        if (obj) {
            obj = JSON.parse(obj);
            var duration = obj.PopoutHide;
            var position = obj.position;

            if (position == "bottom") {
                position = "wdgt-flt-btm";
            }
            var html = ['<div class="wdgt-flt js-wdgt-flt Popout-show-animate ' + position + '">',
                '<div class="wdgt-flt--cntnr"><div class="wdgt-flt--cntnr__cls js-Popout-close"> &times; </div>',
                '<div class="wdgt-flt__ttl">' + obj.title + '</div>',
                '<div class="wdgt-flt__ttl--sub">' + obj.subTitle + '</div>',
                '<div class="wdgt-flt__bttns">'
            ];

            if (obj.buttonCount == 2) {
                html.push('<a href="#" class="bttn bttn--blue wdgt-flt__bttn js-Popout-close bttn--two">Close</a>');
                html.push('<a href="' + obj.buttonUrl + '"  class="bttn bttn--grn wdgt-flt__bttn js-wdgt-flt__bttn bttn--two" target="_blank">' + obj.buttonLabel + '</a>');
            } else {
                html.push('<a href="' + obj.buttonUrl + '" target="_blank" class="bttn bttn--grn wdgt-flt__bttn js-wdgt-flt__bttn">' + obj.buttonLabel + '</a>');
            }

            html.push('</div>',
                '</div>',
                '<div class="wdgt-tmr">',
                '<div class="wdgt-tmr__inr-bg"></div>',
                '</div>',
                '</div>'
            );

            $("body").append(html.join(""));
            var perc = 0;
            if (duration == "short") {
                var timeTotal = 1000; // 5 * timeTotal =>  5 Second  
                setTimeout(function() {
                    Popout.animateProgressBar(perc, timeTotal);
                }, 500)

            } else if (duration == "long") {
                var timeTotal = 2000; // 5 * timeTotal => 10 Second
                setTimeout(function() {
                    Popout.animateProgressBar(perc, timeTotal);
                }, 500)
            } else {
                $(".wdgt-tmr").remove();

            }
        } else {

            return;
        }
        localStorage.removeItem('Popout');
    },
    showPopout2: function() {
        var obj = getStorageData("local", "Popout");
        if (obj) {
            obj = JSON.parse(obj);
            var duration = obj.PopoutHide;
            var position = obj.position;

            if (position == "bottom") {
                position = "wdgt-flt-btm";
            } else {
                position = "wdgt-flt";
            }
            console.log(obj.utm_source);
            var html = ['<div id="msp-container" class="plgn-popup Popout-show-animate js-wdgt-flt ' + position + '"> ',
                '<div class="plgn-popup__innr-wrppr clearfix">',
                '<div class="plgn-popup__cls"><span class="js-Popout-close">×</span></div>',
                '<a href="' + obj.buttonUrl + '" data-utmsource="' + obj.utm_source + '"class="clearfix plgn-popup-link js-wdgt-flt__bttn" title="Click to earn more on every purchase" style="text-decoration:none">',
                '<div class="plgn-popup__bst-prc">',
                '<div class="plgn-popup__prc-ttl">' + obj.title + '</div>',
                '<div class="plgn-popup__prc-desc">' + obj.subTitle + '</div>',
                '<div class="plgn-popup__prc-val"></div>',
                '</div>',
                '<div class="plgn-popup__send-to-store">',
                '<span>' + obj.buttonText + '</span>',
                '<span class="msp_send_to_store_right_arrow">›</span>',
                '</div>',
                '<div class="privacy-policy" style="position: absolute;right: 20px;bottom: 20px;">',
                '<a href="/privacy.html" target="_blank" style="color: #fff;">Privacy Policy</a>',
                '</div>',
                '</a> '
            ];

            // html.push('<div class="info-text"> Earn up to <span class="points">570</span> Smart Points on Purchase </div> ');
            html.push('</div> </div> ');
            $("body").append(html.join(""));

            $(document).on('click', '.js-wdgt-flt__bttn', function() {
                Cookie.setCookie('pluginInstallSource', "Installed by popout", 20);
            });
            var perc = 0;
            if (duration == "short") {
                var timeTotal = 1000; // 5 * timeTotal =>  5 Second  
                setTimeout(function() {
                    Popout.animateProgressBar(perc, timeTotal);
                }, 500)

            } else if (duration == "long") {
                var timeTotal = 2000; // 5 * timeTotal => 10 Second
                setTimeout(function() {
                    Popout.animateProgressBar(perc, timeTotal);
                }, 500)
            } else {
                $(".wdgt-tmr").remove();

            }
        } else {

            return;
        }
        localStorage.removeItem('Popout');
    },
    showQnAPopOut: function() {
        var popup = {
                position: 'top',
                title: 'Have a Question about this Product?',
                subTitle: 'Get answers from verified buyers',
                url: 'qna',
                label: 'ASK QUESTION'
            },
            position;

        if ($(".qna").data("ttl-qstn") >= 3) {
            popup.label = $(".qna").data("ttl-qstn") + " Answered Questions"
        }

        if (popup.position == "bottom") {
            position = "wdgt-flt-btm";
        } else {
            position = "wdgt-flt";
        }

        var html = ['<div id="msp-container" class="plgn-popup Popout-show-animate js-wdgt-flt ' + position + '"> <div style="cursor:pointer" data-href="' + popup.url + '" class="plgn-popup__innr-wrppr js-inpg-link js-qpop-clck clearfix"> <div class="plgn-popup__cls js-qpop-cls"> <span class="js-Popout-close">×</span> </div> <a class="clearfix plgn-popup-link" style="text-decoration:none"> <div class="plgn-popup__bst-prc"> <div class="plgn-popup__prc-ttl">' + popup.title + '</div> <div class="plgn-popup__prc-desc">' + popup.subTitle + '</div> <div class="plgn-popup__prc-val"></div> </div> <div class="plgn-popup__send-to-store"> <span>' + popup.label + '</span> <span class="msp_send_to_store_right_arrow">›</span> </div> </a> '];

        $("body").append(html.join(""));

        ga('send', 'event', 'QNA', 'pop-show', '', { nonInteraction: true })
    }
}

/* ************** 2. Actions/Events: ************** */

Modules.$doc.on("click", ".js-qpop-cls", qPopCloseHandler);
Modules.$doc.on("click", ".js-qpop-clck", qPopClickHandler);
Modules.$doc.on("click", ".js-wdgt-flt__bttn", widgetFilterButtonHandler);
Modules.$doc.on("click", ".js-Popout-close", popoutCloseHandler);

/* ************** 4. Functions: ************** */

function qPopCloseHandler(e) {
    var popData = localStorage.QNAPop ? JSON.parse(localStorage.QNAPop) : {},
        mspid = dataLayer[0].mspid;

    popData[mspid] = {
        'lastClosed': new Date()
    }

    localStorage.QNAPop = JSON.stringify(popData);
    e.stopPropagation();
}

function qPopClickHandler() {
    ga('send', 'event', 'QNA', 'pop-click', '', { nonInteraction: true })
    Popout.closePopout();
}

function widgetFilterButtonHandler(e) {
    var obj = getStorageData("local", "Popout");
    var signupUTM = $(this).data("utmsource");
    //console.log(signupUTM);
    Cookie.setCookieMins("signup-utm", signupUTM, 2);
    if (window.ga) {
        ga("send", "event", "Loyalty", signupUTM + "clicked", Modules.Cookie.get("msp_uid") + "");
    }
    Popout.closePopout();
}

function popoutCloseHandler(e) {
    if (window.ga) {
        ga("send", "event", "Loyalty", "Popout closed clicked", Modules.Cookie.get("msp_uid") + "");
    }
    Popout.closePopout();
    e.preventDefault();
}
var _gPopStoreUrl = null;

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
        Modules.Cookie.setCookieMins("signup-utm", $(this).data("utmsource") || "", 2);
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
                Modules.Cookie.set(cookieName, "true", cookieTimeMins);
            } else if (!isNaN(cookieTimeDays)) {
                Modules.Cookie.set(cookieName, "true", cookieTimeDays + "d");
            }
        }

        Modules.Cookie.set('autoPopup', '1', "1d");
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

    Modules.Cookie.set('autoPopup', '1', '1d');

    if (Modules.Cookie.get(cookieName) === "true") {
        window.open($this.data("url"));
        return false;
    }

    if (cookieName) {
        var cookieTimeMins = parseInt($this.data("cookietimemins"), 10),
            cookieTimeDays = parseInt($this.data("cookietimedays"), 10);

        if (!isNaN(cookieTimeMins)) {
            Modules.Cookie.set(cookieName, "true", cookieTimeMins);
        } else if (!isNaN(cookieTimeDays)) {
            Modules.Cookie.set(cookieName, "true", cookieTimeDays + 'd');
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

    Modules.Cookie.set('autoPopup', '1', 30);

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
            Modules.Cookie.set(cookieName, "true", cookieTimeMins);
        } else if (!isNaN(cookieTimeDays)) {
            Modules.Cookie.set(cookieName, "true", cookieTimeDays + 'd');
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
        Modules.Cookie.set('promo_a_shown', 1, '1d'); // For a day
    } else if (popupType == "PromoB") {
        Modules.Cookie.set('promo_a_shown', 1, '1d'); // For a day
        Modules.Cookie.set('promo_b_shown', 1, '1d'); // For a day
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
        if (url.getAQueryParam && invalidSources.indexOf(url.getAQueryParam('utm_source')) === -1) {
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
            Modules.Cookie.set('autoPopup', '1', '1d');
        }
    }, 5000);
}

/* ************** 2. Actions/Events: ************** */

Modules.$doc.on('mouseenter', '.js-tltp', handleMouseEnter);
Modules.$doc.on('mouseleave', '.js-tltp', removeTooltip);

Modules.$doc.on("click", ".js-msg-box-trgt", showMessageBox);
Modules.$doc.on("click", ".js-msg-box__cls", hideMessageBox);

/* ************** 4. Functions: ************** */

function handleMouseEnter() {
    $('.tltp').remove();
    var $this = $(this),
        data = $this.data('tooltip'),
        tooltipDirection = $this.data('tooltip-direction') || "tltp--top-left";
    if (data === "" || data === undefined) return;
    $('body').append('<div class="tltp ' + tooltipDirection + '">' + data + '</div>');
    $tooltip = $('.tltp');

    if ($(this).data('tooltip').length > 50) {
        $tooltip.css({ 'font-size': '11px', 'line-height': '1.5' });
    }

    if (tooltipDirection === "tltp--top-rght") {
        $tooltip.css('left', $this.offset().left - $tooltip.outerWidth() + $(this).outerWidth() + 4);
        $tooltip.css('top', $this.offset().top - $tooltip.outerHeight() - 10);
        if ($tooltip.offset().top - Modules.$win.scrollTop() < 0) {
            $tooltip.removeClass(tooltipDirection).addClass('tltp--btm-rght');
            $tooltip.css('top', $this.outerHeight() + $this.offset().top + 10);
        }
    } else if (tooltipDirection === "tltp--top-left") {
        $tooltip.css('left', $this.offset().left - 4);
        $tooltip.css('top', $this.offset().top - $tooltip.outerHeight() - 10);
        if ($tooltip.offset().top - Modules.$win.scrollTop() < 0) {
            $tooltip.removeClass(tooltipDirection).addClass('tltp--btm-left');
            $tooltip.css('top', $this.outerHeight() + $this.offset().top + 10);
        }
    } else if (tooltipDirection === "tltp--btm-rght") {
        $tooltip.css('left', $this.offset().left - $tooltip.outerWidth() + $(this).outerWidth() + 4);
        $tooltip.css('top', $this.offset().top + $this.outerHeight() + 10);
        if (Modules.$win.scrollTop() + Modules.$win.height() - $tooltip.offset().top < 0) {
            $tooltip.removeClass(tooltipDirection).addClass('tltp--btm-rght');
            $tooltip.css('top', $this.offset().top - $tooltip.outerHeight() - 10);
        }
    } else if (tooltipDirection === "tltp--btm-left") {
        $tooltip.css('left', $this.offset().left - 4);
        $tooltip.css('top', $this.offset().top + $this.outerHeight() + 10);
        if (Modules.$win.scrollTop() + Modules.$win.height() - $tooltip.offset().top < 0) {
            $tooltip.removeClass(tooltipDirection).addClass('tltp--btm-left');
            $tooltip.css('top', $this.offset().top - $tooltip.outerHeight() - 10);
        }
    } else if (tooltipDirection === "tltp--left") {
        $tooltip.css('left', $this.offset().left - $tooltip.width() - 30);
        $tooltip.css('top', $this.offset().top + $this.outerHeight() / 2 - 10);
    }
}

function removeTooltip() {
    $('.tltp').remove();
}

function showMessageBox(e) {
    if ($(e.target).hasClass("js-msg-box__cls")) return false;

    $(".msg-box").removeClass("msg-box--show");
    $(this).find(".msg-box").addClass("msg-box--show");
}

function hideMessageBox() {
    $(this).closest(".msg-box").removeClass("msg-box--show");
    return false;
}
//# sourceMappingURL=all-non-module-components.js.map
;

});
