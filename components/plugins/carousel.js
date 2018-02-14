/**
 * jQuery mCycle v0.1
 * Carousel Plugin Script Begins Here
 */
;
(function($, window, document, undefined) {

    "use strict";

    // Defaults are below
    var defaults = {
        mCycleItem: 'img', // the item which will be slided
        animTime: 200, // time taken in animation in milliseconds
        waitTime: 10000, // time for a slide to wait in milliseconds
        isAutoPlay: false, //  isAutoPlay can be false for manual control
        direction: 'left', // direction can be 'left' of 'right'
        slideBullets: true, //show the slide bullets
        height: 'auto' //height of the mCycleCont (slide show container)
    };

    // The actual plugin constructor
    function mCycle(element, options) {
        this.element = element;

        // extending defaults with user options
        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = "mCycle";
        this._autoPlayQueued = false;
        this._animating = false;
        this.forcedNextSlide = -1;
        this.init(true);

    }

    // Get the next slide for the animation in the given direction
    function getNextSlide($currentSlide, direction) {
        var $nextSlide;
        switch (direction) {
            case "left":
                $nextSlide = $currentSlide.next('.mCycleItemWrapper');
                break;
            case "right":
                $nextSlide = $currentSlide.prev('.mCycleItemWrapper');
                break;
        }

        if ($nextSlide.length) return $nextSlide;

        switch (direction) {
            case "left":
                $nextSlide = $currentSlide.parent().find('.mCycleItemWrapper').first();
                break;
            case "right":
                $nextSlide = $currentSlide.parent().find('.mCycleItemWrapper').last();
                break;
        }

        return $nextSlide;
    }


    mCycle.prototype = {

        init: function(firstTime) {
            if (!firstTime) return;

            var $elem = $(this.element),
                mCycleItemCount = $elem.find(this.options.mCycleItem).length,
                elemHeight = 0;

            $elem.addClass('mCycleCont').find(this.options.mCycleItem).each(function(index) {
                var $mCycleItem = $(this);
                $mCycleItem.addClass('show mCycleItemWrapper').attr("data-count", index + 1);

                elemHeight = Math.max($mCycleItem.height(), elemHeight);


            });

            $elem.show();

            if (parseInt($elem.height(), 10) === 0 && this.options.height === 'auto') {
                $elem.height(elemHeight);
            } else if (this.options.height !== 'auto') {
                $elem.height(this.options.height);
            }


            $elem.find('.mCycleItemWrapper').eq(0).addClass('mCycleItemCurrent');

            if (this.options.slideBullets) {
                $elem.append('<div class="mCycleSlideBullets"></div>');
                var mCycleSlideBulletCount = mCycleItemCount;
                while (mCycleSlideBulletCount--) {
                    $elem.find('.mCycleSlideBullets').append('<div class="mCycleSlideBullet"></div>');
                }
                $elem.find('.mCycleSlideBullet').eq(0).addClass('active');
            }

            if (this.options.isAutoPlay && mCycleItemCount > 1) { // start sliding if it is autoplay 
                var that = this;

                that._autoPlayQueued = true;

                setTimeout((function() {
                    that._autoPlayQueued = false;
                    if (that.options.isAutoPlay) that.slide();
                }), that.options.waitTime);

            }
        },

        play: function() {
            if (this.options.isAutoPlay) return;
            this.options.isAutoPlay = true;
            this.slide();
        },

        pause: function() {
            this.options.isAutoPlay = false;
        },

        reverse: function() {
            this.options.direction = (this.options.direction === 'left') ? 'right' : 'left';
        },
        slideLeft: function() {
            this.slide('left');
        },
        slideRight: function() {
            this.slide('right');
        },
        slideTo: function(index) {
            var $slides = $(this.element),
                currentIndex = $slides.index($(this.element).hasClass("mCycleItemCurrent")),
                direction = (index > currentIndex) ? 'left' : 'right',
                isAutoPlay = this.options.isAutoPlay,
                that = this;
            this.pause();
            this.forcedNextSlide = index;
            $slides.eq(index).addClass("mCycleItemNext");
            setTimeout(function() {
                that.slide(direction);
                that.forcedNextSlide = -1;
                setTimeout(function() {
                    if (isAutoPlay) {
                        that.play();
                    }
                }, that.options.animTime + that.options.waitTime + 10);
            }, that.options.animTime + 10);
        },
        slide: function(direction) {

            if (this.options.isAutoPlay && this._autoPlayQueued || this._animating) return; // to stop multiple instance of slide when on autoplay

            direction = direction || this.options.direction;

            var $currentSlide = $(this.element).find('.mCycleItemCurrent'),
                $slides = $(this.element).find(".mCycleItemWrapper"),
                isForcedSlide = (this.forcedNextSlide === -1),
                $nextSlide = isForcedSlide ? getNextSlide($currentSlide, direction) : $slides.eq(this.forcedNextSlide),
                prevSlideLeftOffset,
                nextSlideClass;
            switch (direction) {
                case 'left':
                    nextSlideClass = 'mCycleItemNext';
                    prevSlideLeftOffset = '-100%';
                    break;
                case 'right':
                    nextSlideClass = 'mCycleItemPrev';
                    prevSlideLeftOffset = '100%';
                    break;
            }

            if ($nextSlide.hasClass('mCycleItemCurrent')) return; // if current slide is same as next slide


            $nextSlide.addClass(nextSlideClass);

            var that = this;

            this._animating = true;

            var reflow = $("body").offset().top;

            // making current slide the prev slide
            $currentSlide.css({
                '-webkit-transition': 'transform' + (that.options.animTime) / 1000 + 's',
                'transition': 'transform ' + (that.options.animTime) / 1000 + 's',
                '-webkit-transform': 'translateX(' + prevSlideLeftOffset + ')',
                '-ms-transform': 'translateX(' + prevSlideLeftOffset + ')',
                'transform': 'translateX(' + prevSlideLeftOffset + ')'
            });

            // making next slide the current slide
            $nextSlide.css({
                '-webkit-transition': 'transform ' + (that.options.animTime) / 1000 + 's',
                'transition': 'transform ' + (that.options.animTime) / 1000 + 's',
                '-webkit-transform': 'translateX(0)',
                '-ms-transform': 'translateX(0)',
                'transform': 'translateX(0)'
            });

            //IE Fix
            if (Modules.Browser.name === "MSIE" && Modules.Browser.version < 9) {
                $currentSlide.css({
                    'left': prevSlideLeftOffset
                });
                $nextSlide.css({
                    'left': '0'
                });
            }

            setTimeout(function() {
                var $elem = $(that.element);

                $currentSlide.removeClass('mCycleItemCurrent').removeAttr('style');
                $nextSlide.toggleClass(nextSlideClass + ' mCycleItemCurrent').removeAttr('style');

                //IE Fix
                if (Modules.Browser.name === "MSIE" && Modules.Browser.version < 9) {
                    $currentSlide.removeClass('mCycleItemCurrentIE').removeAttr('style');
                    $nextSlide.toggleClass(nextSlideClass + ' mCycleItemCurrentIE').removeAttr('style');
                }

                if (that.options.slideBullets) {
                    var count = $elem.find('.mCycleItemCurrent').data('count');

                    $elem.find('.mCycleSlideBullet.active').removeClass('active');
                    $elem.find('.mCycleSlideBullet').eq(count - 1).addClass('active');
                }

                that._animating = false;
                if (that.options.isAutoPlay) {
                    that._autoPlayQueued = true; // auto call for slide is queued if on autoplay
                    setTimeout((function() {
                        if (that.options.isAutoPlay && that._autoPlayQueued) {
                            that._autoPlayQueued = false;
                            that.slide();
                        } else {
                            that.options.isAutoPlay = false;
                            that._autoPlayQueued = false;
                        }
                    }), that.options.waitTime);
                }

            }, that.options.animTime + 10); //adding 10ms to make sure animation is complete
        }
    };

    $.fn["mCycle"] = function(options) {
        var params = Array.prototype.splice.call(arguments, 1, 1);
        return this.each(function() {
            if (!$.data(this, "mCycle")) {
                // preventing against multiple instantiations
                $.data(this, "mCycle", new mCycle(this, options));
            } else {
                var mCycleObj = $.data(this, "mCycle");
                // checking if option is a valid function name
                if (typeof options === "string" && mCycleObj[options]) {
                    mCycleObj[options].apply(mCycleObj, params);
                } else if (typeof options === "object") {
                    // if the option is object extending it with initalized object
                    mCycleObj.options = $.extend({}, mCycleObj.options, options);
                }
            }
        });
    };

})(jQuery, window, document);

// RUI:: added new carousel classes inside code
    $(".js-crsl-wdgt, .widget-carousel").each(function() {
        var slideTimeout,
            $this = $(this);

        if ($this.data("autoplay"))
            $this.mCycle({
                mCycleItem: ".crsl__item",
                isAutoPlay: true
            });
        else
            $this.mCycle({
                mCycleItem: ".crsl__item"
            });
        // Tracking impressions of carousels

        var url = $this.data("impression-url");
        if (url) {
            if (url.indexOf("[timestamp]") >= 0) {
                url = url.replace("[timestamp]", $.now);
            }
            $.ajax({
                "url": url
            });
        }

        //Check with Arun once
        //$.ajax({ url: 'https://d.adx.io/views?xb=35BWU1550&xd=7&xnw=xsync&xtg=Affiliate&xtm_source=MSP_HVS_Feb&xtm_campaign=HVS_Feb&xtm_content=smallBanner&rnd=' + jQuery.now() + '' });

        $this.on("mousever", ".crsl-wdgt__prvs-btn, .prev-button", function() {
            $this.mCycle("pause").mCycle("slideRight");
            resetSlideTimeout();
        });
        $this.on("click", ".crsl-wdgt__prvs-btn, .prev-button", function() {
            $this.mCycle("pause").mCycle("slideRight");
            resetSlideTimeout();
        });
        $this.on("click", ".crsl-wdgt__next-btn, .next-button", function() {
            $this.mCycle("pause").mCycle("slideLeft");
            resetSlideTimeout();
        });
        $this.on("click", ".mCycleSlideBullet", function() {
            $this.mCycle("slideTo", $(this).index());
        });

        function resetSlideTimeout() {
            clearTimeout(slideTimeout);
            slideTimeout = setTimeout(function() {
                $this.mCycle("play");
            }, 10000);
        }
    });