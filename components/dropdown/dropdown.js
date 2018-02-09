headerDropdownsHandlers();

Modules.$doc.on("click", hideDropdownContent)
    .on("click", ".dropdown .btn-dropdown", toggleDropdownContent);
    
function headerDropdownsHandlers() {
    var menuShowTimeout;
    Modules.$doc.on('click', 'body, .js-ctgry-btn, .js-drpdwn-menu-wrpr', function(e) {
        var data, time, now, diffTime, loadingTimeout;

        e.stopPropagation();

        if (!$('.drpdwn-menu-wrpr--show').length && $(this).hasClass("js-ctgry-btn")) {
            $('.js-drpdwn-menu-wrpr').addClass('drpdwn-menu-wrpr--show');
            $('.js-drpdwn-menu-ovrly').addClass('drpdwn-menu-ovrly--show');
            if (Modules.$win.height() < $(".drpdwn-menu").height() + $('.js-drpdwn-menu-wrpr').offset().top) {
                $(".js-drpdwn-menu-wrpr").addClass("drpdwn-menu-wrpr--s");
            }
            if ($('.drpdwn-menu').data('processed') == 'done' && location.hash !== '#forcepopup') {
                menuShowTimeout = setTimeout(function() {
                    $('.drpdwn-menu').addClass('drpdwn-menu--show');
                }, 340);
                return; //if already procesed
            }

            if (localStorage && location.hash !== '#forcepopup') {
                //check if data is not one week old
                time = parseInt(localStorage.browsePopupDataTime, 10);
                now = new Date().getTime();
                diffTime = (now - time) / (1000 * 60 * 60 * 24);

                if (diffTime < 30 && localStorage.browsePopupDataVer == $('.js-drpdwn-menu-wrpr').data('ver')) {
                    //getting data from localStorage
                    data = localStorage.browsePopupData;
                }
            }

            if (!data || data == 'undefined' || data === undefined) {
                loadingTimeout = setTimeout(function() {
                    $('.js-drpdwn-menu-wrpr').find('.drpdwn-menu-wrpr__ldng').show();
                }, 600);
                data = getBrowsePopupData();
                localStorage.browsePopupData = data;
                localStorage.browsePopupDataTime = new Date().getTime();
                localStorage.browsePopupDataVer = $('.js-drpdwn-menu-wrpr').data('ver');
                // if data is not avaialble in localStorage do ajax and save in localStorage for later use
            }
            if (data && data != 'undefined' && data !== undefined) {
                $('.drpdwn-menu').html(data).data('processed', 'done');
                menuShowTimeout = setTimeout((function() {
                    $('.js-drpdwn-menu-wrpr').find('.drpdwn-menu-wrpr__ldng').hide();
                    clearTimeout(loadingTimeout);
                    $('.drpdwn-menu').addClass('drpdwn-menu--show');
                }), 340);
                // on data available hide loading and show data
            }
        } else if (!$(this).hasClass('js-drpdwn-menu-wrpr')) {
            clearTimeout(menuShowTimeout);
            $('.js-drpdwn-menu-wrpr').removeClass('drpdwn-menu-wrpr--show');
            $('.drpdwn-menu').removeClass('drpdwn-menu--show');
            $('.js-drpdwn-menu-ovrly').removeClass('drpdwn-menu-ovrly--show');
            $('.js-drpdwn-menu-wrpr').find('.drpdwn-menu-wrpr__ldng').hide();
        }
    });
}

function hideDropdownContent() {
    $(".dropdown .dropdown-content").addClass("hide");
}

function toggleDropdownContent() {
    $(".dropdown .dropdown-content").toggleClass("hide");
    return false;
}