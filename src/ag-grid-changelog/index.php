<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Pipeline</title>
    <meta name="description" content="ag-Grid - Changelog of Work.">
    <meta name="keywords" content="ag-Grid javascript grid changelog release notes"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="../dist/aui/css/aui.min.css" media="all">
    <link rel="stylesheet" href="../dist/aui/css/aui-experimental.min.css" media="all">

    <!-- Bootstrap -->
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

<?php $navKey = "changelog";
include '../includes/navbar.php'; ?>

<?php $headerTitle = "Changelog";
include '../includes/headerRow.php'; ?>

<div class="container info-page">
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
                if($reporter === "" || $reporter === "Internal") {
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

<!--                        <div id="main" class=" aui-page-panel">-->
<!--                            <div class="connect-theme-background-cover"></div>-->
<!--                            <div id="main-header">-->
<!--                                <div id="main-content" class="wiki-content">-->
<!--                                    <div class="contentLayout2">-->
<!--                                        <div class="columnLayout single" data-layout="single">-->
<!--                                            <div class="cell normal" data-type="normal">-->
<!--                                                <div class="innerCell">-->
<!--            <div id="refresh-module-1578096519"-->
<!--                 class="confluence-jim-macro refresh-module-id jira-table"-->
<!--                 resolved="">-->
<!--                <div id="jira-issues-2004560625" style="width: 100%; overflow: auto;"-->
<!--                     class="jira-issues">-->
                    <table class="aui" resolved="">
                        <tbody>
                        <?php
                        $showFixVersion = true;
                        $firstReport = true;
                        $reportTitle = "";
                        $csvFile = "changelog.json";
                        include '../jira_report.php';
                        ?>
                        </tbody>
                    </table>
<!--                </div>-->
<!--            </div>-->
<!--                                                    </div>-->
<!--                                                </div>-->
<!--                                            </div>-->
<!--                                        </div>-->
<!--                                    </div>-->
<!--                                </div>-->
<!--                            </div>-->
<!--                        </div>-->
        </div>
    </div>
</div>
<?php include("../includes/footer.php"); ?>

</body>

<?php include_once("../includes/analytics.php"); ?>

</html>