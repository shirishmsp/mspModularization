(function lazyLoadPriceGraph() {
    var $priceGraph = $("[data-id='price-history']");
    if ($priceGraph.length) {
        var offsetTop = $priceGraph.offset().top;
        Modules.$win.on("scroll.lazyGraph", MSP.utils.throttle(function () {
            if (Modules.$win.scrollTop() + window.innerHeight > offsetTop) {
                Modules.$win.off("scroll.lazyGraph");
                $.ajax({
                    "url": "/msp/processes/property/ui-factory/msp_generate_pricegraph.php",
                    "data": {
                        "mspid": $(".prdct-dtl__ttl").data("mspid")
                    }
                }).done(function(graphHtml) {
                    $priceGraph.replaceWith(graphHtml);
                });
            }
        }, 250));
    }
})();

if ($(".prc-grph").length) {
    MSP.utils.lazyLoad.assign({
        "node": $(".prc-grph"),
        "isStatic": true,
        "callback": {
            "definition": function() {
                if ($(".prc-grph__not-sprtd").length) {
                    $(".prc-grph__not-sprtd").show();
                    $(".prc-grph__ldr").hide();
                    return;
                }

                $("head").append('<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.css">');

                $.getScript("https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.6/d3.min.js", function() {
                    $.getScript("https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.10/c3.min.js", function() {
                        $.getScript("assets/js/priceGraph.js", function() {
                            $(".prc-grph__rght-chrt").show();
                            $(".prc-grph__btn-wrpr").show();
                            $(".prc-grph__ldr").hide();
                        });
                    });
                });
            },
            "context": window,
            "arguments": []
        }
    }).run();
}
