var header;
var introSection;
var introVideo;
var videoMinRatio = 1024/768;
var isIntroVideoPaused = false;
var isIntroReady = false;

// Helper function for sending a message to the vimeo player
function post(action, value) {
  var data = { method: action };
  
  if (value) {
  	data.value = value;
  }
  
  var url = introVideo.attr('src').split('?')[0];

  introVideo[0].contentWindow.postMessage(JSON.stringify(data), url);
};


// Handle messages received from the player
function onMessageReceived(e) {
  var data = JSON.parse(e.data);
  
  switch (data.event) {
    case 'ready':
    	//console.log('VIMEO READY!');
    	this.isIntroReady = true;
    	post('addEventListener', 'play');
    	post('addEventListener', 'pause');
    	post('addEventListener', 'finish');
    	break;

    case 'play':
    	//console.log('VIMEO PLAY!');
    	isIntroVideoPaused = false;
      break;
       
    case 'pause':
    	//console.log('VIMEO PAUSE!');
    	isIntroVideoPaused = true;
    	break;

    case 'finish':
    	//console.log('VIMEO FINISH!');
      isIntroVideoPaused = true;
      break;
  }
}

// Listen for messages from the intro vimeo player
if (window.addEventListener){
	window.addEventListener('message', onMessageReceived, false);
}else {
	window.attachEvent('onmessage', onMessageReceived, false);
}


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


$(window).scroll(function(e) {
	if(!isIntroVideoPaused && isIntroReady) {
		if($(window).scrollTop() > $(introSection).height()) {
			post('pause');
		}
	}
});


$(document).ready(function() {
  // store dom references
  header = $('.header')[0];
  introSection = $('#intro');
  introVideo = $('#intro-video');

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
	// create thumbnails
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
		var str = thumbnailTemplate.replace('{numcols}', 'three'/*cols[i%cols.length]*/).replace('{folioid}', i+1).replace('{title}', portfolio['title']).replace('{tag}', portfolio['tag']).replace('{category}', portfolio['category']).replace('{id}', i+1).replace('images/thumbnail/placeholder.jpg', portfolio['thumbnail']);
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

	// create folio overlays
	var overlayContainer = $('#overlay-wrapper');
	var overlayTemplate = $('#overlay-template').html().toString();

	for(i=0; i<l; ++i) {
		var portfolio = portfolios[i];
		var imageUrl = portfolio['fullimage'];
		var videoId = portfolio['videoid'];
		var str = overlayTemplate.replace('{folioid}', i+1).replace('{title}', portfolio['title']).replace('{description}', portfolio['description']).replace('{date}', portfolio['date']).replace('{clientname}', portfolio['clientname']).replace('{skills}', portfolio['skills']).replace('{category}', portfolio['category']).replace(/{clienturl}/g, portfolio['clienturl']).replace('{videoid}', portfolio['videoid'] || '').replace('images/project/placeholder.jpg', portfolio['fullimage'] || '');
		var el = $(str);
		$(overlayContainer).append(el);

		if(!imageUrl) {
			$('#folio'+(i+1)+' .portfolioImage').hide();
		}
		if(!videoId) {
			$('#folio'+(i+1)+' .portfolioVideo').hide();
		}
	}

	// resize the videos in iframe
	var video = $('.portfolioVideo');
	var overlay = $('.reveal-modal');
	$(window).resize(function() {
		var videoWidth = Math.min(1040, overlay.width());
		video.attr('height', videoWidth / (16/9) + 'px');

		overlay.css('min-height', $(window).height() - $('.header').height());
	});
};