<?php 
$navKey = "pipeline";
include_once '../includes/html-helpers.php';
include '../jira_reports/jira_utilities.php';
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
            <h1>Next Release Target: TBD - 15.0.0 just released</h1>

            <p>
               The ag-Grid pipeline visualises the features and bug fixes we have in our internal issue tracker (JIRA). 
               The issues commonly have an ID, that looks like <code>AG-XXX</code>.
               The next release tab contains items that we are looking into for our next release, that usually has a scheduled release date.
               The green tabs contain items from our backlog (no concrete release date), grouped by type.
            </p>

            <div class="global-search-pane">
                <input class="clearable global-report-search" type="text" id="global_search" name="" value=""
                       placeholder="Issue Search (eg. AG-1111/popup/feature)..."/>
                <div class="global-report-search-results"></div>
            </div>

            <div class="tabbable boxed parentTabs">
                <ul class="nav nav-tabs inner-nav">
                    <li class="nav-item">
                        <a href="#release" class="report-link nav-link active">Next Release
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover" data-content="Items targeted to be in the next release" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#bugs" class="report-link nav-link">Bugs
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover" data-content="Items reported via Zendesk/Github - these are prioritised above Feature Requests" aria-hidden="true"></i>
                        </a></li>
                    <li class="nav-item">
                        <a href="#fr" class="report-link nav-link">Standard Feature Requests
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover" data-content="Items that can be addressed on their own. These are recorded in a backlog and prioritised" aria-hidden="true"></i>
                        </a></li>
                    <li class="nav-item">
                        <a href="#epics" class="report-link nav-link">Complex Feature Requests
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover" data-content="Items that we group into Epics. We then prioritise based on the Epic rather than the individual feature request" aria-hidden="true"></i>
                        </a></li>
                    <li class="nav-item">
                        <a href="#parked" class="report-link nav-link">Parked Items
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover" data-content="Items parked for the immediate due to complexity/relevance to our entire user base" aria-hidden="true"></i>
                        </a></li>
                </ul>
                <div class="tab-content" style="margin-top: 5px">
                    <div class="tab-pane top-level-pane active" id="release">
                        <?php
                        $displayEpic = 0;
                        $suppressTargetSprint = 1;
                        $report_type = 'current_release';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="bugs">
                        <?php
                        $displayEpic = 0;
                        $suppressTargetSprint = 0;
                        $report_type = 'bugs';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="fr">
                        <?php
                        $displayEpic = 0;
                        $suppressTargetSprint = 0;
                        $report_type = 'feature_requests';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="epics">
                        <?php
                        $displayEpic = 1;
                        $suppressTargetSprint = 0;
                        $report_type = 'issue_by_epic';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="parked">
                        <?php
                        $displayEpic = 0;
                        $report_type = 'parked';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                </div>
            </div>
        </section>
    </div>
</div>



<script src="../dist/homepage.js"></script>
<?php include_once("../includes/footer.php"); ?>
<?php include_once("../includes/analytics.php"); ?>
</body>
</html>