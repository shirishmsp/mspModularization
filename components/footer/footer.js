// New footer setup and event handlers:
(function initFooter() {
    var footerEmailInput = $('.js-ftr-eml-inpt'),
        footerEmailSubmit = $('.ftr__lylty__eml-wrpr-sbmt');

    /* Opens Login Popup: To be called only when user is logged out (or partial login) */
    function footerLogin($this) {
        var _email = $this.val();
        if (!MSP.utils.validate.email(_email)) {
            alert('Please enter a valid email address');
        } else {
            var partiallyLoggedIn = getCookie('partial_login');
            if (!partiallyLoggedIn) {
                popupDataObj = {
                    type: "signup"
                };
            }
            // Set Email Cookie to prefill input on popup:
            setCookie('msp_login_email', _email);
            openPopup('/users/login.html');
        }
    }

    if (footerEmailInput.length) {
        var savedEmail = getCookie('msp_login_email'),
            loggedIn = getCookie('msp_login');

        if (loggedIn) { // Show different message if logged in
            var $ftrLoyaltyInfoHead = $('.js-lylty-info-hdr'),
                $ftrLoyaltyInfoSteps = $('.js-lylty-info-stps'),
                $ftrLoyaltyEmailWrapper = $('.js-ftr-eml-wrpr'),
                $ftrLoyaltyStatsWrapper = $('.js-ftr-stats-wrpr');

            $ftrLoyaltyInfoHead.html('Congratulations! You\'re already a Cashback Program member.');
            $ftrLoyaltyInfoSteps.html([
                'Shop &rarr; Earn Cashback &rarr; Transfer to your Bank A/c ',
                '<span class="ftr__lylty__txt-link js-open-link" data-open-link="/cashback/more-details/?ref=desktop_footer">Know more.</span>'
            ].join(''));
            $ftrLoyaltyEmailWrapper.hide();
            $ftrLoyaltyStatsWrapper.replaceWith([
                '<div data-href="/users/login.html" class=" bttn bttn--scndry ftr__lylty__view-cshbk js-lylty-login js-open-link" data-open-link="/loyalty/">',
                'View your cashback',
                '</div>'
            ].join(''));
        } else {
            if (savedEmail) footerEmailInput.val(savedEmail);

            // Event Handlers:
            footerEmailInput.on('keyup', function(e) {
                if (e.keyCode === 13) { // "Enter" key's code is 13
                    footerLogin(footerEmailInput);
                }
                return false;
            });
            footerEmailSubmit.on('click', function() {
                footerLogin(footerEmailInput);
                return false;
            });
        }
    }
})();