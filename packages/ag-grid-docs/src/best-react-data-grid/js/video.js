$("#video").hover(
    ()=>{ $(this).get(0).play(); },
    ()=>{ $(this).get(0).pause(); }
);