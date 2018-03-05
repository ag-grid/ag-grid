<?php 
include  '../example-runner/utils.php'
?>
<!DOCTYPE html>
<html lang="en">
    <head lang="en">
        <meta charset="UTF-8">

        <!-- Bootstrap -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
        <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>

        <?= globalAgGridScript(false) ?>

        <script src="./data.js"></script>
        <script src="./example.js"></script>
        <link href="./styles.css" rel="stylesheet">
    </head>
    <body>

        <style>
            button:disabled { color: #a0a0a0; }
        </style>

        <div style="width: 800px;">
            <div style="padding: 4px">
                <div style="float: right;">
                    <input type="text" id="quickFilterInput" placeholder="Type text to filter..."/>
                    <button id="btDestroyGrid">Destroy Grid</button>
                    <button id="btBringGridBack">Create Grid</button>
                </div>
                <div style="padding: 4px;">
                    <b>Employees Skills and Contact Details</b> <span id="rowCount"></span>
                </div>
                <div style="clear: both;"></div>
            </div>
            <div style="width: 100%; height: 400px;"
                id="bestHtml5Grid"
                class="ag-theme-balham ag-basic">
            </div>
        </div>

    </body>
</html>
