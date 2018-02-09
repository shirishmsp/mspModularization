/* Search Function/Feature */
Modules.$doc.on("submit", ".js-srch-wdgt__frm", function() {
    var srch_inpt = $(".js-hdr-srch").val();
    var search_type = '';
    if ($('.js-srch-wdgt__frm .search_type').val()) {
        search_type = $('.js-srch-wdgt__frm .search_type').val();
    }
    var typed_term = '';
    if ($('.js-srch-wdgt__frm .typed_term').val()) {
        typed_term = $('.js-srch-wdgt__frm .typed_term').val();
    }
    var srch_url = '/msp/search/search.php?search_type=' + search_type + '&typed_term=' + typed_term +
        '&s=' + srch_inpt + '#s=' + srch_inpt;
    $('.js-srch-wdgt__frm').attr('action', srch_url);
});


Modules.$doc.on("focus", ".srch-wdgt__fld", function() {
    $(this).autocomplete("search");
});
// autocomplete processing end here
