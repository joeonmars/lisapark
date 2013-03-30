var header;
var introSection;
var introVideo;
var videoMinRatio = 1280/720;
var isIntroVideoPaused = false;
var isIntroReady = false;
var overlayId = null;

window.enableScroll = function() {
	$(document.body).removeClass('noScroll');
};

window.disableScroll = function() {
	$(document.body).addClass('noScroll');
};

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

    	// if an overlay is currently open, pause the video immediately from auto play
    	if($('.reveal-modal.xlarge.open').length > 0) {
    		post('pause');
    	}
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

// hash event handler
$(window).hashchange( function(){
  var hash = location.hash;
  
  var strs = hash.replace( /^#/, '' ).split('/');
  if(strs[0] === '') strs.splice(0,1);

  if(strs.length == 1 || strs.length == 2) {
  	var folioId = '#'+strs[0];
  	if($(folioId).length > 0 && $(folioId).hasClass('reveal-modal')) {
	  	// pause intro video if overlay opens
	  	if(!isIntroVideoPaused && isIntroReady) {
	  		post('pause');
	  	}
	  	$(folioId).reveal({
	  		open: function() {
	  			window.disableScroll();
	  			console.log('open ' + folioId);
	  			$(folioId).trigger({type:'overlayopen'});
	  		},
	  		opened: function() {
	  			$(folioId).trigger({type:'overlayopened'});
	  		},
	  		close: function() {
	  			window.enableScroll();
	  		}
	  	});
	  	// trigger page event
	  	if(strs.length == 2) {
	  		var pageId = parseInt(strs[1]) - 1;
	  		if($.isNumeric(pageId)) {
		  		$(folioId).trigger({
						type: "overlaypagechange",
						projectId: strs[0],
						pageId: pageId
					});
	  		}
	  	}
	  	return;
  	}
  }

  $('.close-reveal-modal').trigger('click');
});

// a global resize handler
$(window).smartresize(function() {
  // resize intro video section
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  var headerHeight = $(header).height();
  var introSectionHeight = (windowWidth/windowHeight >= videoMinRatio) ? (windowHeight - headerHeight) : (windowWidth / videoMinRatio);
  $(introSection).css('padding-top', headerHeight+'px');
  $(introSection).height(introSectionHeight);

  // resize current overlay
	$('#'+overlayId).trigger({type: 'overlayresize'});
});


$(window).scroll(function(e) {
	if(!isIntroVideoPaused && isIntroReady) {
		if($(window).scrollTop() > $(introSection).height()) {
			post('pause');
		}
	}
});


$(document).ready(function() {
	$('.flexslider').flexslider({
    animation: "slide",
    controlNav: "thumbnails"
  });

  $('.navigation').onePageNav({
		scrollChange: function(currentListItem) {
			$('.close-reveal-modal').trigger('click');
    }
  });
  
  // store dom references
  header = $('.header')[0];
  introSection = $('#intro');
  introVideo = $('#intro-video');

	$('.navigation li').localScroll({
		hash:true
	});

	$('.navigation').mobileMenu({
		defaultText: 'Navigation',
		className: 'select-menu',
		subMenuDash: '&ndash;'
	});

  // auto trigger resize when document is ready
  $(window).trigger('resize');

  // load portfolio json settings
  var loaderQueue = new createjs.LoadQueue(true);

  var onFileLoad = function(e) {
    var assetId = e.item.id;
    var assetResult = e.result;
    if(assetId === 'portfolio') {
    	createPortfolio(assetResult);
    	$(window).hashchange();
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

	for(i=0; i<l; ++i) {
		var portfolio = portfolios[i];
		var str = thumbnailTemplate.replace('{numcols}', 'three').replace(/{folioid}/g, portfolio['id']).replace('{title}', portfolio['title']).replace('{tag}', portfolio['tag']).replace('{category}', portfolio['category']).replace('{id}', i+1).replace('images/thumbnail/placeholder.jpg', portfolio['thumbnail']);
		var el = $(str);
		portfolioContainer.append(el);

		el.find('img').load(function() {
			portfolioContainer.isotope('reLayout');
		});
	}

	$(window).smartresize(function(){
	  portfolioContainer.isotope({
	    masonry: { columnWidth: portfolioContainer.width() / 4 }
	  });
	});

	portfolioContainer.isotope({
	  itemSelector : 'li',
	  layoutMode: 'masonry',
	  masonry: { columnWidth: portfolioContainer.width() / 4 }
	});

	$(".filter li").click(function(e){
		$(".filter li").removeClass("currents");
		$(e.currentTarget).addClass("currents");

		var dataFilter = $(e.currentTarget).attr('data-filter');
		if(dataFilter === '.all') dataFilter = 'li';

		portfolioContainer.isotope({
			filter: dataFilter
		});

		// Prevent the browser jump to the link anchor
		e.preventDefault();
	});

	$(".filter li:first-child").trigger('click');

	// create folio overlays
	var overlayContainer = $('#overlay-wrapper');
	var overlayTemplate = $('#overlay-template').html().toString();

	for(i=0; i<l; ++i) {
		var portfolio = portfolios[i];
		var imageUrl = portfolio['fullimage'];
		var videoId = portfolio['videoid'];
		var folioId = portfolio['id'];
		var hasMultipleImages = $.isArray(portfolio['fullimage']);
		var firstFullImageUrl = ((hasMultipleImages === true) ? portfolio['fullimage'][0] : portfolio['fullimage']);
		var str = overlayTemplate.replace('{folioid}', folioId).replace('{title}', portfolio['title']).replace('{description}', portfolio['description']).replace('{category}', portfolio['tag']).replace('{videoid}', portfolio['videoid'] || '').replace('images/project/placeholder.jpg', firstFullImageUrl || '');
		var el = $(str);
		overlayContainer.append(el);

		var infoUl = el.find('.portfolio-meta');
		var info = portfolio['info'];
		for(var key in info) {
			var val = info[key];
			if(val.substr(0, 7) === 'http://' || val.substr(0, 4) === 'www.') {
				val = '<a target="_blank" href="' + val + '">' + val + '</a>';
			}
			var li = $('<li><span>'+key+'</span><div class="meta-list">'+val+'</div></li>');
			infoUl.append(li);
		}

		// hide video or full image if either one does not exist
		if(!imageUrl) {
			$('#'+folioId+' .portfolioImage').hide();
		}
		if(!videoId) {
			$('#'+folioId+' .portfolioVideo').hide();
		}

		if(imageUrl) {
			(function() {
				// add click listener to image to zoom in/out
				var isEnlarged = false;
				var projectId = portfolio['id'];
				var img = $('#'+projectId+' .portfolioImage');
				img.click(function() {
					isEnlarged = !isEnlarged;
					if(isEnlarged === true) {
						img.addClass('enlarged');
					}else {
						img.removeClass('enlarged');
					}
				})
			})();
		}

		// hide nav arrows if does not have multiple full images
		var nav = el.find('.page-nav');
		if(!hasMultipleImages) {
			nav.hide();
		}

		(function() {
			var projectId = portfolio['id'];
			var imgSrcs = portfolio['fullimage'] || [''];
			var numImgs = imgSrcs ? imgSrcs.length : 0;
			var lArrow = nav.find('.lArrow');
			var rArrow = nav.find('.rArrow');
			var lPage = nav.find('.lPage');
			var rPage = nav.find('.rPage');
			var overlay = $('#'+projectId);
			var img = overlay.find('.portfolioImage');
			var imgIndex = -1;
			var timeoutId;
			var fakeImg = $('<img>');
			var sideColumn = overlay.find('.sideColumn');
			var portfolioContainer = overlay.find('.portfolio-fullimg');
			var portfolioContent = overlay.find('.portfolio-content');
			var video = overlay.find('.portfolioVideo');

			// onload of image
			fakeImg.load(function() {
				window.clearTimeout(timeoutId);
				timeoutId = window.setTimeout(function() {
					img.attr('src', fakeImg.attr('src')).removeClass('prev next');

					// show and vertical align arrows
					lArrow.show();
					rArrow.show();
					var actualImgHeight = img.width()/(img.width()/img.height());
					sideColumn.height(Math.min(parseInt(img.attr('data-max-height')), actualImgHeight));
				}, 500);
			});

			var toPage = function(pageId, dir) {
				window.clearTimeout(timeoutId);
				imgIndex = pageId;
				fakeImg.attr('src', imgSrcs[imgIndex]);
				var cPageId = imgIndex + 1;
				var lPageId = (cPageId - 1 <= 0) ? numImgs : (cPageId - 1);
				var	rPageId = (cPageId + 1 > numImgs) ? 1 : (cPageId + 1);
				lPage.html(lPageId + ' / ' + numImgs);
				rPage.html(rPageId + ' / ' + numImgs);
				if(dir === 'prev') {
					img.removeClass('next');
					img.addClass('prev');
				}else {
					img.removeClass('prev');
					img.addClass('next');
				}

				var lastPageId = (pageId - 1 < 0) ? numImgs : pageId - 1 + 1;
				var nextPageId = (pageId + 1 > numImgs-1) ? 1 : pageId + 1 + 1;
				lArrow.attr('href', '#/'+projectId+'/'+lastPageId);
				rArrow.attr('href', '#/'+projectId+'/'+nextPageId);
			};

			// listen for resize event
			overlay.on("overlayresize", function(e) {
				var videoWidth = Math.min(1040, portfolioContainer.width());
				video.attr('height', videoWidth / videoMinRatio + 'px');

				var windowHeight = $(window).height();

				var overlayMinHeight = windowHeight - $('.header').height();
				var portfolioImageHeight = overlayMinHeight - 100;
				img.css('max-height', portfolioImageHeight);
				img.attr('data-max-height', portfolioImageHeight);
				overlay.height(overlayMinHeight);
				portfolioContent.height(windowHeight - $('.header').height() - 20*2);

				// vertical align arrows
				var actualImgHeight = img.width()/(img.width()/img.height());
				sideColumn.height(Math.min(parseInt(img.attr('data-max-height')), actualImgHeight));

				console.log(projectId + " overlayresize");
			});

			// listen for open event
			overlay.on("overlayopen", function(e) {
				// hide arrows
				lArrow.hide();
				rArrow.hide();
				overlayId = projectId;

				// reload image
				if(imgIndex < 0) {
					toPage(0);
				}else {
					var src = fakeImg.attr('src');
					fakeImg.attr('src', '');
					fakeImg.attr('src', src);
				}

				console.log(projectId + " overlayopen");
			});

			// listen for opened event
			overlay.on("overlayopened", function(e) {
				console.log(projectId + " overlayopened");
			});

			// listen for overlay page event
			overlay.on("overlaypagechange", function(e) {
				console.log(projectId + ' overlaypagechange');

				if(e.pageId < 0 || e.pageId > (numImgs - 1) || e.pageId === imgIndex) {
					return false;
				}else {
					toPage(e.pageId, ((e.pageId < imgIndex) ? 'prev' : 'next'));
				}
			});

		})();
	};

	// add close event listeners
	$('.close-reveal-modal').click(function() {
		window.location.hash = '/';
	});
};