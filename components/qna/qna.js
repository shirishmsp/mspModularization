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
Modules.$win.scroll(MSP.utils.throttle(function(e) {
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
    MSP.utils.lazyLoad.run();
}, 100));
/* RUI:: reveal new subheader when user scrolls - end */


//When coming for answer ackg email to asker.Clicks on say thanks btn.
if (qS && url.getAQueryParam('ref') === "email") {
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