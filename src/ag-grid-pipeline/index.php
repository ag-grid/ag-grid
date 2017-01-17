<html>
<head>
    <link rel="stylesheet" href="aui/css/aui.min.css" media="all">
    <link rel="stylesheet" href="aui/css/aui-experimental.min.css" media="all">
    <!--    <script src="https://code.jquery.com/jquery-1.8.3.min.js"></script>-->
    <!--    <script src="ag-grid-pipeline/aui/js/aui.min.js"></script>-->
    <!--    <script src="ag-grid-pipeline/aui/js/aui-experimental.min.js"></script>-->
    <!--    <script src="ag-grid-pipeline/aui/js/aui-soy.min.js"></script>-->
</head>
<body>


<?php
function mapIssueType($issueType) {
    switch ($issueType) {
        case "Task":
            return "Feature Request/Improvement";
            break;
    }
    return $issueType;
}

function toDate($str_value) {
    $date = new DateTime($str_value, new DateTimeZone( 'GMT' ));
    return $date->format('j F Y H:i');}
?>

<div id="main" class=" aui-page-panel">
    <div class="connect-theme-background-cover"></div>
    <div id="main-header">
        <div id="main-content" class="wiki-content">
            <div class="contentLayout2">
                <div class="columnLayout single" data-layout="single">
                    <div class="cell normal" data-type="normal">
                        <div class="innerCell">
                            <div id="refresh-module-1578096519"
                                 class="confluence-jim-macro refresh-module-id jira-table"
                                 resolved="">
                                <div id="jira-issues-2004560625" style="width: 100%;  overflow: auto;"
                                     class="jira-issues">
                                    <table class="aui" resolved="">
                                        <tbody>
                                        <?php
                                        $firstReport = true;
                                        $reportTitle = "Completed - Will be in the Next Release";
                                        $csvFile = "../jiradata/next_version_done.json";
                                        include './jira_report.php';
                                        ?>
                                        <?php
                                        $reportTitle = "Not Completed - Targeted for Next Release";
                                        $csvFile = "../jiradata/next_version_notdone.json";
                                        include './jira_report.php';
                                        ?>
                                        <?php
                                        $reportTitle = "Backlog";
                                        $csvFile = "../jiradata/backlog.json";
                                        include './jira_report.php';
                                        ?>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>