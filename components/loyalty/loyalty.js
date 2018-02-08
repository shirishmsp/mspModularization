function loyaltyCounter() {
    var count = numberWithoutCommas($(".js-lylty-cnt").html());
    var newCount = count + 1;

    var interval = setInterval(function() {

        $(".js-lylty-cnt").html(numberWithCommas(newCount));
        newCount++;

        if (newCount > count + 10) {
            clearInterval(interval);
        }
    }, 300);
}

var loyalty_counter = false;
if ($(".ftr__lylty").has(".js-lylty-cnt").length) {
    $(window).scroll(function() {
        var footer_offset = $(".ftr__lylty").offset().top,
            footer_height = $(".ftr__lylty").outerHeight(),
            window_height = $(window).height(),
            scrolled = $(this).scrollTop();
        if ($(".js-lylty-cnt").length > 0) {
            if ((scrolled + window_height) > (footer_offset + footer_height) && !loyalty_counter) {
                loyaltyCounter();
                loyalty_counter = true;
            }
        }
    });
}