<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Changelog</title>
    <meta name="description" content="ag-Grid - Changelog of Work.">
    <meta name="keywords" content="ag-Grid javascript grid changelog release notes"/>
    <meta http-equiv="Cache-control" content="public">
    <meta http-equiv="cache-control" content="max-age=86400"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="../dist/aui/css/aui.min.css" media="all">
    <link rel="stylesheet" href="../dist/aui/css/aui-experimental.min.css" media="all">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>

    <!-- Bootstrap -->
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">


    <link rel="stylesheet" type="text/css" href="../style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico"/>

    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.8/angular.min.js"></script>
    <link rel="stylesheet" href="../documentation-main/documentation.css">
    <script src="../documentation-main/documentation.js"></script>

</head>

<body class="big-text" ng-app="documentation">

<?php
date_default_timezone_set('Europe/London');

$navKey = "changelog";
include '../includes/navbar.php'; ?>

<?php $headerTitle = "Changelog";
include '../includes/headerRow.php'; ?>

<div class="container info-page">
    <div class="row">
        <div class="col-md-12">
            <note>This page covers the full Changelog for all items for 8.x and above. For the Summary Changelog, or
                the legacy changelog covering versions 7.x and above before go <a href="../change-log/changeLogIndex.php">here</a>.
            </note>

            <?php
            function mapIssueType($issueType)
            {
                switch ($issueType) {
                    case "Task":
                        return "Feature Request";
                        break;
                }
                return $issueType;
            }

            function mapReporter($reporter)
            {
                if ($reporter === "" || $reporter === "Internal") {
                    return "ag-Grid";
                }
                switch ($reporter) {
                    case "Client Request (email, telephone, etc)":
                        return "Enterprise Request";
                        break;
                }
                return $reporter;
            }

            function toDate($str_value)
            {
                $date = new DateTime($str_value, new DateTimeZone('GMT'));
                return $date->format('j M Y');
            }

            ?>
            <table class="aui">
                <tbody><?php $showFixVersion = true;
                $firstReport = true;
                $reportTitle = "";
                $csvFile = "changelog.json";
                include '../jira_report.php'; ?></tbody>
            </table>
        </div>
    </div>
</div>
<?php include("../includes/footer.php"); ?>

</body>

<?php include_once("../includes/analytics.php"); ?>

</html>