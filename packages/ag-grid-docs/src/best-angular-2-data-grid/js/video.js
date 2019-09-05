$("#video").hover(
    function() { $(this).get(0).play(); },
    function() { $(this).get(0).pause(); }
);
