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
            if(dataLayer[0]['min-price-store'] !== 'amazon') {
                $(".prdct-dtl__coin-wrpr").after([
                    "<div>",
                    $(".prdct-dtl__coin-wrpr").length ? "Extra <strong>upto 25% cashback</strong>" : "<strong>Upto 25% cashback</strong>",
                    " on adding our Chrome extension",
                    " <span class='help-icon js-tltp' data-tooltip='Maximum cashback of &#8377;100'>i</span>",
                    " <span class='text-link js-add-chrome'><strong>Know more</strong></span>",
                    "</div>"
                ].join(""));
                ga("send", "event", "NC", "nc_single_pv", "js-log-nc", { nonInteraction: true });
            }
        } else {
            if(dataLayer[0]['min-price-store'] === 'amazon') {
                if($('.prdct-dtl__offr-sctn li').length === 0) {
                    $('.prdct-dtl__offr-sctn').remove();
                }
            } else {
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
    }

// Windows App popup event handlers:     
$(document).on('click', '.js-windows-app', function(e) {
    e.preventDefault();
    initWindowsAppDownload($(this).data('url'));
    $('.prdct-dtl__box-GTS:not(.js-inpg-link), .bttn--gts').addClass('js-prc-tbl__gts-btn').removeClass('js-windows-app');
    return false;
});