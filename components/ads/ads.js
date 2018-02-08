/* Decide whether to show or hide sidebar ads */
;
(function sidebarAdsHandler() {
    var sidebarAds = function(gptId) {
            return [
                /* '<div class="ad-sdbr__cls">&times;</div>', */
                '<div id="' + gptId + '" style="height:600px; width:120px;">',
                '<script> googletag.cmd.push(function() { googletag.display("' + gptId + '"); }); </script>',
                '</div>'
            ].join('');
        },
        sideFreeSpace = window.innerWidth - 1000,
        adWidth = 120,
        adMarginFromCenter = 500 + Math.max(10, Math.min(40, (sideFreeSpace / 2 - adWidth) / 2));

    if (!Modules.Cookie.get('hideSidebarAds')) {
        var $leftAd = $('.ad-sdbr--left'),
            $rightAd = $('.ad-sdbr--rght');
        $leftAd.append(sidebarAds($leftAd.data('id')));
        $rightAd.append(sidebarAds($rightAd.data('id')));
        $leftAd.css('margin-right', adMarginFromCenter + 'px');
        $rightAd.css('margin-left', adMarginFromCenter + 'px');
        $('.ad-sdbr__cls').on('click', function() {
            setCookie('hideSidebarAds', 1, 1);
            $('.ad-sdbr').remove();
        });
    }
})();