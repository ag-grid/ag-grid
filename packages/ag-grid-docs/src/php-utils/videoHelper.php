<?php
    function printVideoSection($url, $sectionId, $title){
        echo "
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
?>
