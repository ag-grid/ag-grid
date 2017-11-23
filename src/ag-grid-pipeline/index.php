<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Pipeline</title>
    <meta name="description" content="ag-Grid - Pipeline / Changelog of Work.">
    <meta name="keywords" content="ag-Grid javascript grid pipeline changelog release notes"/>
    <meta http-equiv="Cache-control" content="public">
    <meta http-equiv="cache-control" content="max-age=86400"/>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="../dist/aui/css/aui.min.css" media="all">
    <link rel="stylesheet" href="../dist/aui/css/aui-experimental.min.css" media="all">

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>

    <!-- Bootstrap -->
    <script src="//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css">


    <link rel="stylesheet" type="text/css" href="../style.css">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico"/>

</head>

<body class="big-text">


<?php
$navKey = "pipeline";
include '../includes/navbar.php';

$headerTitle = "Pipeline";
include '../includes/headerRow.php';

include '../jira_reports/jira_utilities.php';
?>

<div class="container info-page">
    <div class="row">
        <div class="col-md-12">
            <div class="global-search-pane">
                <span class="search-label">Type the issue number you're looking for - when a single match is found the corresponding
                tab will be opened.</span>
                <input type="text" id="global_search" class="global-report-search"
                       placeholder="Global Issue Search (eg. AG-1111)...">
                <div class="global-report-search-results"></div>
            </div>
            <div class="tabbable boxed parentTabs">
                <ul class="nav nav-tabs">
                    <li class="active"><a href="#release">Current Release</a></li>
                    <li><a href="#bugs">Bugs</a></li>
                    <li><a href="#fr">Feature Requests</a></li>
                    <li><a href="#epics">Epics</a></li>
                    <li><a href="#parked">Parked Items</a></li>
                </ul>
                <div class="tab-content" style="margin-top: 5px">
                    <div class="tab-pane top-level-pane active" id="release">
                        <div class="report-description">
                            If your item is in this list, its guaranteed that we will give it a resolution and that it
                            will
                            be made available in the next major release. Usually each major release takes 4-5 weeks
                        </div>
                        <?php
                        $displayEpic = 0;
                        $report_type = 'current_release';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="bugs">
                        <div class="report-description">
                            If your item is listed here you should know that bugs are pulled into the current release in
                            small
                            batches based on development capacity. Usually items in the bug list with a high priority
                            get cleared in 1-2 releases.
                            Medium priority 1-3 releases. Low priority 2-4 releases
                        </div>
                        <?php
                        $displayEpic = 0;
                        $report_type = 'bugs';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="fr">
                        <div class="report-description">
                            Feature requests on this list are also pulled into the current release in small batches
                            based on
                            development capacity. Note that bugs take precedence at that our current capacity feature
                            requests with high priority
                            get cleared in 2-3 releases.<br/><br/>
                            Other feature requests we don't have a timeline for this, but we are working in improving
                            our capacity. The timelines in
                            this page will get updated as soon as the capacity for feature requests is improved
                        </div>
                        <?php
                        $displayEpic = 0;
                        $report_type = 'feature_requests';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="epics">
                        <div class="report-description">
                            <p>As part of managing feature requests we group similar ones into Epics, and then we bring
                                these epics into each sprint planning for each next release so they are considered as
                                next
                                major pieces of work.</p>
                            <p>If you are item is in this list is probably because it has jumped from the list of
                                feature
                                requests into this list, if that is the case have a look at the second list that shows
                                epics
                                sorted by priority.</p>
                            <p>If your item is in an epic an is high on the priority list, then this is an indicator
                                that
                                the whole epic might get revamped soon, but it is not a hard commitment since we will
                                refine
                                this every sprint planning</p>
                        </div>
                        <div class="tabbable">
                            <ul class="nav nav-tabs">
                                <li class="active"><a href="#issue_by_epic">Tickets Grouped By Epic</a></li>
                                <li><a href="#epic_by_priority">Epics By Priority</a></li>
                            </ul>
                            <div class="tab-content">
                                <div class="tab-pane active" id="issue_by_epic">
                                    <?php
                                    $displayEpic = 1;
                                    $report_type = 'issue_by_epic';
                                    include '../jira_reports/jira_report.php';
                                    ?>
                                </div>
                                <div class="tab-pane" id="epic_by_priority">
                                    <?php
                                    $displayEpic = 0;
                                    $report_type = 'epic_by_priority';
                                    include '../jira_reports/jira_report.php';
                                    ?>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane active" id="parked">
                        <div class="report-description">
                            Parked Items
                        </div>
                        <?php
                        $displayEpic = 0;
                        $report_type = 'current_release';
                        //                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    // show/hide tabs
    $("ul.nav-tabs a").click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    // global issue search
    $('#global_search').keyup(function () {
        var searchCriteria = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();

        var reportTables = $("table[id^=content_]");

        var candidates = [];
        var matchingIssueCount = 0;
        reportTables.each(function (index, reportTable) {
            var tableRows = $(reportTable).find("tr");
            var matchingRows = tableRows.filter(function (index, row) {
                var text = $(row).text().replace(/\s+/g, ' ').toLowerCase();
                return text.indexOf(searchCriteria) >= 0;
            });

            var issueCount = matchingRows.length;
            matchingIssueCount += issueCount;
            if (issueCount === 1) {
                candidates.push(reportTable);
            }
        });

        $(".global-report-search-results").html(matchingIssueCount + " matching issues");

        if (matchingIssueCount === 1 && candidates.length === 1) {
            var closestParentTab = $(candidates[0]).closest(".top-level-pane");
            var tabId = $(closestParentTab).attr('id');
            var tabAnchor = $(".parentTabs .nav.nav-tabs a").filter(function (index, anchor) {
                return anchor.href.indexOf("#" + tabId) >= 0;
            });

            $(tabAnchor[0]).click()
        }
    });

</script>
<?php include("../includes/footer.php"); ?>

</body>

<?php include_once("../includes/analytics.php"); ?>

</html>