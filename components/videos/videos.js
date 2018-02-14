$(".list-best__vdo").on("click", function(e) {
    //Params to work with NC
    var videoUrl = $(this).data("video-id");
    //Params for Comp redesigned popup
    var offset_media_key = $(this).data("media_key");
    var offset_media_position = $(this).data("media_position");
    var mspid = $(this).closest(".list-best__item").data("mspid");
    var query = [
        'mspid=' + mspid,
        'offset_media_key=' + offset_media_key,
        'offset_position=' + offset_media_position,
        /*Params to work with old popup in NC*/
        'primaryThumb=' + $(".list-best__img").data("image"),
        'maxThumbs=' + 0,
        'thumbId=' + $(".list-best__img").data("thumb-id"),
        'videoUrl=' + videoUrl
    ].join("&");
    var images_popup = $(".list-best__vdo").data("href");
    openPopup("http://www.mysmartprice.com/mobile/" + images_popup + "?" + query);
});

/* Open video in popup on clicking thumbnail */
function loadVideoReviews() {
    var videosIdList      = [],
        videosInfoObj     = {},
        $allVideoElements = $('.js-yt-vdo'),
        $featuredVideo    = $('.js-yt-vdo__ftrd'),
        $otherVideosList  = $('.js-vdo-list');

    if($allVideoElements.length) {
        $allVideoElements.each(pushToVideosIdList);
        ajaxVideosAndUpdateUI();
    }

    /*****************/
    function pushToVideosIdList(idx, vdo)  {
        var id = $(vdo).data('yt-vdo-id');
        videosIdList.push(id);
    }
    function ajaxVideosAndUpdateUI() {
        $.ajax({
            url: 'https://www.googleapis.com/youtube/v3/videos',
            data: {
                part: 'snippet, contentDetails',
                id: videosIdList.join(),
                key: 'AIzaSyCJrzy0GTt2WfQF8jMVCfXHIhHIOLz2luQ'
            }
        }).done(function(response) {
            prepareVideosInfoObj(response);
            MakefeaturedVideo($featuredVideo);
            ListOtherVideos($otherVideosList);
        });
    }
    function prepareVideosInfoObj(response) {
        if(response && response.items) {
            response.items.forEach(function(item, idx) {
                var snippet        = item.snippet,
                    contentDetails = item.contentDetails;

                videosInfoObj[ videosIdList[idx] ] = {
                    id          : videosIdList[idx],
                    publishedAt : snippet.publishedAt,
                    thumbnails  : snippet.thumbnails,
                    title       : snippet.title,
                    duration    : contentDetails.duration
                };
            });
        }
    }
    function MakefeaturedVideo($featuredVideo) {
        if($featuredVideo.length) {
            var firstVideo  = videosInfoObj[ videosIdList[0] ],
                id          = $featuredVideo.data('yt-vdo-id'),
                $thumb      = $featuredVideo.find('.js-thumb'),
                $duration   = $featuredVideo.find('.js-duration'),
                $playButton = $featuredVideo.find('.js-play'),
                $title      = $featuredVideo.find('.js-title');

            if($thumb.length) {
                $thumb.attr('src', firstVideo.thumbnails.medium.url);
            }
            if($duration.length) {
                $duration.text(decodeDuration(firstVideo.duration));
            }
            if($title) {
                $title.text(firstVideo.title);
            }

            $thumb.on('click', loadIframe);
            $playButton.on('click', loadIframe);
        }

        /**************/
        function loadIframe(e) {
            var frameHTML = [
                '<iframe id="vdo-rvw__ftrd__plyr" type="text/html" width="426" height="240" ',
                'src="https://www.youtube.com/embed/' + firstVideo.id + '?autoplay=1" frameborder="0" allowfullscreen></iframe>'
            ].join('');
            $featuredVideo.html(frameHTML);
            return false;
        }
    }
    function ListOtherVideos($otherVideosList) {
        if($otherVideosList.length) {
            $otherVideosList.find('.js-yt-vdo').each(function(idx, vdo) {
                var videoId      = $(vdo).data('yt-vdo-id'),
                    $thumb       = $(vdo).find('.js-thumb'),
                    $duration    = $(vdo).find('.js-duration'),
                    $title       = $(vdo).find('.js-title'),
                    $date        = $(vdo).find('.js-date'),
                    videoDetails = videosInfoObj[videoId];

                if(videoDetails) {
                    $(vdo).data('videolink', 'https://www.youtube.com/embed/' + videoId + '?autoplay=1');
                    $thumb.attr('src', videoDetails.thumbnails.medium.url);
                    $duration.text(decodeDuration(videoDetails.duration));
                    $title.text(videoDetails.title);
                    $date.text(formatDate(videoDetails.publishedAt));
                }
                $(vdo).on('click', openVideo);
            });
        }

        /*****************/
        function openVideo(e) {
            var popupParams = {
                    mspid            : $('.prdct-dtl__ttl').data('mspid'),
                    offset_media_key : 'customerReviewVideos',
                    offset_position  : $('.js-yt-vdo').index(this),
                    offset_video     : $('.js-yt-vdo').index(this)
                };
            openPopup('/mobile/multiple_media_popup.php?' + $.param(popupParams));
            return false;
        }
    }
    function decodeDuration(duration) {
        // Duration format: "PTxxHxxMxxS".
        // xxH (or xH) and xxM (or xM) are included only hours and minutes exist.
        // xxS could also be just xS.
        if(duration) {
            var hours   = duration.match(/(\d+)H/) || '',
                minutes = duration.match(/(\d+)M/) || '',
                seconds = duration.match(/(\d+)S/) || '';

            if(hours) {
                hours = (hours[1].length === 1) ? ('0' + hours[1] + ':') : (hours[1] + ':');
            }
            if(minutes) {
                minutes = (minutes[1].length === 1) ? ('0' + minutes[1] + ':') : (minutes[1] + ':');
            }
            if(seconds) {
                seconds = (seconds[1].length === 1) ? ('0' + seconds[1]) : seconds[1];
            }

            return hours + minutes + seconds;
        } else {
            return '';
        }
    }
    function formatDate(dateString) {
        if(dateString) {
            try {
                var publishDate = new Date(dateString),
                    months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                return months[publishDate.getMonth()] + ' ' + publishDate.getDate() + ', ' + publishDate.getFullYear();
            } catch(e) {
                console.error('Error', e); // Log error but do not throw it (return empty string, fail silently)
                return '';
            }
        }
    }
}
/* End video review popup */

/* Lazy load video reviews section: */
(function lazyLoadVideoReviews() {
    var $videoReview = $('.vdo-rvw-sctn');
    if($videoReview.length) {
        Modules.lazyLoad.assign({
            "node": $videoReview,
            "callback": {
                "definition": loadVideoReviews,
                "context": this,
                "arguments": []
            }
        });
        Modules.lazyLoad.run();
    }
})();
/* End lazyload of video review section */