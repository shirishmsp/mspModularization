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