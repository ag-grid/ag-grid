(function(){

	/* mobile menu */
	var navToggle = document.getElementById('nav-toggle');
	var navCollapse = document.getElementsByClassName('navbar-collapse');

	var toggleClass = function() {
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
		    } else {
				document.getElementById("videoIframe").src = "https://www.youtube.com/v/tsuhoLiSWmU";
		    }
		}, false);
	}

	var videoCloseTag = document.getElementsByClassName('videoClose');
	if (videoCloseTag[0]) {
		videoCloseTag[0].addEventListener('click', function() {
			document.getElementById("videoIframe").src = "";
		}, false);
	}	

})();