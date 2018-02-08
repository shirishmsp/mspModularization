var ListPage = {
    "settings": {
        "filterLength": 8
    },
    "controller": {
        "init": function() {
            var lp_changes = ListPage.model.params.changes,
                lp_defaults = ListPage.model.params.defaults,
                lp_current = ListPage.model.params.current,
                lp_page = ListPage.model.params.page,
                lp_clipboard = ListPage.model.clipboard;

            // get page params and default values to get default filters to be applied.
            ListPage.controller.getDefaults();

            ListPage.controller.updatePage();


            $(document).on('click', '.js-load-more', function() {
                lp_clipboard.scroll.isTrigger = true;
                lp_clipboard.scroll.isLoading = true;
                lp_clipboard.scroll.counter++;
                ListPage.controller.updatePage();
            });

            

            // Add listeners to all inputs for applying or removing filters
            ;(function addActionListeners() {
                var filterGroupQueue = [],
                    listenerTypes = [
                        ".fltr:not([data-groupname='price']) .js-fltr-val--mltpl input:not([disabled])",
                        ".fltr:not([data-groupname='price']) .js-fltr-val--sngl input:not([disabled])",
                        ".fltr[data-groupname='price'] .js-fltr-val--sngl input:not([disabled])"
                    ];


                // globalSearch is comes from from hash so no listener.

                // localSearch within the loaded product list
                $('.list-hdr-srch').on('submit', function() {
                    var localSearch = $.trim($(this).find('.list-hdr-srch__fld').val());
                    if (localSearch !== "") {
                        lp_changes.add.ss = localSearch;
                    } else if (lp_clipboard.prevLocalSearch) {
                        lp_changes.remove.ss = lp_clipboard.prevLocalSearch;
                    } else {
                        return false;
                    }

                    lp_changes.inFilterBox = false;
                    ListPage.controller.updatePage();
                    return false;
                });

                $('.list-hdr-srch__btn').on("click", function() {
                    $('.list-hdr-srch').submit();
                });

                // onclick a non-price multi value filter.
                $doc.on("click", ".fltr:not([data-groupname='price']) .js-fltr-val--mltpl input:not([disabled])", function() {
                    var groupName = $(this).closest(".fltr").data("groupname");

                    if (filterGroupQueue.length === 0) {
                        $.merge(filterGroupQueue, $(this));
                    }
                    $(filterGroupQueue).each(function(i, item) {
                        var context = (!lp_current.property || lp_current.property.indexOf($(item).attr("value")) === -1) ? "add" : "remove",
                            changes = lp_changes[context];

                        changes.property = changes.property || [];
                        changes.property.push($(item).attr("value"));
                    });
                    filterGroupQueue = [];

                    lp_changes.inFilterBox = true;
                    ListPage.controller.updatePage();
                    ListPage.controller.redirectPage();
                });

                // onclick a non-price single value filter.
                $doc.on("click", ".fltr:not([data-groupname='price']) .js-fltr-val--sngl input:not([disabled])", function() {
                    var groupName = $(this).closest(".fltr").data("groupname");
                    if (filterGroupQueue.length === 0) {
                        $.merge(filterGroupQueue, $(this).closest(".fltr").find(".fltr-val__inpt:checked"));
                    }
                    $(filterGroupQueue).each(function(i, item) {
                        var context = lp_current[groupName] !== $(item).attr("value") ? "add" : "remove",
                            changes = lp_changes[context];
                        //var groupName = "";
                        changes[groupName] = $(item).attr("value");
                    });
                    filterGroupQueue = [];

                    lp_changes.inFilterBox = true;
                    ListPage.controller.updatePage();
                    ListPage.controller.redirectPage();
                });

                // onclick a price single value filter.
                $doc.on("click", ".fltr[data-groupname='price'] .js-fltr-val--sngl input:not([disabled])", function() {
                    var filterVal = $(this).attr("value"),
                        values = filterVal.split(";"),
                        minPrice = parseInt(values[0], 10),
                        maxPrice = parseInt(values[1], 10),
                        context = (lp_current.price !== $(this).attr("value")) ? "add" : "remove",
                        displayPrices = {};

                    $.extend(lp_changes[context], {
                        "price": minPrice + ";" + maxPrice
                    });

                    lp_changes.inFilterBox = true;
                    ListPage.controller.updatePage();
                    ListPage.controller.redirectPage();
                });

                // clear all apllied filters in a filtergroup
                $doc.on("click", ".fltr__cler", function() {
                    var $currentGroup = $(this).closest(".fltr"),
                        groupname = $currentGroup.data("groupname"),
                        $activeFilters = $currentGroup.find(".fltr-val__inpt:checked");
                    if (groupname === "price") {
                        $.extend(lp_changes.remove, {
                            "price": lp_clipboard.prevMinPrice + ";" + lp_clipboard.prevMaxPrice
                        });

                        lp_changes.inFilterBox = true;
                        ListPage.controller.updatePage();
                    } else {
                        $.merge(filterGroupQueue, $currentGroup.find("input:checked"));
                        $activeFilters.eq(0).click();
                    }

                    //Hide SEO Text
                    $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").hide();

                });

                //Add event to window scroll (To load more pages)
                if (lp_clipboard.pageType === "nc") {
                    $(window).on("scroll", function(e) {
                        var $docheight = $(document).height();
                        var productCount = parseInt($(".js-prdct-cnt__rng").html().split("-")[1]);
                        var totalProducts = parseInt($(".js-prdct-cnt__totl").html());

                        if ($docheight - $(e.target).scrollTop() < 1800) {
                            if (lp_clipboard.scroll.isEnabled && !lp_clipboard.scroll.isLoading && lp_clipboard.scroll.counter < 3 && productCount<totalProducts) {
                                if (lp_clipboard.scroll.isAutoLoad) {
                                    lp_clipboard.scroll.counter++;
                                    lp_clipboard.scroll.isTrigger = true;
                                    lp_clipboard.scroll.isLoading = true;
                                    lp_clipboard.isOnLoad = false;
                                    ListPage.controller.updatePage();
                                }
                            }
                        }
                    });
                }

                // edit min and max price numbers in inputfiled
                $doc.on("change", ".js-fltr-prc__inpt-min, .js-fltr-prc__inpt-max", function() {
                    $(".fltr-val__inpt[name=price]").prop('checked', false);
                    var numRegEx = /^[0-9]+$/,
                        $minPriceInpt = $(".js-fltr-prc__inpt-min"),
                        $maxPriceInpt = $(".js-fltr-prc__inpt-max"),
                        minPrice = $minPriceInpt.val(),
                        maxPrice = $maxPriceInpt.val(),
                        lp_clipboard = ListPage.model.clipboard;

                    if (numRegEx.test(minPrice) && numRegEx.test(maxPrice)) {
                        minPrice = parseInt(minPrice, 10);
                        maxPrice = parseInt(maxPrice, 10);
                        if (minPrice < maxPrice) {
                            if (minPrice < lp_defaults.priceMin) {
                                minPrice = lp_defaults.priceMin;
                                $minPriceInpt.val(minPrice);
                            }
                            if (maxPrice > lp_defaults.priceMax) {
                                maxPrice = lp_defaults.priceMax;
                                $maxPriceInpt.val(maxPrice);
                            }
                            if (minPrice !== lp_defaults.priceMin || maxPrice !== lp_defaults.priceMax) {
                                // if new price range is subset of total range then apply filter
                                $.extend(lp_changes.add, {
                                    "price": minPrice + ";" + maxPrice
                                });
                            } else {
                                // if new price range is total range then remove existing price filter.
                                $.extend(lp_changes.remove, {
                                    "price": lp_clipboard.prevMinPrice + ";" + lp_clipboard.prevMaxPrice
                                });
                            }

                            lp_changes.inFilterBox = true;
                            ListPage.controller.updatePage();
                            return;
                        }
                    }
                    $minPriceInpt.val(lp_clipboard.prevMinPrice);
                    $maxPriceInpt.val(lp_clipboard.prevMaxPrice);
                });

                ;(function AppliedFilterHandler() {
                    var remfilterQueue = [];

                    function removeAppliedFilters() {
                        var filterVal, $filterItem, minPrice, maxPrice;

                        // batch changes(DOM write operatations ie. to uncheck filters/remove tags) to trigger only one render operation.
                        $.each(remfilterQueue, function(i, filter) {
                            if ($(filter).closest(".js-fltrs-apld").data("groupname") === "searchTerm") {
                                lp_changes.remove.s = $(filter).data("value");
                            } else if ($(filter).closest(".js-fltrs-apld").data("groupname") === "localSearch") {
                                lp_changes.remove.ss = $(filter).data("value");
                            } else if ($(filter).closest(".js-fltrs-apld").data("groupname") === "price") {
                                lp_changes.remove.price = $(filter).data("value");
                            } else if ($(filter).closest(".js-fltrs-apld").data("groupname") === "discount") {
                                lp_changes.remove.discount = $(filter).data("value");
                            } else {
                                filterVal = $(filter).data("value");
                                $filterItem = $('.fltr-val__inpt[value="' + filterVal + '"]').closest(".fltr-val");

                                lp_changes.remove.property = lp_changes.remove.property || [];
                                lp_changes.remove.property.push($filterItem.find("input").attr("value")?$filterItem.find("input").attr("value"):filterVal);
                            }
                        });
                        remfilterQueue = [];

                        lp_changes.inFilterBox = false;
                        ListPage.controller.updatePage();
                    }

                    // remove applied filter by clicking tags shown above product list.
                    $(".js-fltrs-apld-wrpr1").on("click", ".js-fltrs-apld__item", function removeTag() {
                        $.merge(remfilterQueue, $(this));
                        removeAppliedFilters();
                    });

                    // remove applied filter by clicking tags shown above product list.
                    $(".js-fltrs-apld-wrpr1").on("click", ".js-fltrs-apld__lbl", function removeGroup() {
                        $.merge(remfilterQueue, $(this).closest(".js-fltrs-apld").find(".js-fltrs-apld__item"));
                        removeAppliedFilters();
                    });

                    $(".js-fltrs-apld-wrpr1").on("mouseover", ".js-fltrs-apld__lbl", function() {
                        $(this).closest(".js-fltrs-apld").addClass("js-fltrs-apld--strk");
                    }).on("mouseout", ".js-fltrs-apld__lbl", function() {
                        $(this).closest(".js-fltrs-apld").removeClass("js-fltrs-apld--strk");
                    });

                    $(".js-fltrs-apld-wrpr1").on("click", ".js-fltrs-apld-cler", function removeAll() {
                        $(".js-fltrs-apld__item").each(function() {
                            $.merge(remfilterQueue, $(this));
                        });
                        removeAppliedFilters();
                    });
                }());

                // sorting options.
                $doc.on("change", ".js-list-sort", function() {
                    var sortVal = $(this).val();
                    lp_changes.add.sort = sortVal;

                    lp_changes.inFilterBox = false;
                    ListPage.controller.updatePage();
                });

                // pagination.
                $doc.on("click", ".js-pgntn__item", function() {
                    if (!$(this).hasClass("pgntn__item--crnt")) {
                        var pgno = $(this).data("pgno");
                        lp_changes.add.page = pgno;

                        lp_changes.inFilterBox = false;
                        ListPage.controller.updatePage();
                    }
                    return false;
                });
            }());
        },
        "getDefaults": function() {
            var lp_defaults = ListPage.model.params.defaults,
                lp_clipboard = ListPage.model.clipboard,
                pageParams = (function() {
                    var $bodyWrapper = $(".body-wrpr"),
                        params = {},
                        startInr, endInr;

                    if ($bodyWrapper.data("refurb")) {
                        params.refurb = $bodyWrapper.data("refurb");
                    }
                    if ($bodyWrapper.data("category") && $bodyWrapper.data("page-type") != "nc") {
                        params.subcategory = $bodyWrapper.data("category");
                    }
                    if ($bodyWrapper.data("start_price") || $bodyWrapper.data("end_price")) {
                        startInr = parseInt($bodyWrapper.data("start_price") || $(".js-fltr-prc__inpt-min").attr("val"), 10);
                        endInr = parseInt($bodyWrapper.data("end_price") || $(".js-fltr-prc__inpt-max").attr("val"), 10);
                        params.price = startInr + ";" + endInr;
                    }
                    if ($bodyWrapper.data("brand")) {
                        params.property = params.property || "";
                        params.property += $(".fltr-val__inpt[dispname='" + $bodyWrapper.data("brand") + "']").attr("value") + "|";
                    }
                    if ($bodyWrapper.data("property")) {
                        params.property = params.property || "";
                        params.property += $bodyWrapper.data("property") + "|";
                    }
                    if ($bodyWrapper.data("properties")) {
                        params.property = params.property || "";
                        params.property += $bodyWrapper.data("properties");
                    }
                    if ($bodyWrapper.data("discount")) {
                        params.discount = $bodyWrapper.data("discount");
                    }
                    if (params.property) {
                        params.property = $.grep(params.property.split("|").sort(), function(e, i) {
                            return (e !== "");
                        });
                    }

                    return params;
                }());

            $.extend(ListPage.model.params.page, pageParams);

            // get supported values of min and max price values by the slider.
            $.extend(lp_defaults, {
                "priceMin": parseInt($(".fltr-prc__sldr").attr("value").split(";")[0], 10),
                "priceMax": parseInt($(".fltr-prc__sldr").attr("value").split(";")[1], 10)
            });

            // store inital values as previous values when values change.
            $.extend(lp_clipboard, {
                "prevMinPrice": lp_defaults.priceMin,
                "prevMaxPrice": lp_defaults.priceMax,
                "pageType": $(".body-wrpr").data("page-type"),
                "pageName": $(".body-wrpr").data('page-name')
            });
        },
        "redirectPage": function(){
            
            if(ListPage.model.clipboard.pageType ==="nc-filter"){
                window.location.href = "//mysmartprice.com"+"/"+dataLayer[0].category+"/"+dataLayer[0].subcategory+ListPage.model.URLParams+"&ref=config_page";
            }
        },
        // once changes are update the page state before rendering the view.
        "updatePage": function() {
            var lp_current = ListPage.model.params.current,
                lp_changes = ListPage.model.params.changes,
                lp_defaults = ListPage.model.params.defaults,
                lp_page = ListPage.model.params.page,
                lp_clipboard = ListPage.model.clipboard,
                lp_services = ListPage.services,
                initHash, prop_strings;

            lp_clipboard.isOnLoad = $.isEmptyObject(lp_current);
            
            // Clear list page deals countdown timer
            clearInterval(timerInterval);

            if (!lp_clipboard.isOnLoad) {
                if (lp_clipboard.pageType === "nc" && !lp_current.subcategory) {
                    lp_changes.add.subcategory = $(".body-wrpr").data("category");
                }
                //apply additions in current state params
                $.each(lp_changes.add, function(key) {
                    if (key === "property") {
                        if ($.isArray(lp_changes.add.property)) {
                            lp_current.property = $.isArray(lp_current.property) ? lp_current.property : [];
                            $.merge(lp_current.property, lp_changes.add.property);
                        }
                    } else {
                        lp_current[key] = lp_changes.add[key];
                    }
                });
                //apply deletions in current state params
                $.each(lp_changes.remove, function(key) {
                    var index;
                    if (key === "property") {
                        $.each(lp_changes.remove.property, function(i, removedProperty) {
                            index = lp_current.property.indexOf(removedProperty);
                            lp_current.property.splice(index, 1);
                        });
                        if (lp_current.property.length === 0) {
                            delete lp_current.property;
                        }
                    } else {
                        delete lp_current[key];
                    }
                });
            } else {
                // if isOnLoad get current params from url hash.

                var urlQuery = "";

                if (lp_clipboard.pageType === "nc") {
                    urlQuery = window.location.href.split("?")[1];
                } else {
                    urlQuery = window.location.hash.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                }

                $.extend(lp_current, lp_services.filterURL.toParams(urlQuery));

                ;(function() {
                    var currentLength = 0;
                    $.each(lp_current, function() {
                        currentLength++;
                    });

                    // if no hash or if its a quicklink page inherit page params.
                    if (currentLength === 0 || lp_current.ql === "1") {
                        $.each(lp_page, function(param, pageParamValue) {
                            if ($.isArray(pageParamValue)) {

                                lp_current[param] = $.isArray(lp_current[param]) ? lp_current[param] : [];

                                $.each(pageParamValue, function(i, prop) {
                                    if (lp_current[param].indexOf(prop) === -1) {
                                        lp_current[param].push(prop);
                                    }
                                });
                            } else {
                                lp_current[param] = pageParamValue;
                            }
                        });
                        delete lp_current.ql;
                    }

                    // since every registered params on current is new add them to changes also.
                    $.each(lp_current, function(key) {
                        lp_changes.add[key] = lp_current[key];
                    });
                }());

                lp_current.subcategory = lp_current.subcategory || lp_page.subcategory;
                lp_clipboard.isLoadParamsEqualtoPageParams = (ListPage.services.filterURL.fromParams(lp_current) === ListPage.services.filterURL.fromParams(lp_page));

                // nc filter not working if there isn't any query with url
                if(lp_clipboard.pageType === "nc" && ListPage.services.filterURL.fromParams(lp_current) === "")
                    lp_clipboard.isLoadParamsEqualtoPageParams = false;

                ListPage.view.init();
            }

            //generate new hash, and start view rendering.
            ListPage.model.URLParams = ListPage.services.filterURL.fromParams(lp_current);
            if(lp_clipboard.pageType!=="nc-filter"){
                ListPage.view.render();
            }
        }
    }
};
