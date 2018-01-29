declare function escape(string): string;
declare function unescape(string): string;

export function initCookieDisclaimer() {
    var cookieElement = document.getElementById('cookie-warning');
    checkCookie_eu();

    function checkCookie_eu() {
        var consent = getCookie_eu('cookies_consent');

        if (consent == null || consent == '' || consent == undefined) {
            // show notification bar
            if (cookieElement) {
                cookieElement.style.display = '';
            }
        }
    }

    function setCookie_eu(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + (exdays == null ? '' : '; expires=' + exdate.toUTCString());
        document.cookie = c_name + '=' + c_value + '; path=/';

        if (cookieElement) {
            cookieElement.style.display = 'none';
        }
    }

    function getCookie_eu(c_name) {
        var i,
            x,
            y,
            ARRcookies = document.cookie.split(';');
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
            x = x.replace(/^\s+|\s+$/g, '');
            if (x == c_name) {
                return unescape(y);
            }
        }
    }

    var cookieClose = document.getElementById('cookie-accept');

    if (cookieClose) {
        cookieClose.addEventListener(
            'click',
            function(event) {
                event.preventDefault();
                setCookie_eu('cookies_consent', 1, 30);
            },
            false
        );
    }
}
