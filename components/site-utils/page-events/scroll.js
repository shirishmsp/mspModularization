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
    var hashObj = queryString(decodeURI(window.location.hash));
    if (hashObj) {
        setTimeout(function() {
            if (hashObj.scrollTo) { scrollToLink(hashObj, true); }
            if (hashObj.clickElt) { clickElement(hashObj); }
        }, 300);
    }

    // on hashchange: act upon the scrollTo and clickElt hash params
    Modules.$win.on('hashchange', function() {
        hashObj = queryString(decodeURI(window.location.hash));
        if (hashObj.scrollTo) { scrollToLink(hashObj, false); }
    });

    // scroll hash handler
    var scrollToLink = function(hashObj, onLoad) {
        var finalScrollPos = Math.ceil($('[data-id="' + hashObj.scrollTo + '"]').offset().top - $(".sctn--page-nvgtn").height() - 10);

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
        Modules.$win.scroll(MSP.utils.throttle(function() {
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
            msp_uid = Cookie.getCookie("msp_uid");
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