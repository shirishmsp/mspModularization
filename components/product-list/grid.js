var ProductList = {
    "initGrid": function() {
        if(ListPage.model.clipboard.pageType==="nc-filter"){
            return;
        }
        if (localStorage.getItem("gridType") === "large") {
            this.setGridType("large");
        } else if (localStorage.getItem("gridType") === "small") {
            this.setGridType("small");
        }
        Modules.$doc.on("click", ".js-list-hdr-view", function() {
            if ($(this).hasClass("list-hdr-view__prdct-l")) {
                ProductList.setGridType("large");
            } else {
                ProductList.setGridType("small");
            }
        });
    },
    "setGridType": function(type) {
        $(".list-hdr-view__prdct-l").removeClass("list-hdr-view__prdct-l--slctd");
        $(".list-hdr-view__prdct-s").removeClass("list-hdr-view__prdct-s--slctd");

        if (type === "large") {
            $(".prdct-grid").addClass("prdct-grid--prdct-l");
            $(".prdct-grid").removeClass("prdct-grid--prdct-s");
            $(".list-hdr-view__prdct-l").addClass("list-hdr-view__prdct-l--slctd");
            localStorage.setItem("gridType", "large");
        } else {
            $(".prdct-grid").addClass("prdct-grid--prdct-s");
            $(".prdct-grid").removeClass("prdct-grid--prdct-l");
            $(".list-hdr-view__prdct-s").addClass("list-hdr-view__prdct-s--slctd");
            localStorage.setItem("gridType", "small");
        }
    }
};

ProductList.initGrid();