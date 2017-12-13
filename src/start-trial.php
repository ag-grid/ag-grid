<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Start Trial</title>
    <meta name="description" content="Free Trial of ag-Grid JavaScrpt Datagrid">
    <meta name="keywords" content="Free Trial of ag-Grid JavaScrpt Datagrid"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.0/css/font-awesome.min.css" rel="stylesheet">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>


    <link rel="stylesheet" type="text/css" href="/style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico"/>

</head>

<body ng-app="index" class="big-text">

<?php $navKey = "startTrial";
include 'includes/navbar.php'; ?>

<?php $headerTitle = "ag-Grid Start Trial";
include 'includes/headerRow.php'; ?>

<div class="container info-page">

    <div class="row">
        <div class="col-md-12">

            <h1>
                ag-Grid Enterprise Evaluation License
            </h1>

            <p>
                An evaluation license for ag-Grid Enterprise is granted to anyone wishing evaluate ag-Grid Enterprise.
                All we ask in return is the following:
            <ul>
                <li>
                    You agree to use the Evaluation License only for evaluation of ag-Grid Enterprise. You do not enter production with ag-Grid Enterprise.
                </li>
                <li>
                    You limit your trial to two months (after that, either uninstall or purchase).
                </li>
                <li>
                    You complete the form below - we will then email you back with a trial license key.
                </li>
            </ul>
            </p>
        </div>
    </div>

    <style>
        .theTable {
            text-align: center;
        }

        .tableCell {
            width: 48%;
            border-left: 1px solid #888;
            border-right: 1px solid #888;
            padding: 10px;
        }

        .tableHighlightCell {
            border-top: 1px solid #888;
            border-bottom: 1px solid #888;
            background-color: #eee;
        }

        .gapCol {
            width: 4%;
        }

        .titleCell {
            font-family: Impact, Charcoal, sans-serif;
            font-size: 35px;
            background-color: #eee;
            border-top: 1px solid #888;
            border-bottom: 1px solid #888;
        }

        .gridFeature {
            padding: 4px;
        }

        .gridFeaturesTitle {
            /*background-color: #eee;*/
            font-weight: bold;
        }

        .gridFeaturePlus {
            font-weight: bold;
        }

        .gridFeaturesList {
            /*background-color: #eee;*/
        }

        .benefitsCell {
            border-bottom: 1px solid #888;
        }
    </style>

    <?php $startTrial = true; ?>
    <?php include("includes/orderForm.php"); ?>

</div>

<?php include("includes/footer.php"); ?>

<script>
if(window.location.href.indexOf("/start-trial.php?submitted=true") !=-1)
{
(new Image()).src="//www.googleadservices.com/pagead/conversion/873243008/?label=8TOnCM7BnWsQgMOyoAM&guid=ON&script=0";
}
</script>

</body>

<?php include_once("includes/analytics.php"); ?>

</html>