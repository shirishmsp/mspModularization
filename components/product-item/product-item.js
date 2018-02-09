/* RUI:: save product item button - start */
Modules.$doc.on('mousedown', '.js-save-btn', function() {
    var $this = $(this),
        mspid = $this.closest(".prdct-item").data("mspid") || $(".prdct-dtl__ttl").data("mspid");

    if (!mspid) {
        return false;
    }

    if (!$this.hasClass("prdct-item__save-btn--svd")) {
        loginCallback(saveProduct, this, [mspid, $this]);
    }

    return false;
});
/* RUI:: save product item button - start */