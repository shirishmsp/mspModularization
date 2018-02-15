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
