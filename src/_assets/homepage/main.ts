import './main.scss';
import 'bootstrap';
import * as $ from 'jquery';

$(() => {
    var links = $('#nav-scenarios a');
    var demos = $('#stage-scenarios .demo');

    links.each(function(index) {
        $(this).click(function() {
            links.removeClass('active');
            $(this).addClass('active');

            demos.removeClass('current');
            $(demos[index]).addClass('current');

            demos[index].dispatchEvent(new CustomEvent('scenarios:show', { bubbles: false, cancelable: false }));

            return false;
        });
    });

    $('[data-toggle="popover"]').popover()
});
