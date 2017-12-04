import * as jQuery from 'jquery';

const win = jQuery(window);

function getCurrentViewPort() {
    const viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft(),
        right: NaN,
        bottom: NaN
    };

    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();

    return viewport;
}

function getRect(element) {
    const bounds = element.offset();
    bounds.right = bounds.left + element.outerWidth();
    bounds.bottom = bounds.top + element.outerHeight();
    return bounds;
}

export function whenInViewPort(element, callback) {
    function comparePosition() {
        const viewPort = getCurrentViewPort();
        const box = getRect(element);

        if (viewPort.bottom >= box.top) {
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
        const viewPort = getCurrentViewPort();
        const box = getRect(element);
        var inViewPort = viewPort.bottom >= box.top && viewPort.top <= box.bottom;

        callback(inViewPort);
    }

    comparePosition();
    window.addEventListener('scroll', comparePosition);
}
