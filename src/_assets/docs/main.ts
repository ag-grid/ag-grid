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
});
