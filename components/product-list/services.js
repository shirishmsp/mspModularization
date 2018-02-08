var ListPage = {
    "services": {
        "filterURL": {
            "toParams": function(filterURL) {

                var separator = ListPage.model.pageType == "nc" ? "?" : "#";

                var params = {},
                    prop_strings = decodeURIComponent(filterURL).replace(separator, "").split("&");

                if (prop_strings[0] !== "") {
                    $.each(prop_strings, function(i, prop_string) {
                        params[prop_string.split("=")[0]] = prop_string.split("=")[1];
                    });

                    if ("property" in params) {
                        params.property = $.grep(params.property.split("|").sort(), function(e, i) {
                            return (e !== "");
                        });
                    }

                    if (params.startinr !== params.priceMin || params.endinr !== params.priceMax) {
                        params.price = parseInt(params.startinr, 10) + ";" + parseInt(params.endinr, 10);
                    }

                    delete params.startinr;
                    delete params.endinr;
                }

                return params;
            },
            "fromParams": function(params) {
                var pageType = $(".body-wrpr").data("page-type"),
                    separator = (pageType == "nc" || pageType == "nc-filter") ? "?" : "#",
                    URLParams = [],
                    filterURL;

                $.each(params, function(key) {
                    var value;
                    if (params[key]) {
                        if (pageType == "nc" && key === "subcategory") {
                            URLParams.unshift(key + "=" + params[key]); // 'subcategory' should always be the first param in NC
                        }
                        else if (key === "price") {
                            URLParams.push("startinr=" + params[key].split(";")[0]);
                            URLParams.push("endinr=" + params[key].split(";")[1]);
                        }
                        else if (key === "property") {
                            URLParams.push(key + "=" + params[key].join("|"));
                        }
                        else {
                            URLParams.push(key + "=" + params[key]);
                        }
                    }
                });

                filterURL = URLParams.length > 0 ? separator + URLParams.join("&") : "";

                return filterURL;
            }
        },
        "fetch": {
            // generate query from all the new page state params
            "apiQuery": function(params) {
                var subCategory = ListPage.model.clipboard.pageType === "nc"? (subCategory = $(".body-wrpr").data("category")):params.subcategory;

                return [
                    "subcategory=" + subCategory,
                    params.category ? ("&category=" + params.category) : "",
                    params.refurb ? ("&refurb=" +params.refurb) : "",
                    params.s ? ("&s=" + params.s) : "",
                    params.property ? ("&property=" + params.property.join("|")) : "",
                    params.price ? ("&startinr=" + params.price.split(";")[0]) : "",
                    params.price ? ("&endinr=" + params.price.split(";")[1]) : "",
                    params.sort ? ("&sort=" + params.sort) : "",
                    params.ss ? ("&ss=" + params.ss) : "",
                    params.page ? ("&page=" + params.page) : "",
                    params.start ? ("&start=" + params.start) : "",
                    params.rows ? ("&rows=" + params.rows) : "",
                    params.discount ? ("&discount=" + params.discount) : "",
                    params.pageName ? ("&pageName=" + params.pageName) : "",
                    params.source ? ("&source=" + qS.source) : ""
                ].join("");
            },
            "productList": MSP.utils.memoize(function(currentParams) {
                var dfd = $.Deferred(),
                    query = this.apiQuery(currentParams),
                    _productList = ListPage.services.fetch.productList;

                if (_productList.XHR) _productList.XHR.abort();


                var service_url = "";

                if (ListPage.model.clipboard.pageType === "nc") {
                    service_url = "/fashion/filters/filter_get_redesign?" + query;
            if(window.location.href.indexOf("bestsellers") > -1){
             service_url = "/fashion/bestsellers_filters/filter_get_redesign?" + query; 
            }
                } else {
                    service_url = ($('.list-main').length ? '/msp/processes/property/api/msp_get_html_for_property_new.php?' : '/msp/search/msp_search_new.php?') + query;
                    log_data('property_info',{'subcategory':currentParams.subcategory,'property':query}, service_url);
                }

                //For Refurbished products
                if(currentParams.refurb==1) {
                    service_url = ($('.list-main').length ? '/msp/processes/property/api/msp_get_html_for_property_refurb.php?' : '/msp/search/msp_search_new.php?') + query;
                }
                _productList.XHR = $.ajax({
                    url: service_url,
                }).done(function(response) {
                    dfd.resolve(response);
                }).fail(function(error) {
                    dfd.reject(error);
                });

                return dfd.promise();
            }, {
                "cacheLimit": 15
            }),
            // hourly deals ajax loading
            "hourlyDeals": MSP.utils.memoize(function(currentParams) {
                var dfd = $.Deferred(),
                    query = this.apiQuery(currentParams),
                    _hourlyDeals = ListPage.services.fetch.hourlyDeals;

                if (_hourlyDeals.XHR) _hourlyDeals.XHR.abort();

                _hourlyDeals.XHR = $.ajax({
                    "url": "/msp/autodeals/hourly_deals.php?" + query
                }).done(function(response) {
                    dfd.resolve(response);
                }).fail(function(error) {
                    dfd.reject(error);
                });

                return dfd.promise();
            }, {
                "cacheLimit": 15
            })
        }
    }
}