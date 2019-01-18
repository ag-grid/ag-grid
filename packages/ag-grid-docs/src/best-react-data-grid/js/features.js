document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.features-grid .img-container');

    containers.forEach((container) => {
        const video = container.querySelector('video');

        container.addEventListener('mouseenter', () => {
            video.play();
        });

        container.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    });
});