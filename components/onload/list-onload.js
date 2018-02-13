; (function askQuestion() {		
   var subCat = $('.body-wrpr').data('category'),
        $listAskQuestion;		
    $('body').append([		
        '<div class="js-list-ask-qstn list-ask-qstn popup-target" data-href="/review/qna/popup/ask_a_question.php?source=desktop_list&subcategory=' + subCat + '">',		
                '<span class="list-ask-qstn__icon">',
                    '<span class="list-ask-qstn__qstn-mrk">&#63;</span>',
                '</span> Ask a question',		
        '</div>'].join('')		
    );
    $listAskQuestion = $('.js-list-ask-qstn');
    setTimeout(function() {
        $listAskQuestion.addClass('slide-up');
    }, 2000);
})();


;(function() {
    $.QueryString = (function(a) {
        if (a === "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split("=");
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split("&"));

    // Add a cookie if utm_source is available
    if ($.QueryString["utm_source"]) {
        setCookie("utm_source", $.QueryString["utm_source"], 2);
    }
}());

;(function() {
    if(!Modules.isInstalled('plugin_id')) {
        if($('.body-wrpr[data-category=computer-pendrive]').length === 1) {
            var _html = ['<div class="sctn chrme-acqstn" style="background: #fff url(//assets.mspcdn.net/msp-ui/icons/chrome-ext.png) no-repeat 12px center/32px;">',
                            '<div class="sctn__inr">',
                                '<b style="padding-left: 20px;">Chrome Exclusive</b>&nbsp; ',
                                'Install MySmartPrice Chrome Extension &amp; get 25% cashback on any purchase ',
                                '<button style="float: right;" class="btn btn--s btn--blue js-extension-popup">Get Offer</button>',
                            '</div>',
                        '</div>'].join('');
            $(_html).insertAfter('.list-hdr');
            
            window.ga && ga('send', 'event', 'Deals', 'list-page-show', 'js-log-list-page', { nonInteraction: true });
            
            $(document).on('click', '.js-extension-popup', function() {
                window.ga && ga('send', 'event', 'Deals', 'list-page-click', 'js-log-list-page', { nonInteraction: true });
                openPopup('/deals/popup/add-chrome-overlay.html');
            });
        }
    }
}());
