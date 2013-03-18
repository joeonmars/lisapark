var header;
var introSection;

// a global resize handler
$(window).resize(function() {
  // resize intro video section
  var windowHeight = $(window).height();
  var headerHeight = $(header).height();
  var introSectionHeight = (windowHeight - headerHeight);
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