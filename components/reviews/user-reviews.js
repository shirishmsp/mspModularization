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

        if (window.qS && qS.rating) {
            var inrWidth = parseInt(qS.rating) * 20,
                rating = parseInt(qS.rating) || 1,
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
                    mspLoginEmail = getCookie("msp_login_email");

                if (false && getCookie("msp_login_email") && getCookie("msp_login")) {
                    var submit_api = "/msp/review/save_a_review.php";
                } else {
                    var submit_api = "/msp/review/save_review_basic.php";
                }

                // 1st priority: User Email Query String
                if (window.qS && qS.user) {
                    try {
                        email_id = atob(qS.user); // throws error if unsuccessful
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
                    if (!qsEmailExists) email_id = getCookie('msp_login_email');

                    $.ajax({
                        type: "POST",
                        url: submit_api,
                        data: {
                            "mspid": qS.mspid,
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

    if (getCookie("msp_login") === "1") {
        $(".usr-rvw-form__dtls-img").attr("src", getCookie("msp_user_image"));
        $(".usr-rvw-form__dtls-name").text(getCookie("msp_login_name") || "MySmartPrice User");
        $(".usr-rvw-form__dtls-email").text(getCookie("msp_login_email"));
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
                        "email_id": getCookie("msp_login_email")
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