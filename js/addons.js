var header;
var introSection;
var videoMinRatio = 1024/768;

// a global resize handler
$(window).resize(function() {
  // resize intro video section
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  var headerHeight = $(header).height();
  var introSectionHeight = (windowWidth/windowHeight >= videoMinRatio) ? (windowHeight - headerHeight) : (windowWidth / videoMinRatio);
  $(introSection).css('padding-top', headerHeight+'px');
  $(introSection).height(introSectionHeight);
});


$(document).ready(function() {
  // store dom references
  header = $('.header')[0];
  introSection = $('#intro');

  // auto trigger resize when document is ready
  $(window).trigger('resize');
});