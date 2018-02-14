/* function to create pricetable on the fly:
 * should be called everytime top price table changes */
function createSidebarPriceTable(storesInfo) {
    "use strict";

    var $inrSctn, $hdrSctn, $sctn,
        storesHTML = '',
        featuredHTML = '',
        $featuredStores, 
        $topPTMoreStore = $('.prc-tbl__more-info'),
        favIconTemplate = function favIconTemplate(strname) {
            return 'https://assets.mspcdn.net/msp-ui/fav-icon/' + strname + '.png';
        },
        logoTemplate = function logoTemplate(strname) {
            return 'https://assets.mspcdn.net/q_auto/logos/partners/' + strname + '_store.png';
        },
        createFeaturedStore = function createFeaturedStore(store) {
            return ['<div class="cols1-prdcts__ftrd" data-strname="' + store.storeName + '">',
                    '<div>',
                        '<div class="cols1-prdcts__ftrd-stre"><img src="' + logoTemplate(store.storeName) + '"></div>',
                        '<div class="cols1-prdcts__ftrd-prc">' + store.price + '</div>',
                    '</div>',
                    '<a rel="nofollow" target="_blank" href="' + store.gtsURL + '" class="cols1-prdcts__ftrd-gts js-gts-sidebar ' + store.storeName + ' ' + store.classes + '" data-url="' + store.gtsURL + '"></a>',
                '</div>'].join('');
        },
        $viewAll = $('<div class="cols1-prdcts__view-all text-link js-inpg-link" data-href="price-table">View all stores &raquo;</div>');

    if(storesInfo) {
        storesInfo.stores.forEach(function(store, idx) {
            if(store.storeName.toLowerCase() === 'amazon' || store.storeName.toLowerCase() === 'flipkart') {
                featuredHTML += createFeaturedStore(store);
            } else {
                storesHTML += [
                    '<div class="cols1-prdcts__str">',
                        '<div class="cols1-prdcts__str-name" data-strname="' + store.storeName + '">',
                            '<img class="cols1-prdcts__str-icon" src="' + favIconTemplate(store.storeName) + '">',
                            '<span>' + (store.storeName.charAt(0).toUpperCase() + store.storeName.slice(1)) + '</span>',
                        '</div>',
                        '<a rel="nofollow" target="_blank" href="' + store.gtsURL + '" class="cols1-prdcts__gts-btn js-gts-sidebar ' + store.classes + '" data-url="' + store.gtsURL + '">',
                            store.price + ' &#10141;',
                        '</a>',
                    '</div>'
                ].join('');
            }
        });
        // Sort amazon & flipkart featured stores (Amazon first):
        $featuredStores = $(featuredHTML).sort(function(a, b) {
            return $(a).data('strname') < $(b).data('strname') ? -1 : 1;
        });
        // inner section:
        $inrSctn = $('<div class="sctn__inr clearfix"></div>')
                    .prepend($(storesHTML))
                    .prepend($featuredStores);
        // full section:
        $sctn = $('<div class="sctn cols1-prdcts clearfix"></div>')
                .append($inrSctn);

        // View all only if there are actually more stores: 
        if($topPTMoreStore.length) {
            $sctn.append($viewAll);
        }

        return $sctn;
    }
}

function fetchTopPriceTableData() {
    if($('.prc-tbl').length) {
        var $topPriceTable = $('.prc-tbl'),
            $rows = $topPriceTable.find('.prc-tbl__row'),
            storesData = [];

        if($rows) {
            $rows.each(pushTopStoresData);
        }

        return {
            product: $('.prdct-dtl__ttl').text() + $('.prdct-dtl__ttl-vrnt').text(),
            productImage: $('.prdct-dtl__img').attr('src'),
            stores: storesData
        }
    }

    // *************

    function pushTopStoresData(idx, store) {
        var _$store = $(store),
            _gtsURL = _$store.find('.js-prc-tbl__gts-btn').attr('data-url');
        storesData.push({
            storeName: queryString(_gtsURL).store,
            price: _$store.find('.prc-tbl__prc').text().trim(), // saving price as text (rupee + commas)
            gtsURL: _gtsURL,
            classes: _$store.find('.js-prc-tbl__gts-btn').attr('class').match(/js[^\s]*/g, '').join(' ')
        });
    }
}

function updateSidebarPriceTable() {
    var $newSidebarSection = createSidebarPriceTable(fetchTopPriceTableData());
    if($('.cols1-prdcts').length) {
        $('.cols1-prdcts').remove();
    }
    $('.main-wrpr__cols1').prepend($newSidebarSection);
}

/*
 * Throttled sidebar scroller for pdp pages (holds pricetable info)
 */
(function sidebarScrollerPDP() {
    "use strict";

    var $mainWrapper = $('.main-wrpr'),
        mainTop = $mainWrapper.offset().top,
        mainLeft = $mainWrapper.offset().left,
        $sidebar = $('.js-pdp-sidebar'),
        $mainCol3 = $('.main-wrpr__cols3'),
        mainCol3Width = $mainCol3.width(),
        $mainCol1 = $('.main-wrpr__cols1'),
        $ftr = $('.ftr'),
        storesInfo = fetchTopPriceTableData();

    if(!storesInfo) {
        return;
    } else {
        $mainCol1.prepend(createSidebarPriceTable(storesInfo));
        $sidebar.css('left', (mainLeft + mainCol3Width) + 'px');
        Modules.$win.scroll(Modules.throttle(sidebarScrollEvent, 100));
    }

    // ********************

    function sidebarScrollEvent() {
        var $win = $(this),
            winTop = $win.scrollTop(),
            winHeight = $win.height(),
            padding = 100;
        if(winTop - padding > mainTop) {
            if(!(winTop + winHeight > $ftr.offset().top)) {
                showSidebar();
            } else {
                hideSidebar();
            }
        } else {
            hideSidebar();
        }
    }
    function showSidebar() {
        $sidebar.addClass('main-wrpr__cols1--fixed');
        if(!$sidebar.is(":visible")) {
            $sidebar.show();
        }
    }
    function hideSidebar() {
        $sidebar.removeClass('main-wrpr__cols1--fixed');
        if($sidebar.is(":visible")) {
            $sidebar.hide();   
        }
    }
})(); // end sidebar pdp IIFE