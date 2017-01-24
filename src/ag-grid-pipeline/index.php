<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Pipeline</title>
    <meta name="description" content="ag-Grid - Pipeline / Changelog of Work.">
    <meta name="keywords" content="ag-Grid javascript grid pipeline changelog release notes"/>

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

    <!-- Hotjar Tracking Code for https://www.ag-grid.com/ -->
    <script>
        (function (h, o, t, j, a, r) {
            h.hj = h.hj || function () {
                    (h.hj.q = h.hj.q || []).push(arguments)
                };
            h._hjSettings = {hjid: 372643, hjsv: 5};
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script');
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
        })(window, document, '//static.hotjar.com/c/hotjar-', '.js?sv=');
    </script>


</head>

<body class="big-text">

<?php $navKey = "pipeline";
include '../includes/navbar.php'; ?>

<?php $headerTitle = "Pipeline";
include '../includes/headerRow.php'; ?>

<div class="container info-page" >
    <div class="row">
        <div class="col-md-12">
            <?php
            function mapIssueType($issueType)
            {
                switch ($issueType) {
                    case "Task":
//                        return "Feature Request/Improvement";
                        return "Feature Request";
                        break;
                }
                return $issueType;
            }

            function mapReporter($reporter)
            {
                if($reporter === "") {
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
//                return $date->format('j F Y H:i');
            }

            ?>
                    <table class="aui">
                        <tbody>
                        <?php
                        $showFixVersion = false;
                        $firstReport = true;
                        $reportTitle = "Completed - Will be in the Next Release";
                        $csvFile = "next_version_done.json";
                        include './../jira_report.php';
                        ?>
                        <?php
                        $reportTitle = "Not Completed - Targeted for Next Release";
                        $csvFile = "next_version_notdone.json";
                        include '../jira_report.php';
                        ?>
                        <?php
                        $reportTitle = "Backlog";
                        $csvFile = "backlog.json";
                        include '../jira_report.php';
                        ?>
                        </tbody>
                    </table>
        </div>
    </div>
</div>
<?php include("../includes/footer.php"); ?>

</body>

<?php include_once("../includes/analytics.php"); ?>

</html>