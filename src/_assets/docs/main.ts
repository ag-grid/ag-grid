import './main.scss';
import {$, lazyload, AnchorJS, Prism, initCookieDisclaimer } from '../common/vendor';

$(function() {
    $("#side-nav > ul > li > span").on("click", function() {
        var $parent = $(this).parent();
        if ($parent.hasClass('expanded')) {
            $("#side-nav > ul > li").removeClass("expanded")
            $("#side-nav > ul > li > ul").css('height', "");
        } else {
            $("#side-nav > ul > li").not($parent).removeClass("expanded")
            $("#side-nav > ul > li > ul").css('height', "");
            $parent.addClass('expanded');
            var ul = $(this).next('ul');
            ul.css('height', ul[0].scrollHeight);
        }
    });
})
