/* meet the team section */
window.onscroll = function() {
	var scrollTop = window.pageYOffset;  
	// start fading opacity 300px from top
	var offsetStart = 300;
	
	var imageClass1 = document.querySelector(".teamWrapper-mulitplyEffect-1");  
	var imageClass2 = document.querySelector(".teamWrapper-mulitplyEffect-2"); 
	var imageClass3 = document.querySelector(".teamWrapper-mulitplyEffect-3");

	var viewportOffset = imageClass1.getBoundingClientRect();
	// these are relative to the viewport
	var imageTop = viewportOffset.top;
	// Math min returns the smallest of zero or more numbers
	// start opacity at 0.95
	var opacity = (Math.min((imageTop - scrollTop) / offsetStart, 0.95));
	imageClass1.style.opacity = opacity;
	imageClass2.style.opacity = opacity;
	imageClass3.style.opacity = opacity;
};