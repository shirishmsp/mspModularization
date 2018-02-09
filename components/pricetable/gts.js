// Instatab Extension installer: GTS
$(document).on('click', '.js-instatab-popup', function(e) {
    e.preventDefault();
    var $this = $(this),
        gtsURL = $this.data('url'),
        isEmailSet = getCookie('msp_login_email'),
        isInstatabInstalled = getCookie('instatab');

    var popupCookieVal = getCookie('gtspopup') ? getCookie('gtspopup').split(';') : undefined,
        cookieNumTimes = popupCookieVal ? popupCookieVal[0] : undefined,
        cookieCurMessage = popupCookieVal ? popupCookieVal[1] : undefined,
        isEmailCaptured = popupCookieVal ? popupCookieVal[2] : undefined;

    if (popupCookieVal) {
        if (cookieNumTimes < 4) {
            if (cookieCurMessage === 'instatab') {
                if (isInstatabInstalled) {
                    if (!isEmailSet && !isEmailCaptured) {
                        setCookie('gtspopup', (Number(cookieNumTimes) + 1) + ';email;', 30);
                        openGTSPopup();
                    } else {
                        doGTS();
                    }
                } else {
                    openGTSPopup();
                }
            } else {
                if (isEmailSet || isEmailCaptured === 'email_done') {
                    if (!isInstatabInstalled) {
                        setCookie('gtspopup', '4;instatab;' + (isEmailCaptured || ''), 30);
                        openGTSPopup();
                    } else {
                        doGTS();
                    }
                } else {
                    openGTSPopup();
                }
            }
        } else {
            doGTS();
        }
    } else {
        if (isInstatabInstalled) {
            if (!isEmailSet) {
                setCookie('gtspopup', '1;email;', 30);
                openGTSPopup();
            } else {
                doGTS();
            }
        } else {
            openGTSPopup();
        }
    }

    return false;
    /* *************** */
    function openGTSPopup() {
        gtsURL ? _gPopStoreUrl = gtsURL : _gPopStoreUrl = null; // set the store url (used by openPopup())
        openPopup('https://www.mysmartprice.com/loyalty/popup/gts.php?gtsURL=' + encodeURIComponent(gtsURL), 'PromoB');
    }

    function doGTS() {
        window.open(gtsURL, '_blank');
    }
});


Modules.$doc.ready(function() {
    // Only email capture popup on GTS:
    $(document).on('click', '.js-gts-only-email-popup', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var $this = $(this),
            gtsURL = $this.data('url');
        gtsURL ? _gPopStoreUrl = gtsURL : _gPopStoreUrl = null; // set the store url (used by openPopup())

        $this.removeClass('js-instatab-popup js-prc-tbl__gts-btn');
        openPopup('https://www.mysmartprice.com/loyalty/popup/gts-only-email.php?gtsURL=' + encodeURIComponent(gtsURL));

        return false;
    });
});