$(document).on('change', '.fltr-val__inpt', function() {
  var group = $(this).parents('.fltr').data('groupname');
  var label = $(this).next('.fltr-val__text').children('.fltr-val__lbl').text().trim();
  
  if(window.ga) {
      ga('send', 'event', 'listpage_filters', group, label);
  }

  //Hide SEO Text
  $(".list-main__ttl, .list-info__dscrptn, .list-info__link-wrpr").hide();
});

// search in filter groups.
$(".fltr-wrpr1").on("keyup", ".fltr-srch__fld", function() {
    var filterSearchQuery = $.trim($(this).val()),
        $filterGroup = $(this).closest(".fltr");
    if (filterSearchQuery === "") {
        $filterGroup.find(".fltr-val").show();
        $filterGroup.find(".fltr-srch__icon--srch").removeClass("fltr-srch__icon--hide");
        $filterGroup.find(".fltr-srch__icon--cler").addClass("fltr-srch__icon--hide");
        $filterGroup.find(".nano").nanoScroller();
    } else {
        $filterGroup.find(".fltr-val").hide();
        $filterGroup.find(".fltr-srch__icon--srch").addClass("fltr-srch__icon--hide");
        $filterGroup.find(".fltr-srch__icon--cler").removeClass("fltr-srch__icon--hide");
        $filterGroup.find(".fltr-val").filter(function() {
            var itemText = $.trim($(this).text()).toLowerCase(),
                index = itemText.indexOf(filterSearchQuery),
                result = false;
            if (index === 0) {
                result = true;
            } else if (index > 0) {
                if (itemText.toLowerCase().charAt(index - 1) === " ") {
                    result = true;
                }
            }
            return result;
        }).show();
        $filterGroup.find(".nano").nanoScroller();
    }
});

// clear search in filterGroups
$(".fltr-wrpr1").on("click", ".js-fltr-srch__cler", function() {
    var $filterGroup = $(this).closest(".fltr");
    $filterGroup.find(".fltr-srch__fld").val("");
    $filterGroup.find(".fltr-srch__icon").toggleClass("fltr-srch__icon--hide");
    $filterGroup.find(".fltr-val").show();
    $filterGroup.find(".nano").nanoScroller();
});

;(function goToFilterOnScroll() {
    var $listMain = $('.list-main'),
        $filter = $('.fltr-wrpr1'),
        $win = $(window);
    if($listMain.length) {
        $listMain.append([
            '<span class="btn btn--s show-fltr js-show-fltr js-inpg-link" data-href="list-filter">',
                'Show Filters',
            '</span>'].join(''));
        $filter.attr('data-id', 'list-filter');

        window.onscroll = function(e) {
            var $showFilter = $('.js-show-fltr'),
                filterBottom = $filter.offset().top + $filter.outerHeight(),
                additionalSpace = $win.height();
                scrolledBottom = $win.scrollTop() + $win.height(),
                listMainBottom = $listMain.offset().top + $listMain.outerHeight();

            if (scrolledBottom <= filterBottom + additionalSpace) {
                if($showFilter.filter(':visible').length) {
                    $showFilter.hide(0);
                }
            } else {
                $showFilter.show(0);
                if (scrolledBottom > listMainBottom) {
                    $showFilter
                        .removeClass('fixed')
                            .addClass('abslt');
                } else {
                    $showFilter
                        .removeClass('abslt')
                            .addClass('fixed')
                                .css('left', $filter.offset().left + 'px');
                }
            }
        };
    }
})();

// if category is mobile then first show mobile list and then show applied filters list.
if ($("#mobilefilterwrapper").length) {
    $.ajax({
        url: "/msp/prop_filters/mobile-new.html"
    }).done(function(response) {
        var data = response.split("//&//#");
        $("#mobilefilterwrapper").html(data[0]);
        ListPage.controller.init();
    });
} else {
    ListPage.controller.init();
}