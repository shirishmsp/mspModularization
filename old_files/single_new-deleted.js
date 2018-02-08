/* ******************* */

// Price table Brand Auth Seller
;
(function() {
    // Event handlers for location change in Brand Auth seller (price table)
    $(document).on('click', '.brnd-auth-sllr .lctn-text', function() {
        var $this = $(this),
            $lctnInpt = $this.closest('.brnd-auth-sllr').find('.lctn-inpt');
        $this.css('display', 'none');
        $lctnInpt.css('display', 'block');
        $lctnInpt.find('.prc-grid__lctn-chng-inpt').focus();
    });

    $(document).on('blur', '.brnd-auth-sllr .lctn-inpt', function() {
        var $this = $(this),
            $lctnText = $this.closest('.brnd-auth-sllr').find('.lctn-text');
        $this.css('display', 'none');
        $lctnText.css('display', 'block');
    });
})();

/* ******************* */

// Calculate air distance between two points using the Haversine formula
// (See http://www.movable-type.co.uk/scripts/latlong.html)
Number.prototype.toRad = function () {
    return this * Math.PI / 180;
};
function calcDistance(oriLat, oriLng, destLat, destLng) {
    var radius = 6371, // Radius of the Earth in km
        diffLatSin = Math.sin((destLat - oriLat).toRad() / 2),
        diffLngSin = Math.sin((destLng - oriLng).toRad() / 2),
        a = (diffLatSin * diffLatSin) + (Math.cos(oriLat.toRad()) * Math.cos(destLat.toRad()) * diffLngSin * diffLngSin);
    return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function setServingLocation() {
    if (!getCookie("offline_serving_location")) {
        var userLocation = getUserLocation(),
            userLat = parseFloat(userLocation.lat),
            userLng = parseFloat(userLocation.long);
        if (!isNaN(userLat) && !isNaN(userLng)) {
            var regions = [
                { "city": "mumbai",    "lat": 18.96472, "lng": 72.82584 },
                { "city": "new delhi", "lat": 28.61069, "lng": 77.20275 },
                { "city": "hyderabad", "lat": 17.366,   "lng": 78.476 },
                { "city": "bengaluru", "lat": 12.96574, "lng": 77.58472 },
                { "city": "chennai",   "lat": 13.07983, "lng": 80.27008 }
            ];
            $.each(regions, function (index, region) {
                region.distance = calcDistance(userLat, userLng, region.lat, region.lng);
            });
            regions.sort(function (a, b) {
                return a.distance - b.distance;
            });
            if (regions[0].distance <= 80) {
                var servingLocation = JSON.stringify(regions[0]);
                setCookie("offline_serving_location", servingLocation, 0.25);
            }
        }
    }
}
setServingLocation();

/* ******************* */

    /* Offline CPL functions start here */
    (function () {
        $doc.on("submit", ".js-offln-prc-qte", function () {
            var $submit = $(this).find(".prdct-dtl__box-cpl-sbmt");
            if ($submit.hasClass("btn--dsbld")) {
                return false;
            }

            var $mobile = $(".prdct-dtl__box-cpl-mbl"),
                mobileValue = $mobile.val(),
                mobileRegex = /^[6-9]{1}\d{9}$/;
            if (!mobileRegex.test(mobileValue)) {
                alert("We need your mobile number to send you details of authorised shops in your area.");
                $mobile.css("border-color", "#16a085").focus();
                return false;
            }
            $mobile.css("border-color", "");

            var userLocation = getUserLocation();
            if (!userLocation.city || !userLocation.lat || !userLocation.long) {
                alert("Please select your area.");
                $(".prdct-dtl__lctn-swtchr").click();
                return false;
            }

            var $colours = $(".avlbl-clrs__inpt");
            $submit.val("Please check your SMS").addClass("btn--dsbld");
            $.ajax({
                "url"  : "/offline/send_cpl_quotes.php",
                "data" : {
                    "username"    : "",
                    "usernumber"  : mobileValue,
                    "area"        : userLocation.area || "",
                    "city"        : userLocation.city,
                    "lat"         : userLocation.lat,
                    "long"        : userLocation.long,
                    "emi"         : false,
                    "source"      : $submit.hasClass("desktop-bottom") ? "desktop-bottom" : "desktop-top",
                    "colour"      : $colours.length ? ($colours.filter(":checked").val() || $colours.first().val()) : "",
                    "mspid"       : PriceTable.dataPoints.mspid,
                    "subcategory" : window.dataLayer ? window.dataLayer[0].subcategory : ""
                }
            });
            return false;
        });
    })();
    /* Offline CPL functions end here */

/* ******************* */

    $doc.on("click", ".store_win_gfts", function() {
        window.open("http://www.mysmartprice.com/offline/experiments.php", "_blank");
    });

/* ******************* */

function showCplWidget() {
    var $cplWidget = $(".prdct-dtl__box-item--ofln");
    if ($cplWidget.length) {
        var userLocation = getUserLocation();
        $(".prdct-dtl__lctn-val").text(userLocation.area || userLocation.city || "");
        if (window.ga && PriceTable.dataPoints.onload) {
            ga("send", "event", "Offline", "CPL Loaded", PriceTable.dataPoints.mspid + "", { nonInteraction: true });
        }
    }
}

/* ******************* */

    (function insertCpaStoresFromJson() {
        if (window.cpa_json) {
            var servingLocation = getCookie("offline_serving_location");
            if (servingLocation) {
                var servingCity = JSON.parse(servingLocation).city;
                if (servingCity) {
                    var stores = $.grep(cpa_json, function (store) {
                        if (store.city === servingCity) {
                            return true;
                        }
                        return false;
                    });
                    if (stores.length) {
                        $(".prc-grid").each(function () {
                            var $this = $(this);
                            stores.push({
                                "relrank": $this.data("relrank"),
                                "row_html": $this[0].outerHTML
                            });
                        });
                        stores.sort(function (a, b) {
                            return a.relrank - b.relrank;
                        });
                        var storesHtml = $.map(stores, function (store) {
                            return store.row_html;
                        }).join("\n");
                        $(".prc-grid-wrpr").html(storesHtml);
                        if (window.ga) {
                            ga("send", "event", "Offline", "CPA Loaded", PriceTable.dataPoints.mspid + "", { nonInteraction: true });
                        }
                    }
                }
            }
        }
    }());

/* ******************* */

// coupon code generation handler
$doc.on('click', '.js-redeem-coupon', function() {
    var $this = $(this),
        $form = $this.closest('.eml-form'),
        $email = $form.find('.prc-tbl__cpn-info--email'),
        $errorNode = $form.find('.js-ntfy-err'),
        _store = $this.closest('.prc-tbl-row').data('storename'),
        _html;

    MSP.utils.validate.form([{
        "type": "email",
        "inputField": $email,
        "errorNode": $errorNode
    }]).done(function() {
        $.ajax({
            "url": "/stores/coupons/send_coupon_code.php",
            "data": {
                "mspid": PriceTable.dataPoints.mspid,
                "store": _store,
                "email": $email.val(),
                "lineid": $form.data('lineid'),
                "couponid": $form.data('couponid')
            }
        }).done(function(responseData) {
            responseData = responseData.trim();
            _html = ['<div class="prc-tbl__cpn-info js-slct-trgr js-tltp" data-tooltip="click to select coupon code">',
                '<span class="prc-tbl__cpn-code js-slct-trgt">',
                responseData,
                '</span>',
                '<img class="prc-tbl__cpn-icon" src="http://msp-ui-cdn.s3.amazonaws.com/img/icons1/pricetable-coupon-scissors.png">',
                '</div>'
            ].join('');
            $form.replaceWith(_html);
        }); // end ajax
    }); // end done
});

/* ******************* */