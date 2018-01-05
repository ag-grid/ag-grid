import './main.scss';
import '../../example-runner/example-runner.ts';

import {$, lazyload, AnchorJS, Prism, initCookieDisclaimer} from '../common/vendor';

$(function() {
    var $currentlyExpanded = $('#side-nav > ul > li.expanded > ul');

    if ($currentlyExpanded.length) {
        $currentlyExpanded.css('height', $currentlyExpanded[0].scrollHeight);
    }

    $('#side-nav > ul > li > span').on('click', function() {
        var $parent = $(this).parent();
        var $otherCats = $('#side-nav > ul > li').not($parent);

        $otherCats.removeClass('expanded');
        $otherCats.find('> ul').css('height', '0');

        var ul = $(this).next('ul');

        ul.css('height', $parent.hasClass('expanded') ? '0' : ul[0].scrollHeight);
        $parent.toggleClass('expanded');
    });

    const anchors = new AnchorJS();
    anchors.options = {
        placement: 'left',
        visible: 'hover'
    };

    var selectors = new Array(5)
        .fill(1)
        .map(function(_, index) {
            return '#content:not(.skip-in-page-nav) h' + (index + 1);
        })
        .join(', ');
    anchors.add(selectors);

    var docNav = $('#doc-nav');
    var level = 1;
    var prevLink = null;
    var list = $('<ul></ul>');
    var breakpoints = [];

    docNav.empty().append(list);

    for (var i = 0, len = anchors.elements.length; i < len; i++) {
        (function() {
            var heading = anchors.elements[i];
            var headingLevel = heading.tagName.match(/\d/);
            var headingText = $(heading).text();

            var link = $(`<li class="level-${headingLevel}">
                <a href="#${heading.id}">${headingText}</a>
            </li>`);

            list.append(link);

            breakpoints.push({
                heading: $(heading),
                link: link
            });
        })();
    }

    $(window).on('scroll', function(e) {
        if (!breakpoints.length) {
            return;
        }
        
        var scrollBottom = $(window).scrollTop();
        var i = 0;

        while (i < breakpoints.length - 1 && breakpoints[i].heading.offset().top < scrollBottom) {
            i++;
        }

        docNav.find('a').removeClass('current-section');
        breakpoints[i].link.find('> a').addClass('current-section');
    });

    new lazyload(document.querySelectorAll('#feature-roadshow img'), {});
});
