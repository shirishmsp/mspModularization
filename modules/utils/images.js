/* ************ 0. Other Module Imports ************ */

import { $doc } from './basic.js';
import * as Performance from './performance.js';

/* ************** 1. Classes/Objects/Variables: ************** */

const lazyDataAttr = 'lazy-src';
const lazyBgDataAttr = 'lazy-bg';

/* ************** 2. Actions/Events: ************** */

// AUTOMATICALLY Lazy Load Images on page load:
lazyLoadImages();
lazyLoadBgImages();

$doc.ajaxComplete(lazyLoadAjaxedImages); 

/* ************** 3. Exports: ************** */

export { }

/* ************** 4. Functions: ************** */

function lazyLoadImages() {
    // Lazy-load images
    $(`img[data-${lazyDataAttr}]`).each(function() {
        var $lazyImage = $(this);
        Performance.lazyLoad.assign({
            "node": $lazyImage,
            "callback": {
                "definition": function($image) {
                    $image.attr("src", $image.data(lazyDataAttr)).removeAttr(`data-${lazyDataAttr}`);
                },
                "context": this,
                "arguments": [$lazyImage]
            }
        });
    });
    Performance.lazyLoad.run();
}

function lazyLoadBgImages() {
    // Lazy-load background images
    $(`.js-${lazyBgDataAttr}`).each(function() {
        var $lazyImage = $(this);
        Performance.lazyLoad.assign({
            "node": $lazyImage,
            "callback": {
                "definition": function($image) {
                    $image.removeClass(`js-${lazyBgDataAttr}`);
                },
                "context": this,
                "arguments": [$lazyImage]
            }
        });
    });
    Performance.lazyLoad.run();
}

function lazyLoadAjaxedImages(event, xhr, settings) {
    /* Call lazy load images function for all the images got via ajax, to be lazy loaded. */
    lazyLoadImages();
    lazyLoadBgImages();
}