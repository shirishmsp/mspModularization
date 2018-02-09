// expert review page gallery js
Modules.$doc.on("click", "#exprt-rvw__prvw .exprt-rvw__glry-img", function(e) {
  if(!$(this).parent().hasClass("exprt-rvw__glry-thmbnl")) {
    return;
  }
  var $imageGalleryThumbnail = $(this).closest(".exprt-rvw__glry-thmbnl"),
    imageLeftCoordinate = $(this).offset().left,
    imageRightCoordinate = $(this).width() + imageLeftCoordinate,
    firstImageLeftCoordinate = $imageGalleryThumbnail.find(".exprt-rvw__glry-img:first").offset().left,
    parentLeftCoordinate = $imageGalleryThumbnail.offset().left,
    parentWidth = $imageGalleryThumbnail.width() + 15,
    imageGallery = $(this).closest(".exprt-rvw__glry");

  $(imageGallery).find(".exprt-rvw__glry-img-active").removeClass("exprt-rvw__glry-img-active");
  $(this).addClass("exprt-rvw__glry-img-active");
  $(imageGallery).find(".exprt-rvw__glry-main-img").attr("src", $(this).data("image-src"))

    $(imageGallery).find(".exprt-rvw__glry-cntr").html(($(this).data("image-index") + 1) + " of " + ($(imageGallery).find("img").length - 1));
    $(imageGallery).find(".exprt-rvw__glry-main-img").data("href", "/mobile/review_image_popup.php?image_url=" + encodeURIComponent($(this).data("image-src")));
    $(imageGallery).find(".exprt-rvw__glry-main-img").data("image-index", $(this).data("image-index"));

  // scroll image if not visible
  if (imageRightCoordinate > parentLeftCoordinate + parentWidth) {
    $imageGalleryThumbnail.animate({
      scrollLeft: imageRightCoordinate - (firstImageLeftCoordinate + parentWidth) + 40
    }, "fast");
  }
  else if (imageLeftCoordinate < parentLeftCoordinate) {
    $imageGalleryThumbnail.animate({
      scrollLeft: firstImageLeftCoordinate - imageLeftCoordinate
    }, "fast");
  }
});

// expert review page gallery js
Modules.$doc.on("click", "#exprt-rvw__prvw .zoom-viewer__arrow", function(e) {
    var imageGallery = $(this).closest(".exprt-rvw__glry"),
      currentImageIndex = $(imageGallery).find(".exprt-rvw__glry-main-img").data("image-index"),
      newImageElement = null;

    currentImageIndex = currentImageIndex !== undefined ? parseInt(currentImageIndex, 10) : 0;

    currentImageIndex = $(this).hasClass("zoom-viewer__arrow--prev") ? currentImageIndex - 1 : currentImageIndex + 1;

    if(currentImageIndex > $(imageGallery).find("img").length - 2)
      currentImageIndex = 0;

    if(currentImageIndex < 0)
      currentImageIndex = $(imageGallery).find("img").length - 2;

    newImageElement = $(imageGallery).find(".exprt-rvw__glry-img[data-image-index='"+ currentImageIndex +"']");
    $(newImageElement).click();
  });

//Show video on click of thumbnail - Start
$(".exprt-rvw__vid-play").on("click", function(e) {
    var $playNode = $(this);
    $imageNode = $playNode.siblings(".exprt-rvw__vid-img"),
        $container = $playNode.parent(),
        height = $container.height(),
        width = $container.width(),
        videoId = $imageNode.data("video-id");

    $imageNode.remove();
    $playNode.remove();
    $container.append('<iframe class="exprt-rvw__vid-iframe" width="' + width + '" height="' + height + '" src="//www.youtube.com/embed/' + videoId + '?rel=0&autoplay=1" frameborder="0" allowfullscreen></iframe>');
});
//Show video on click of thumbnail - End