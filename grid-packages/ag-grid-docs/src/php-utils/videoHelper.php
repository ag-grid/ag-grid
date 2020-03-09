<?php
    function videoSection($url, $sectionId, $title) {
        return "
            <section id='$sectionId' class='mb-3'>
                <div class='card'>
                    <div class='card-header'>$title</div>
                        <div class='card-body'>
                        <div class='video'>
                            <iframe src='$url' frameborder='0' allow='accelerometer; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>
                        </div>
                    </div>
                </div>
            </section>
        ";
    }

    function videoLink($url, $time) {
        return "
            <div class='youtube-bar'>
                <img src='../images/yt_icon_rgb.png' class='youtube-icon' alt='Example video'></img>
                <a class='youtube-text' href='$url' target='_blank'><span>Watch this section of our docs in our video tutorial [$time]</span></a>
            </div>
        ";
    }
