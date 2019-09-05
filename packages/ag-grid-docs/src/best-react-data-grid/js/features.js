document.addEventListener('DOMContentLoaded', function() {
    var containers = document.querySelectorAll('.features-grid .img-container');

    containers.forEach(function(container) {
        var video = container.querySelector('video');

        container.addEventListener('mouseenter', function() {
            video.play();
        });

        container.addEventListener('mouseleave', function() {
            video.pause();
            video.currentTime = 0;
        });
    });
});
