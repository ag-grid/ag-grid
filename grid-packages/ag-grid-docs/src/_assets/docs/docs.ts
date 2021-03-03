import "./docs.scss";
import { $, lazyload, AnchorJS } from "../common/vendor";

const anchors = new AnchorJS();
anchors.options = {
    placement: "left",
    visible: "hover"
};

var selectors = [1, 2, 3, 4, 5].map(level => "#content:not(.skip-in-page-nav) h" + level).join(", ");

anchors.add(selectors);

$(function() {
    var imgs = document.querySelectorAll("#feature-roadshow img, .lazy-load");
    new lazyload((imgs && imgs.length) ? imgs : [], {});

    $(window).on('hashchange', function() {
        var hash = window.location.hash;
        var top = 0;

        if (hash) {
            var $element = $(hash.replace(/\./g, '\\.'));

            if (!$element.position()) { return; }

            top = $element.position().top + 10;
        }

        $('.page-content').scrollTop(top);
    });

    if (window.location.hash) {
        // ensure content is visible
        $(window).trigger('hashchange');
    }
});
