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
        ga("send", "event", "Loyalty", signupUTM + "clicked", Cookie.getCookie("msp_uid") + "");
    }
    Popout.closePopout();
}

function popoutCloseHandler(e) {
    if (window.ga) {
        ga("send", "event", "Loyalty", "Popout closed clicked", Cookie.getCookie("msp_uid") + "");
    }
    Popout.closePopout();
    e.preventDefault();
}