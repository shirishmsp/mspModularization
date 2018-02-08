/* *************************** */

var subcategory = $('#msp_body').attr('category');

/* *************************** */

// I can't find any usage for this function - Rohit
function trackLink(category, action, label, value, link) {
    if (typeof(_gaq) === "undefined") return;

    try {
        _gaq.push(["_trackEvent", category, action, label, value]);
    } catch (err) {}
    setTimeout(function() {
        location.href = link;
    }, 400);
    return false;
}
/*
  // How to use:
  <a onclick="return trackLink('something','somewhere','somehow', null, this.href);" href="/link/to/page">Link</a>
*/

/* *************************** */

/* The following class appears on welcome page:
but it is hardly useful - no effect / no animation / not required */
// Function for Popup Animation on Extension Demo Pages
(function() {
    var $slider = $(".js-demo-slider");
    if ($slider.length > 0) {
        var $win = $(window),
            winHeight = $win.height(),
            sliderTopOffset = $slider.offset().top,
            sliderHeight = $slider.outerHeight(),
            demoStarted = false;

        $win.on("scroll", function() {
            var scrollTop = $win.scrollTop();
            if ((scrollTop + winHeight >= sliderTopOffset + sliderHeight) && !demoStarted) {
                $slider.find(".sctn--demo__pop").addClass("animate--pop");
                demoStarted = true;
            }
        });
    }
})();

/* *************************** */

/* OLD:: save item functionality - start */
function saveProduct(mspid, $this) {
    $.ajax({
        url: "/users/add_to_list.php?mspid=" + mspid,
        cache: false
    });

    $this.addClass("prdct-item__save-btn--svd");
}
/* OLD:: save item functionality - end */

/* *************************** */

/* Seems to be old code - not found on list page */
/* [START] Show hide content on singles[OLD UI] and list page[RUI] */
function showHideContent() {

    var hiddenText = $(".js-hidden_text, .hidden_text");

    if (hiddenText.length) {
        $("body").on("click", ".js-morebutton, .js-lessbutton, .morebutton, .lessbutton", function() {
            $(this).closest(".show-more-text, .product_topsec_det").find(hiddenText).slideToggle(200, function() {
                if ($(this).css('display') == 'inline-block') {
                    $(this).css('display', 'inline');
                } // enter desired display type;
            });
            $(this).closest(".show-more-text, .product_topsec_det").find(".js-morebutton, .morebutton").toggle();
        });
    }
}
showHideContent();
/* [END] Show hide content on singles[OLD UI] and list page[RUI] */

/* *************************** */

/* Seems to be old code: */
// Sidebar recommendations "view_all" button scrolls upto tabs
(function initSidebarRecommendations() {
    var loc = window.location.href;
    if ($(".product_bottom_sec").length) {
        if (loc.indexOf("view_all") !== -1 && loc.indexOf("alternatives") !== -1) {
            $("html, body").animate({
                scrollTop: ($(".product_bottom_sec").position().top - 50) + "px"
            });
        }
    }
}());

/* *************************** */