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
                var loylaty_utm_source = qS.utm_source ? qS.utm_source : utmsource;
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
                        if (getCookie('u99rs1deal')) {
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
                    if (MSP.utils.validate.email($this.val())) {
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
                    if (MSP.utils.validate.required($this.val())) {
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

                scrlAmnt = $win.scrollTop() + $mainheaderHt;




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
            $win.scroll(function() {
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