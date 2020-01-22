<?php
    function printVideo ($url){
        echo "
            <div class='video'>
                <iframe src='$url' frameborder='0' allow='accelerometer; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe>
            </div>
        ";
    };
?>
