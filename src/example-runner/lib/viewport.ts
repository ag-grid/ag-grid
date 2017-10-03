export function whenInViewPort(element, callback) {
    function comparePosition() {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
        const scrollPos = scrollTop + document.documentElement.clientHeight;
        const elemTop = element[0].offsetTop;

        if (scrollPos >= elemTop) {
            window.removeEventListener('scroll', comparePosition);
            callback();
            // setTimeout(callback, 2000);
        }
    }

    comparePosition();
    window.addEventListener('scroll', comparePosition);
}

export function trackIfInViewPort(element, callback) {
    function comparePosition() {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop || 0;
        var scrollPos = scrollTop + document.documentElement.clientHeight;
        var elemTop = element[0].offsetTop;
        var elemBottom = elemTop + element[0].querySelector('div').offsetHeight;

        const adjustment = 100;

        var inViewPort = scrollPos >= elemTop - adjustment && scrollTop <= elemBottom + adjustment;

        callback(inViewPort);
    }

    comparePosition();
    window.addEventListener('scroll', comparePosition);
}

