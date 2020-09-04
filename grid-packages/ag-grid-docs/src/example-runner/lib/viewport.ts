import * as jQuery from 'jquery';

const win = jQuery(window);
const contentEl = document.getElementsByClassName('page-content')[0];

function getCurrentViewPort() {
    const viewport = {
        top: win.scrollTop(),
        left: win.scrollLeft(),
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
            contentEl.removeEventListener('scroll', comparePosition);
            callback();
        }
    }

    contentEl.addEventListener('scroll', comparePosition);
    comparePosition();
}
