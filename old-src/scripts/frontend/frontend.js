(function(){

	/* mobile menu */
	var navToggle = document.getElementById('nav-toggle');
	var navCollapse = document.getElementsByClassName('navbar-collapse');

	var toggleClass = function() {
	    navToggle.classList.toggle('open');
	    navCollapse[0].classList.toggle('collapse');
	};

    if (navToggle) {
        navToggle.addEventListener('click', toggleClass, false);
    }

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
		videoCloseTag[0].addEventListener('click', resetVideoPopup, false);
	}

	var videoModal = document.getElementById('videoModal');
    if (videoModal) {
        videoModal.addEventListener('click', resetVideoPopup, false);
    }

	function resetVideoPopup(){
        document.getElementById("videoIframe").src = "";
	}


    /*
     * Cookie consent
     * */
    var cookieElement = document.getElementById("cookie_directive_container");
    checkCookie_eu();

    function checkCookie_eu() {

        var consent = getCookie_eu("cookies_consent");

        if (consent == null || consent == "" || consent == undefined) {
            // show notification bar
            if (cookieElement) {
                cookieElement.style.opacity = 1;
            }
        }

    }

    function setCookie_eu(c_name,value,exdays) {

        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
        document.cookie = c_name + "=" + c_value+"; path=/";

        if (cookieElement) {
            cookieElement.style.opacity = 0;
        }
    }


    function getCookie_eu(c_name) {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++)
        {
            x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==c_name)
            {
                return unescape(y);
            }
        }
    }

    var cookieClose = document.getElementById("cookieClose");

    if (cookieClose) {
        cookieClose.addEventListener('click', function (event) {
            event.preventDefault();
            setCookie_eu("cookies_consent", 1, 30);
        }, false);
    }

    /*
     * END Cookie consent
     * */


})();
