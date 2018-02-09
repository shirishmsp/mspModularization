
/* RUI:: added classes of new UI to the existing handlers - start */
// binding keys start here
Modules.$doc.keyup(function(e) {
    if (e.keyCode == 27) { //esc button
        if ($('.browse-popup-cont.show, .drpdwn-menu-ovrly--show').length !== 0) {
            $('.browse-menu-btn .js-ctgry-btn').click(); //if browse menu is displayed close it  
        }
        if ($('.popup-overlay').length !== 0) {
            $('.popup-overlay').click(); //if popup is displayed close it
        }

        if ($(".pop-up__cls-btn")[0]) {
            $link = $(".pop-up__cls-btn > a");
            if ($link[0]) {
                window.open($link.attr('href'), '_blank');
            }
            $link.trigger(closePopup_RUI());
        }
    }
});

Modules.$doc.keydown(function(e) {
    if (e.altKey) { // checking for alt key
        var key = String.fromCharCode(e.keyCode).toLowerCase();
        switch (key) {
            case 'c':
                {
                    $('.browse-menu-btn, .js-ctgry-btn').click();
                    break;
                }
            case 's':
                {
                    $('.srch-wdgt__fld').focus();
                    break;
                }
        }
    }
});
// binding keys end here
/* RUI:: added classes of new UI to the existing handlers - start */

// **START** 
// OLD MSP.JS CODE --> Category dropdown: browse menu --> for old headers on non-comparables pages
// KEPT FOR COMPATIBILITY.
// browse menu processing start here
Modules.$doc.ready(function() {
    Modules.$doc.on('click', '.browse-menu-btn, .browse-popup-cont', function(e) {
        var left = $('.browse-menu-btn')
            .offset()
            .left;
        $('.browse-popup')
            .css('left', left)
            .toggleClass('show');
        $('.browse-popup-cont')
            .toggleClass('show');
        if ($('.browse-popup.show')
            .length !== 0) {

            if ($('.browse-popup-data')
                .data('processed') == 'done' && location.hash !== '#forcepopup') {
                setTimeout((function() {
                    $('.browse-popup')
                        .find('.loading-circle')
                        .hide();
                    $('.browse-popup-data')
                        .addClass('show');
                }), 340);
                return; //if already procesed
            }

            var data;

            if (localStorage && location.hash !== '#forcepopup') {

                //check if data is not one week old
                var time = parseInt(localStorage.browsePopupDataTime, 10),
                    now = new Date()
                    .getTime(),
                    diffTime = (now - time) / (1000 * 60 * 60 * 24);

                if (diffTime < 30 && localStorage.browsePopupDataVer == $('.browse-popup-data')
                    .data('ver')) {
                    //getting data from localStorage
                    data = localStorage.browsePopupData;
                }

            }

            if (!data || data == 'undefined' || data === undefined) {
                $('.browse-popup')
                    .find('.loading-circle')
                    .show();
                data = getBrowsePopupData();
                localStorage.browsePopupData = data;
                localStorage.browsePopupDataTime = new Date()
                    .getTime();
                localStorage.browsePopupDataVer = $('.browse-popup-data')
                    .data('ver');
                // if data is not avaialble in localStorage do ajax and save in localStorage for later use
            }
            if (data && data != 'undefined' && data !== undefined) {
                $('.browse-popup-data')
                    .html(data)
                    .data('processed', 'done');
                setTimeout((function() {
                    $('.browse-popup')
                        .find('.loading-circle')
                        .hide();
                    $('.browse-popup-data')
                        .addClass('show');
                }), 340);
                // on data available hide loading and show data
            }

        } else {
            $('.browse-popup-data')
                .removeClass('show');
        }
    });

    Modules.$doc.on('click', '.browse-popup', function(e) {
        e.stopPropagation();
    });
    // browse menu processing end here

    // // browse popup functions start here
    function getBrowsePopupData() {
        return getAjaxDataSync("/old_browse-menu.htm");
    }
    // browse popup functions end here

    // ajax functions start here
    function getAjaxDataSync(ajaxURL) {
        var ajaxData;
        $.ajax({
            url: ajaxURL,
            async: false
        }).done(function(data) {
            ajaxData = data;
        });
        return ajaxData;
    }
    // ajax functions end here
});
