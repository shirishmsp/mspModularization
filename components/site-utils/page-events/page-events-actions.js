bindAutoComplete(); // Initializing the autoComplete
initScrollToTop(); // Scroll to page top

Modules.$doc.on("click", ".js-copy", handleCopyText);
Modules.$doc.on("click", ".js-send-email", handleSendEmail);

/* ************** 4. Functions: ************** */

function handleCopyText() {
    $this = $(this);
    copyText($this, function(){
        $this.text("COPIED").removeClass("bttn--blue").addClass("bttn--grn");
    }, function(){
        //Do something when copying is not supported by browser
    })
}

function handleSendEmail(){
    var address = $(this).data("address"),
        subject = $(this).data("subject"),
        body = $(this).data("body"),
        strMail = 'mailto:' + encodeURIComponent(address) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    window.open(strMail, "_blank");
}

function bindAutoComplete() {
    var $searchBox = $(".srch-wdgt"),
        $searchField = $searchBox.find(".js-atcmplt");
    if ($searchField.length) {
        var autocompleteObj = $searchField.autocomplete({
            minLength: 0,
            delay: 110,
            autoFocus: false,
            max: 10,
            open: function(event, ui) {
                $(".ui-menu").css({
                    "width": $searchBox.width(),
                    "left": "-1px",
                    "top": "1px",
                    "clear": "both"
                });
                $searchBox.addClass("srch-wdgt--show-rslt");
            },
            close: function(event, ui) {
                $searchBox.removeClass("srch-wdgt--show-rslt");
            },
            source: function(request, response) {
                request.term = $.trim(request.term).toLowerCase();
                if (request.term.length < 3)
                    request.term = "_top_";
                var _cache = bindAutoComplete._cache_ = bindAutoComplete._cache_ || { "keys": [], "values": [] },
                    keyIndex = _cache.keys.indexOf(request.term);
                if (keyIndex > -1) {
                    response(_cache.values[keyIndex]);
                    return;
                }
                $.ajax({
                    "url": "/msp/search/auto_suggest_search.php",
                    "dataType": "json",
                    "data": request
                }).done(function(json) {
                    if (!json) {
                        response([]);
                        return;
                    }
                    var results = [];
                    if (json.subcategories && json.subcategories.length)
                        $.merge(results, json.subcategories);
                    if (json.terms && json.terms.length)
                        $.merge(results, json.terms);
                    if (json.products && json.products.length)
                        $.merge(results, json.products);
                    if (!results.length) {
                        response([]);
                        return;
                    }
                    _cache.keys.push(request.term);
                    _cache.values.push(results);
                    if (_cache.keys.length > 25) {
                        _cache.keys.shift();
                        _cache.values.shift();
                    }
                    response(results);
                }).fail(function() {
                    response([]);
                });
            },
            select: function(event, ui) {
                if (ui.item.url) {
                    var pageUrl = window.location.href.split("#"),
                        searchUrl = ui.item.url.split("#");
                    if (pageUrl[0] === searchUrl[0]) {
                        if (pageUrl[1] !== searchUrl[1]) {
                            // Same path, different hashes; update URL and force-refresh
                            window.location.href = ui.item.url;
                            window.location.reload();
                        } else
                            window.location.reload(); // Identical URLs, just reload
                    } else
                        window.location.href = ui.item.url; // Different paths, just update URL
                } else {
                    $(this).parent().find('.search_type').val('auto');
                    var typed_term = $(this).val();
                    $(this).parent().find('.typed_term').val(typed_term);
                    $(this).val(ui.item.value).closest("form").submit();
                }
            }
        }).data("ui-autocomplete");

        autocompleteObj._renderItem = function(ul, item) {
            var term = this.term.split(" ").join("|"),
                regEx = new RegExp("\\b(" + term + ")", "gi"),
                innerHtml = item.value.replace(regEx, "<strong>$1</strong>"),
                $listItem = $("<li>").data("item.autocomplete", item);
            if (item.subcategory) {
                innerHtml += " in <span style='font-weight: bold; color: #c00;'>" + item.subcategory + "</span>";
                $listItem.addClass("subcategory-item");
            } else if (item.image) {
                innerHtml = "<span class='image'><img src='" + item.image + "' alt='" + item.value + "'/></span>" + innerHtml;
                $listItem.addClass("product-item");
            } else
                $listItem.addClass("string-item");
            innerHtml = "<a>" + innerHtml + "</a>";
            return $listItem.append(innerHtml).appendTo(ul);
        };

        autocompleteObj._renderMenu = function(ul, items) {
            var that = this;
            $.each(items, function(index, item) {
                that._renderItemData(ul, item);
            });

            var $ul = $(ul);
            $ul.find(".string-item").first().not(":first-child").before("<li class='separator-item'><span>Popular terms</span></li>");
            $ul.find(".product-item").first().before("<li class='separator-item'><span>Popular products</span></li>");
        };
    }
}

/* RUI:: scroll to top button functionality - start */
function initScrollToTop() {
    var $body = $('body'),
        toTopHtml = [
            "<div class='to-top'>",
            "<div class='to-top__btn js-lazy-bg'></div>",
            "<div class='to-top__lbl'>Back to top</div>",
            "</div>"
        ].join(""),
        $toTop = $(toTopHtml),
        showScrollToTopDisplay = 'hidden';

    $body.append($toTop);

    $toTop.on("click", function() {
        $body.animate({
            'scrollTop': '0'
        }, 'slow', function() {
            showScrollToTopDisplay = 'hidden';
        });
        $toTop.stop(true, true).fadeOut();
    });

    $win.on("scroll", function() {
        if ($(this).scrollTop() > 100) {
            if (showScrollToTopDisplay == 'hidden') {
                showScrollToTopDisplay = 'display';
                $toTop.stop(true, true).fadeIn();
            }
        } else {
            if (showScrollToTopDisplay == 'display') {
                showScrollToTopDisplay = 'hidden';
                $toTop.stop(true, true).fadeOut();
            }
        }
    });
}

function copyText($selector, successCallback, failCallback) {
    var text = $selector.data("text");
    $('body').append("<input class='js-temp-txt' value=" + text + " />");
    $(".js-temp-txt").select();
    try {
        document.execCommand('copy');
        successCallback();
    } catch (e) {
        failCallback(e);
    }
}



function handleSendEmail() {
    var address = $(this).data("address"),
        subject = $(this).data("subject"),
        body = $(this).data("body"),
        cc = $(this).data("cc"),
        strMail = 'https://mail.google.com/mail/?view=cm&fs=1&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body) + '&cc=' + encodeURIComponent(cc);
    window.open(strMail, "_blank");
}