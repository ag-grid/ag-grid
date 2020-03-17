<?php
include '../example-runner/example-mappings.php';
include '../example-runner/utils.php';
include 'react-utils.php';

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <script>var __basePath = '';</script>
    <style media="only screen">
        html, body {
            height: 100%;
            width: 100%;
            margin: 0;
            box-sizing: border-box;
            -webkit-overflow-scrolling: touch;
        }

        html {
            position: absolute;
            top: 0;
            left: 0;
            padding: 0;
            overflow: auto;
        }

        body {
            padding: 1rem;
            overflow: auto;
        }
    </style>
    <?= getGlobalAgChartsScriptTag() ?>
</head>


<body>
<div id="myChart"></div>
<script src="main.js"></script>
</body>
</html>
