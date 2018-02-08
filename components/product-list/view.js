var ListPage = {
	"view": {
        "init": function() {
            var lp_current = ListPage.model.params.current,
                lp_defaults = ListPage.model.params.defaults;

            ListPage.view.filterPlugins.init({
                "priceSlider": {
                    "min": lp_current.price ? lp_current.price.split(";")[0] : lp_defaults.priceMin,
                    "max": lp_current.price ? lp_current.price.split(";")[1] : lp_defaults.priceMax
                }
            });
        },
        "render": function() {
            var lp_current = ListPage.model.params.current,
                lp_changes = ListPage.model.params.changes,
                lp_defaults = ListPage.model.params.defaults,
                lp_page = ListPage.model.params.page,
                lp_clipboard = ListPage.model.clipboard,
                lp_filterPlugins = ListPage.view.filterPlugins,
                pushStateValue = ListPage.model.URLParams,
                filterControls;


            if (lp_clipboard.pageType === "nc") {
                if(pushStateValue === "")
                    pushStateValue = window.location.pathname;
                window.history.pushState("", "Filters", pushStateValue);
            } else if(lp_clipboard.pageType === "nc-filter"){
                // TODO: Skip for now. Add any hash changes required on Configured Filter Page
            } else {
                window.location.hash = ListPage.model.URLParams;
            }

            if (lp_clipboard.isOnLoad) {
                $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").show();
            }
            if (ListPage.services.filterURL.fromParams(lp_current) !== ListPage.services.filterURL.fromParams(lp_page)) {
                $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").hide();
                $(".js-list-ttl").html($(".list-info__ttl").html());
            }

            if (lp_clipboard.pageType === "nc") {
                if ($(".body-wrpr").data("indexed")) {
                    $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").show();
                } else {
                    $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").hide();
                }
            }

            ;(function updateProductListAndOtherWidgets() {
                var lp_changes = $.extend({}, ListPage.model.params.changes),
                    lp_current = $.extend({}, ListPage.model.params.current),
                    loadingMaskHtml = ListPage.view.components.loadingMask(),
                    loadingMaskSmall = ListPage.view.components.loadingMaskSmall(),
                    loadingStart = +new Date();

                if (lp_clipboard.pageType === "nc") {
                    if (!lp_clipboard.scroll.isLoading) {
                        lp_clipboard.scroll.counter = 0;
                    }

                    $.extend(lp_current, {
                        "start": lp_clipboard.scroll.counter * 24,
                        "rows": 24,
                        "pageName": lp_clipboard.pageName
                    });

                }

                // get new product list and filters based on updated current params
                if (lp_clipboard.pageType === "nc" && lp_clipboard.isOnLoad){
                    //no rerender needed here 
                }
                // get new product list and filters based on updated current params
                else if ($(".body-wrpr").length !== 0) {

                    if (!(lp_clipboard.isOnLoad && lp_clipboard.isLoadParamsEqualtoPageParams)) {

                        // if($(".js-fltr-ldng-mask").length !== 0)
                        if(lp_clipboard.scroll.isLoading || lp_clipboard.pageType == "search"){
                            $(".js-prdct-grid-wrpr").append(loadingMaskSmall);
                        }
                        else{
                            $(".js-prdct-grid-wrpr").append(loadingMaskHtml);    
                        }

                        $(".js-load-more").hide();
                        ListPage.services.fetch.productList(lp_current).done(function(response) {
                            var freshData = response.split("//&//#"),
                                lp_filterPlugins = ListPage.view.filterPlugins;

                            //Remove No Data DOM
                            $(".prdct-grid__no-data").remove();
                            ListPage.model.params.current.page = undefined;

                            if (lp_changes.inFilterBox) {
                                // manipulate loaded filter html
                                var $newFilterBox = $(freshData[0]),
                                    $groupsToReplace,
                                    replacedGroups = [];

                                $groupsToReplace = (function() {
                                    var affectedGroups = (function() {
                                        var result = [];
                                        $.each(["add", "remove"], function(i, context) {
                                            if ("price" in lp_changes[context]) {
                                                result.push("price");
                                            }
                                            if ("property" in lp_changes[context]) {
                                                $.each(lp_changes[context].property, function(i, propValue) {
                                                    var groupname = $(".fltr-val[value='" + propValue + "']").closest(".fltr").data("groupname");
                                                    result.push(groupname);
                                                });
                                            }
                                        });
                                        return result;
                                    }());

                                    return $newFilterBox.find(".fltr").filter(function() {
                                        return affectedGroups.indexOf($(this).data("groupname")) === -1;
                                    });
                                }());

                                $groupsToReplace.each(function() {
                                    var $newFilterBlock = $(this),
                                        groupname = $newFilterBlock.data("groupname"),
                                        $exisingFilterBlock = $(".fltr[data-groupname='" + groupname + "']");
                                    replacedGroups.push(groupname);
                                    $exisingFilterBlock.replaceWith($newFilterBlock);
                                });

                                lp_filterPlugins.init({
                                    "priceSlider": {
                                        "min": lp_clipboard.slider.priceMin,
                                        "max": lp_clipboard.slider.priceMax
                                    }
                                }, replacedGroups);
                            } else {
                                // load new filters
                                $(".fltr-wrpr1").html(freshData[0]);
                                lp_filterPlugins.init({
                                    "priceSlider": {
                                        "min": lp_clipboard.slider.priceMin,
                                        "max": lp_clipboard.slider.priceMax
                                    }
                                });
                            }

                            if (!lp_clipboard.isLoadParamsEqualtoPageParams || lp_clipboard.scroll.isLoading) {

                                if (lp_clipboard.pageType === "nc") {
                                    $(".js-pgntn-cnt-ajax, .js-prdct-cnt-ajax").remove();

                                    if (lp_clipboard.scroll.isLoading) {
                                        $(".js-prdct-grid-wrpr").append(freshData[1]);
                                    } else {
                                        $(".js-prdct-grid-wrpr").html(freshData[1]);
                                    }

                                    //Update bottom pagination counter
                                    $(".js-pgntn-cnt__crnt").text($(".js-pgntn-cnt-ajax").data('current'));
                                    $(".js-pgntn-cnt__totl").text($(".js-pgntn-cnt-ajax").data('total'));

                                } else {
                                    $(".js-prdct-grid-wrpr").html(freshData[1]);
                                }

                                //Update top left product counter
                                var productCount = $(".js-prdct-cnt-ajax").data('count');
                                var totalProducts = $(".js-prdct-cnt-ajax").data('total');

                                if (productCount && productCount.split("-")[1] >= totalProducts) {
                                    $(".js-load-more").hide();
                                }
                                else {
                                    $(".js-load-more").show();   
                                }


                                $(".js-prdct-cnt__rng").text(productCount);
                                $(".js-prdct-cnt__totl").text(totalProducts);
                            } else {
                                lp_clipboard.isLoadParamsEqualtoPageParams = false;
                            }

                           if(ListPage.model.clipboard.pageType === "search"){
                                 $('.srch-fdbck').show();
                            }

                            lazyLoadImages();
                            lazyLoadBgImages();
                            attachFilterScroll();
                        }).always(function() {
                            var loadingTime = +new Date() - loadingStart,
                                loadingMaskDelay = (loadingTime < 250) ? (250 - loadingTime) : 0;
                            ProductList.initGrid();

                            setTimeout(function() {
                                $(".ldng-mask-wrpr").remove();
                                $(".js-fltr-ldng-mask").remove();
                            }, loadingMaskDelay);

                            lp_clipboard.scroll.isLoading = false;
                        });
                    } else {
                        lp_clipboard.scroll.isLoading = false;
                        $(".js-fltr-ldng-mask").remove();
                        lp_clipboard.isLoadParamsEqualtoPageParams = false;
                    }
                }

                // get new hourly deals based on updated current params
                if ($(".js-hrly-deals-grid").length) {
                    ;(function _getHourlyDeals() {
                        var $hourlyDealsWidget = $(".js-hrly-deals-grid");

                        ListPage.services.fetch.hourlyDeals(lp_current).done(function(html) {
                            var $timer, dataMinutes, dataSeconds, timerStart, clockStart,
                                timerHtml = html.split("//&//#")[0],
                                productsHtml = html.split("//&//#")[1];

                            function parseTime(value) {
                                value = parseInt(value, 10);
                                return (isNaN(value) || value < 0 || value > 59) ? 59 : value;
                            }

                            $hourlyDealsWidget.find(".sctn__inr").html(productsHtml);
                            $hourlyDealsWidget.find(".js-hrly-deals__cntdwn-wrpr").html(timerHtml);

                            if ($(productsHtml).filter(".prdct-item-with-bdg").length > 2) {
                                $hourlyDealsWidget.find(".sctn__view-all-link").show();
                            } else {
                                $hourlyDealsWidget.find(".sctn__view-all-link").hide();
                            }

                            $timer = $hourlyDealsWidget.find(".cntdwn");
                            if ($timer.length) {
                                dataMinutes = parseTime($timer.find(".cntdwn__mins").data("minutes"));
                                dataSeconds = parseTime($timer.find(".cntdwn__scnds").data("seconds"));
                                timerStart = dataMinutes * 60 + dataSeconds;
                                clockStart = parseInt(+new Date() / 1000, 10);

                                if (!(dataMinutes === 0 && dataSeconds === 0)) {
                                    timerInterval = setInterval((function timer() {
                                        var elapsedTime = (Math.floor(+new Date() / 1000) - clockStart),
                                            minutes = Math.floor((timerStart - elapsedTime) / 60),
                                            seconds = (timerStart - elapsedTime) % 60;

                                        if (seconds <= 0) {
                                            seconds = 59;
                                            if (minutes <= 0) {
                                                clearInterval(timerInterval);
                                                _getHourlyDeals();
                                                return;
                                            }
                                        }
                                        $timer.find(".cntdwn__mins").text(minutes < 10 ? "0" + minutes : minutes);
                                        $timer.find(".cntdwn__scnds").text(seconds < 10 ? "0" + seconds : seconds);
                                        return timer;
                                    }()), 1000);
                                } else {
                                    $timer.hide();
                                    $hourlyDealsWidget.find(".hrly-deals-expry-lbl").hide();
                                }
                            }
                        }).fail(function() {
                            $hourlyDealsWidget.find(".cntdwn").hide();
                            $hourlyDealsWidget.find(".hrly-deals-expry-lbl").hide();
                        });
                    }());
                }
            }());

            // operations to be done to add/remove filters.
            filterControls = {
                "add": function() {
                    var $filterGroupOptions,
                        appliedFilterComponents = ListPage.view.components.appliedFilter;

                    // initialize all filtergroups, cleargroups as inactive and activate based on current params
                    $(".fltr__cler").removeClass("fltr__cler--show");
                    //$('.fltr__val').removeClass('active');

                    // apply all filters registered on filterControls.add.queue
                    $.each(filterControls.add.queue, function(i, filterItem) {
                        // batch html of all the filters to append all filter tags in one go.
                        if ("unitValue" in filterItem) {
                            $filterGroupOptions = $(".fltr[data-groupname='" + filterItem.groupName + "'] .fltr-val__inpt");
                            if ($filterGroupOptions.closest(".fltr-val").hasClass("js-fltr-val--sngl") || filterItem.groupName == "localSearch" || filterItem.groupName == "price") {
                                $(".js-fltrs-apld[data-groupname='" + filterItem.groupName + "']").remove();
                            }
                            $filterGroupOptions.filter("[value='" + filterItem.unitValue + "']").prop("checked", true);
                            setTimeout(function() {
                                $(".fltr[data-groupname='" + filterItem.groupName + "']").find(".fltr__cler").addClass("fltr__cler--show");
                            }, 0);
                        }
                        if (filterItem.groupName == "price") {
                            // update priceSlider range points
                            $(".fltr-prc__sldr").slider("values", [
                                lp_filterPlugins.priceSlider.priceToRange(filterItem.unitValue.split(";")[0]),
                                lp_filterPlugins.priceSlider.priceToRange(filterItem.unitValue.split(";")[1])
                            ]);
                            $(".js-fltr-prc__inpt-min").val(filterItem.unitValue.split(";")[0]);
                            $(".js-fltr-prc__inpt-max").val(filterItem.unitValue.split(";")[1]);
                        }
                        // batch html of all the filters to append all filter tags in one go.
                        if ($(".js-fltrs-apld[data-groupname='" + filterItem.groupName + "']").length !== 0) {
                            $(".js-fltrs-apld[data-groupname='" + filterItem.groupName + "']").append(appliedFilterComponents.unit(filterItem));
                        } else {
                            $(".js-fltrs-apld-wrpr").append(appliedFilterComponents.group(filterItem));
                        }
                    });

                    if (filterControls.add.queue.length !== 0) {
                        $(".js-fltrs-apld-wrpr1").show();

                        ;(function showFollowThisSearchButton() {

                            if (lp_clipboard.pageType !== "nc") {

                                var subcatName = $('.body-wrpr').data('listname'),
                                    subcatCode = $('.body-wrpr').data('listcode'),
                                    URLParams = encodeURIComponent(window.location.hash);

                                var hrefVal = "../../promotions/savesearchpopup.php?subcatname=" + encodeURIComponent(subcatName) + "&subcatcode=" + encodeURIComponent(subcatCode) + "&filterhash=" + URLParams;
                                $(".list-hdr__save").data("href", hrefVal).show();
                            }

                        }());
                    }
                },
                "remove": function() {
                    // remove all filters registered on filterControls.remove.queue
                    $.each(filterControls.remove.queue, function(i, filterItem) {
                        var $remfilterGrp = $(".js-fltrs-apld[data-groupname='" + filterItem.groupName + "']"),
                            $remfilterUnit = $remfilterGrp.find(".js-fltrs-apld__item[data-value='" + filterItem.unitValue + "']"),
                            $filterOption = $(".fltr-val__inpt[value='" + filterItem.unitValue + "']");

                        if ($remfilterGrp.find(".js-fltrs-apld__item").length === 1) {
                            $remfilterGrp.remove();
                        } else {
                            $remfilterUnit.remove();
                        }

                        // FIXME:: on clearing --multi filter block first item remains selected
                        // -> setTimeout is a temporary fix to do unchecking after handler is executed.
                        setTimeout(function() {
                            $filterOption.prop("checked", false);

                            if ($filterOption.closest(".fltr").find(".fltr-val__inpt:checked").length === 0) {
                                $filterOption.closest(".fltr").find(".fltr__cler").removeClass("fltr__cler--show");
                            }
                        }, 0);

                        if (filterItem.groupName === "price") {
                            // update priceSlider range points
                            $(".fltr-prc__sldr").slider("values", [0, 200]);
                            $(".js-fltr-prc__inpt-min").val(lp_defaults.priceMin);
                            $(".js-fltr-prc__inpt-max").val(lp_defaults.priceMax);
                        }
                    });

                    // if all filter tags removed remove "clear all" filter tag also
                    if ($(".js-fltrs-apld").length === 0) {
                        $(".js-fltrs-apld-wrpr1").hide();
                        $(".list-hdr__save").hide();
                    }
                }
            };

            // after all filters added/removed reinitialize queue to empty.
            filterControls.add.queue = [];
            filterControls.remove.queue = [];

            // register all filter changes to filterControls queue to batch applying and removing operations.
            $.each(["add", "remove"], function(i, action) {
                if ("s" in lp_changes[action]) {
                    $(".js-hdr-srch").val(lp_changes[action].s);
                    filterControls[action].queue.push({
                        "unitValue": lp_changes[action].s,
                        "unitLabel": lp_changes[action].s,
                        "groupName": "searchTerm",
                        "groupLabel": "Search"
                    });
                }
                if ("sort" in lp_changes[action]) {
                    $('.js-list-sort option[value="' + lp_changes[action].sort + '"]').attr("selected", "selected");
                }

                if ("ss" in lp_changes[action]) {
                    $(".list-hdr-srch__fld").val(lp_current.ss);
                    filterControls[action].queue.push({
                        "unitValue": lp_changes[action].ss,
                        "unitLabel": lp_changes[action].ss,
                        "groupName": "localSearch",
                        "groupLabel": "List Search"
                    });
                }
                if ("price" in lp_changes[action]) {
                    ;(function() {
                        var startInr = lp_changes[action].price.split(";")[0],
                            endInr = lp_changes[action].price.split(";")[1],
                            unitValue = lp_changes[action].price,
                            unitLabel = startInr.toLocaleString() + "-" + endInr.toLocaleString(),
                            minSlider, maxSlider;

                        filterControls[action].queue.push({
                            "unitValue": unitValue,
                            "unitLabel": unitLabel,
                            "groupName": 'price',
                            "groupLabel": 'price'
                        });

                        // if price filter is to be added update slider values to new values
                        if (action === "add") {
                            lp_clipboard.slider.priceMin = startInr;
                            lp_clipboard.slider.priceMax = endInr;
                            // if price filter is to be removed update slider values to min and max values.
                        } else {
                            lp_clipboard.slider.priceMin = lp_defaults.priceMin;
                            lp_clipboard.slider.priceMax = lp_defaults.priceMax;
                        }
                    }());
                }
                if ("property" in lp_changes[action]) {
                    $.each(lp_changes[action].property, function(i, value) {
                        var $filterItem = $('.fltr-val__inpt[value="' + value + '"]'),
                            $topFilter = $('.js-fltrs-apld__item[data-value="' + value + '"]'),
                            unitValue = value,
                            unitLabel = $filterItem.attr("dispname"),
                            groupName = $filterItem.closest(".fltr").data("groupname")?$filterItem.closest(".fltr").data("groupname"):$topFilter.closest(".js-fltrs-apld").data("groupname"),
                            groupLabel = $.trim($filterItem.closest(".fltr").find(".fltr__ttl").text());

                        filterControls[action].queue.push({
                            "unitValue": unitValue,
                            "unitLabel": unitLabel,
                            "groupName": groupName,
                            "groupLabel": groupLabel
                        });
                    });
                }
                if ("discount" in lp_changes[action]) {
                    var unitValue = lp_changes[action].discount,
                        unitLabel = lp_changes[action].discount.split(";")[0] + "% - " + lp_changes[action].discount.split(";")[1] + "%";
                    filterControls[action].queue.push({
                        "unitValue": unitValue,
                        "unitLabel": unitLabel,
                        "groupName": 'discount',
                        "groupLabel": 'discount'
                    });
                }
            });

            $.each(["add", "remove"], function(i, action) {
                if (filterControls[action].queue.length) {
                    filterControls[action]();
                }
            });

            $.extend(lp_clipboard, {
                "prevMinPrice": lp_current.price ? lp_current.price.split(";")[0] : lp_defaults.minPrice,
                "prevMaxPrice": lp_current.price ? lp_current.price.split(";")[1] : lp_defaults.maxPrice,
                "prevLocalSearch": lp_current.ss || ""
            });

            // after all changes reflected in the view re-initialize changes to empty.
            $.extend(lp_changes, {
                "add": {},
                "remove": {}
            });
        },
        "filterPlugins": {
            "init": function(settings, replacedGroups) {
                ListPage.view.filterPlugins.nanoScrollbarInit(replacedGroups);
                ListPage.view.filterPlugins.priceSlider.init(settings.priceSlider, replacedGroups);
            },
            "priceSlider": {
                "init": function(settings, replacedGroups) {
                    var minPrice = settings.min,
                        maxPrice = settings.max,
                        minSlider = minPrice ? this.priceToRange(minPrice) : 0,
                        maxSlider = maxPrice ? this.priceToRange(maxPrice) : 200,
                        lp_changes = ListPage.model.params.changes,
                        lp_filterPlugins = ListPage.view.filterPlugins;

                    if ($.isArray(replacedGroups) && replacedGroups.indexOf("price") === -1) {
                        return;
                    }

                    $(".fltr-prc__sldr").slider({
                        "range": true,
                        "min": 0,
                        "max": 200,
                        "values": [minSlider || 0, maxSlider || 200],
                        "step": 1,
                        "animate": true,
                        "slide": lp_filterPlugins.priceSlider.callback,
                        "stop": function(a, b) {
                            var startInr, endInr;

                            if (b.values[0] === 0 && b.values[1] === 200) {
                                startInr = ListPage.model.clipboard.prevMinPrice;
                                endInr = ListPage.model.clipboard.prevMaxPrice;

                                // if range is equal to total range then remove price filter
                                lp_changes.remove.price = startInr + ";" + endInr;
                            } else {
                                startInr = lp_filterPlugins.priceSlider.rangeToPrice(b.values[0]);
                                endInr = lp_filterPlugins.priceSlider.rangeToPrice(b.values[1]);

                                // if range is not equal to total range then add new price filter
                                lp_changes.add.price = startInr + ";" + endInr;
                            }

                            lp_changes.inFilterBox = true;
                            ListPage.controller.updatePage();
                            $(".fltr-val__inpt:checked").prop("checked", false);
                            $(".fltr-prc__sldr").slider("values", [b.values[0], b.values[1]]);
                        }
                    });

                    if (minPrice || maxPrice) {
                        $(".js-fltr-prc__inpt-min").val(minPrice || ListPage.model.params.defaults.price.split(";")[0]);
                        $(".js-fltr-prc__inpt-max").val(maxPrice || ListPage.model.params.defaults.price.split(";")[1]);
                    }
                },
                // get price value from slider range value
                "rangeToPrice": function(a) {
                    var priceMin = ListPage.model.params.defaults.priceMin,
                        priceMax = ListPage.model.params.defaults.priceMax,
                        b = Math.exp(Math.log(priceMax / priceMin) / 200),
                        priceValue = priceMin * Math.pow(b, a),
                        roundOff = Math.pow(10, Math.floor(Math.log(priceValue - (priceValue / b)) / Math.log(10)));

                    priceValue = Math.ceil(priceValue / roundOff) * roundOff;
                    if (a === 0 || priceValue < priceMin) return priceMin;
                    else if (a == 200 || priceValue > priceMax) return priceMax;
                    else return priceValue;
                },
                // get slider range from price value
                "priceToRange": function(price) {
                    var result = (function binarySearch(a, fn, min, max) {
                        binarySearch.old = binarySearch.current;
                        binarySearch.current = Math.floor((min + max) / 2);
                        if (binarySearch.old === binarySearch.current) {
                            return binarySearch.current;
                        }
                        if (a > fn(binarySearch.current)) {
                            min = binarySearch.current;
                        } else if (a < fn(binarySearch.current)) {
                            max = binarySearch.current;
                        } else {
                            return binarySearch.current;
                        }
                        return binarySearch(a, fn, min, max);
                    }(price, ListPage.view.filterPlugins.priceSlider.rangeToPrice, 0, 200));
                    return result;
                },
                // run this function while sliding the price slider.
                "callback": function(a, b) {
                    var minPrice, maxPrice;
                    if ((b.values[0] + 1) >= b.values[1]) {
                        return false;
                    }
                    minPrice = ListPage.view.filterPlugins.priceSlider.rangeToPrice(b.values[0]);
                    maxPrice = ListPage.view.filterPlugins.priceSlider.rangeToPrice(b.values[1]);
                    $(".js-fltr-prc__inpt-min").val(minPrice);
                    $(".js-fltr-prc__inpt-max").val(maxPrice);
                },
            },
            // init nanoscrollbar plugin to get overflow scroll to filterGroups
            "nanoScrollbarInit": function(filterGroups) {
                var $nanoElements;

                if (filterGroups) {
                    $nanoElements = $(".fltr-val-wrpr.nano").filter(function() {
                        return filterGroups.indexOf($(this).closest(".fltr").data("groupname")) !== -1;
                    });
                } else {
                    $nanoElements = $(".fltr-val-wrpr.nano");
                }

                $nanoElements.each(function() {
                    var totalHeight;
                    $filteritem = $(".fltr-val", $(this));
                    if ($filteritem.length <= ListPage.settings.filterLength) {
                        totalHeight = 0;
                        $filteritem.each(function() {
                            totalHeight += $(this).outerHeight(true);
                        });
                        if (totalHeight < 224) $(this).css("height", totalHeight + 'px');
                    }
                });
                $nanoElements.nanoScroller({
                    "alwaysVisible": true
                });
            },
        },
        "components": {
            "appliedFilter": {
                "group": function(filterItem) {
                    return [
                        '<div class="js-fltrs-apld" data-groupname="' + filterItem.groupName + '">',
                        '<div class="js-fltrs-apld__lbl">' + filterItem.groupLabel + ':</div>',
                        this.unit(filterItem),
                        '</div>'
                    ].join("");
                },
                "unit": function(filterItem) {
                    return [
                        '<div class="js-fltrs-apld__item" data-value="' + filterItem.unitValue + '">',
                        '<span class="js-fltrs-apld__item-label">' + filterItem.unitLabel + '</span>',
                        '<img class="js-fltrs-apld__item-cler" src="https://assets.mspcdn.net/msp-ui/icons/cross-grey-small.png"/>',
                        '</div>'
                    ].join("");
                }
            },
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
            "loadingMaskSmall": function() {
              return [
                    '<div class="ldng-mask-wrpr">',
                    '<div class="js-fltr-ldng-mask">',
                    '<div class="ldr ldr--sml">',
                    '<div class="ldr__crcl"></div>',
                    '<div class="ldr__text" style="">Loading...</div> ',
                    '</div>',
                    '</div>',
                    '</div>'
                ].join("");  
            }
        }
    }
}