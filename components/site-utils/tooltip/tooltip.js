/* ************** 2. Actions/Events: ************** */

Modules.$doc.on('mouseenter', '.js-tltp', handleMouseEnter);
Modules.$doc.on('mouseleave', '.js-tltp', removeTooltip);

Modules.$doc.on("click", ".js-msg-box-trgt", showMessageBox);
Modules.$doc.on("click", ".js-msg-box__cls", hideMessageBox);

/* ************** 4. Functions: ************** */

function handleMouseEnter() {
    $('.tltp').remove();
    var $this = $(this),
        data = $this.data('tooltip'),
        tooltipDirection = $this.data('tooltip-direction') || "tltp--top-left";
    if (data === "" || data === undefined) return;
    $('body').append('<div class="tltp ' + tooltipDirection + '">' + data + '</div>');
    $tooltip = $('.tltp');

    if ($(this).data('tooltip').length > 50) {
        $tooltip.css({ 'font-size': '11px', 'line-height': '1.5' });
    }

    if (tooltipDirection === "tltp--top-rght") {
        $tooltip.css('left', $this.offset().left - $tooltip.outerWidth() + $(this).outerWidth() + 4);
        $tooltip.css('top', $this.offset().top - $tooltip.outerHeight() - 10);
        if ($tooltip.offset().top - Modules.$win.scrollTop() < 0) {
            $tooltip.removeClass(tooltipDirection).addClass('tltp--btm-rght');
            $tooltip.css('top', $this.outerHeight() + $this.offset().top + 10);
        }
    } else if (tooltipDirection === "tltp--top-left") {
        $tooltip.css('left', $this.offset().left - 4);
        $tooltip.css('top', $this.offset().top - $tooltip.outerHeight() - 10);
        if ($tooltip.offset().top - Modules.$win.scrollTop() < 0) {
            $tooltip.removeClass(tooltipDirection).addClass('tltp--btm-left');
            $tooltip.css('top', $this.outerHeight() + $this.offset().top + 10);
        }
    } else if (tooltipDirection === "tltp--btm-rght") {
        $tooltip.css('left', $this.offset().left - $tooltip.outerWidth() + $(this).outerWidth() + 4);
        $tooltip.css('top', $this.offset().top + $this.outerHeight() + 10);
        if (Modules.$win.scrollTop() + Modules.$win.height() - $tooltip.offset().top < 0) {
            $tooltip.removeClass(tooltipDirection).addClass('tltp--btm-rght');
            $tooltip.css('top', $this.offset().top - $tooltip.outerHeight() - 10);
        }
    } else if (tooltipDirection === "tltp--btm-left") {
        $tooltip.css('left', $this.offset().left - 4);
        $tooltip.css('top', $this.offset().top + $this.outerHeight() + 10);
        if (Modules.$win.scrollTop() + Modules.$win.height() - $tooltip.offset().top < 0) {
            $tooltip.removeClass(tooltipDirection).addClass('tltp--btm-left');
            $tooltip.css('top', $this.offset().top - $tooltip.outerHeight() - 10);
        }
    } else if (tooltipDirection === "tltp--left") {
        $tooltip.css('left', $this.offset().left - $tooltip.width() - 30);
        $tooltip.css('top', $this.offset().top + $this.outerHeight() / 2 - 10);
    }
}

function removeTooltip() {
    $('.tltp').remove();
}

function showMessageBox(e) {
    if ($(e.target).hasClass("js-msg-box__cls")) return false;

    $(".msg-box").removeClass("msg-box--show");
    $(this).find(".msg-box").addClass("msg-box--show");
}

function hideMessageBox() {
    $(this).closest(".msg-box").removeClass("msg-box--show");
    return false;
}