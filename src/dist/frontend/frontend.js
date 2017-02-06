/* mobile menu */
var navToggle = document.getElementById('nav-toggle');
var navCollapse = document.getElementsByClassName('navbar-collapse');

var toggleClass = function() {
    console.log('Open Menu.');
    navToggle.classList.toggle('open');
    navCollapse[0].classList.toggle('collapse');
};

navToggle.addEventListener('click', toggleClass, false);

/*
* video link on demo
* if mobile view go to YouTube rather than launch modal
* */
var videoLinkTag = document.getElementsByClassName('videoLink');
if (videoLinkTag[0]) {
	videoLinkTag[0].addEventListener('click', function() {
	    if (window.innerWidth <= 768) {
	        videoLinkTag[0].dataset.target = null
	        videoLinkTag[0].dataset.modal = null
	        videoLinkTag[0].dataset.toggle = null
	    }
	}, false);
}