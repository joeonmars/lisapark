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

  // load portfolio json settings
  var loaderQueue = new createjs.LoadQueue(true);

  var onFileLoad = function(e) {
    var assetId = e.item.id;
    var assetResult = e.result;
    if(assetId === 'portfolio') {
    	createPortfolio(assetResult);
    }
  };

  loaderQueue.addEventListener("fileload", onFileLoad);

	var manifest = [
		{'id':'portfolio', 'src':'json/portfolio.json'}
	];

  loaderQueue.loadManifest(manifest);
});


function createPortfolio(assetResult) {
	var portfolios = assetResult['portfolio'];
	var i;
	var l = portfolios.length;
	var thumbnailTemplate = $('#thumbnail-template').html().toString();

	var portfolioContainer = $('.portfolio');

	var cols = [
		'six', 'three', 'three',
		'three', 'three', 'three', 'three',
		'three', 'six', 'three'
	];

	for(i=0; i<l; ++i) {
		var portfolio = portfolios[i];
		var str = thumbnailTemplate.replace('{numcols}', cols[i%cols.length]).replace('{title}', portfolio['title']).replace('{tag}', portfolio['tag']).replace('{category}', portfolio['category']).replace('{id}', i+1).replace('images/thumbnail/placeholder.jpg', portfolio['thumbnail']);
		var el = $(str);
		$(portfolioContainer).append(el);
	}

	// Clone portfolio items to get a second collection for Quicksand plugin
	var $portfolioClone = $(".portfolio").clone();
	
	// Attempt to call Quicksand on every click event handler
	$(".filter a").click(function(e){
		
		$(".filter li").removeClass("currents");
		
		// Get the class attribute value of the clicked link
		var $filterClass = $(this).parent().attr("class");

		if ( $filterClass == "all" ) {
			var $filteredPortfolio = $portfolioClone.find("li");
		} else {
			var $filteredPortfolio = $portfolioClone.find("li[data-type~=" + $filterClass + "]");
		}
		
		// Call quicksand
		$(".portfolio").quicksand( $filteredPortfolio, { 
			duration: 800, 
			easing: 'easeInOutQuad' 
		}, function(){
			
		});


		$(this).parent().addClass("currents");

		// Prevent the browser jump to the link anchor
		e.preventDefault();
	});
};