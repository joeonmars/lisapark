
$(document).ready(function(){

$('.navigation li').localScroll();

$('.navigation').mobileMenu({
	defaultText: 'Navigation',
	className: 'select-menu',
	subMenuDash: '&ndash;'
});

});