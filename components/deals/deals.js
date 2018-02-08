$doc.ready(function() {
    $(".js-shr-dl").on("click", function() {
        var tltp = $(".prdct-dtl__tlbr-shr-tltp");
        tltp.toggleClass("hide");
    });
});

//Capturing Email for newletter (from eight sidebar widger)
$('.cptr-eml-card__btn').click(function() {
    if (!$(this).hasClass('btn--red')) {
        return false;
    };
    var $emailbox = $(this).closest('.cptr-eml-card__frm');
    var email = $emailbox.find('.cptr-eml-card__inpt').val();
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) {
        alert("Please enter a valid Email ID.");
        return false;
    }
    var url;
    if ($('.algn-wrpr__dls').length || $(".prdct-dtl--deal").length) {
        url = '/deals/save_email.php';
    } else {
        url = 'http://www.mysmartprice.com/fashion/promotion/capture_email';
    }
    var page_url = window.location.href;
    $.ajax({
        'url': url,
        'type': 'POST',
        'data': {
            "email": email,
            "page_url": page_url,
            "type": 'sidebar'
        },
    }).done(function(response) {
        // if (response.data == "SUCCESS") {
        $emailbox.find('.cptr-eml-card__inpt-wrpr').hide();
        $emailbox.find('.cptr-eml-card__msg').hide();
        $emailbox.find('.cptr-eml-card__alt-msg.sccss-msg').show();
        $emailbox.find('.btn--red').html('Subscribed');
        $emailbox.find('.btn--red').removeClass('btn--red');

        if ($emailbox.parents().hasClass("prdct-dtl__deal-sbscrb")) {
            $emailbox.html("");
            $(".prdct-dtl__deal-sbscrb__lbl").html("Email Subscribed Successfully!");

        }

    }).fail(function(response) {
        $emailbox.find('.cptr-eml-card__inpt-wrpr').hide();
        $emailbox.find('.cptr-eml-card__msg').hide();
        $emailbox.find('.cptr-eml-card__alt-msg.err-msg').show();
        $emailbox.find('.btn--red').html('Not Subscribed');
        $emailbox.find('.btn--red').removeClass('btn--red');
    });
    return false;
});