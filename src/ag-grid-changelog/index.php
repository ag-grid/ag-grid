<?php 
$navKey = "changelog";
include_once '../includes/html-helpers.php';
?>
<!DOCTYPE html>
<html>
<head lang="en">
<?php
meta_and_links("ag-Grid Pipeline", "ag-Grid javascript grid pipeline changelog release notes", "ag-Grid - Pipeline / Changelog of Work.", false);
?>
<link rel="stylesheet" href="../dist/homepage.css">
<link rel="stylesheet" href="../dist/aui/css/aui.css" media="all">
</head>

<body>
<header id="nav" class="compact">
<?php 
    $version = 'latest';
    include '../includes/navbar.php';
?>
</header>

<div class="info-page" id="page-pipeline">
    <div class="row">
        <section>
            <p class="lead">This page covers the full Changelog for all items for 8.x and above. For the Summary Changelog, or
                the legacy changelog covering versions 7.x and above before go <a href="../change-log/changeLogIndex.php">here</a>.
            </p>

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
        </section>
    </div>
</div>

<script src="../dist/homepage.js"></script>
<?php include_once("../includes/footer.php"); ?>
<?php include_once("../includes/analytics.php"); ?>
</body>
</html>