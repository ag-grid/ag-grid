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

// update when doing a release
$CURRENT_SPRINT = "3";
?>

<div class="container info-page">
    <div class="row">
        <div class="col-md-12 sprint-container">
            <span class="sprint-label">Current Sprint: <?= $CURRENT_SPRINT ?></span>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <div class="global-search-pane">
                <input class="clearable global-report-search" type="text" id="global_search" name="" value=""
                       placeholder="Issue Search (eg. AG-1111/popup/feature)..."/>
                <div class="global-report-search-results"></div>
            </div>
            <div class="tabbable boxed parentTabs">
                <ul class="nav nav-tabs">
                    <li class="active"><a href="#release" class="report-link">Current Release</a></li>
                    <li><a href="#bugs" class="report-link">Bugs</a></li>
                    <li><a href="#fr" class="report-link">Feature Requests</a></li>
                    <li><a href="#epics" class="report-link">Epics</a></li>
                    <li><a href="#parked" class="report-link">Parked Items</a></li>
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
                        $suppressTargetSprint = 1;
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
                        $suppressTargetSprint = 0;
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
                        $suppressTargetSprint = 0;
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
                        <?php
                        $displayEpic = 1;
                        $suppressTargetSprint = 0;
                        $report_type = 'issue_by_epic';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="parked">
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
    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    var temporaryHighlight = debounce(function (targetIds) {
        var tabAnchors = $(".parentTabs .nav.nav-tabs a").filter(function (index, anchor) {
            return targetIds.indexOf($(anchor).attr('href')) >= 0;
        });

        $(tabAnchors).addClass('search-highlight');
        setTimeout(function () {
            $(tabAnchors).removeClass('search-highlight')
        }, 1000)
    }, 250);

    // show/hide tabs
    $("ul.nav-tabs a").click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    function skipKey(key) {
        var ignore = ['ArrowRight',
            'ArrowLeft',
            'Home',
            'End',
            'ArrowUp',
            'ArrowDown',
            'ArrowRight',
            'Shift',
            'Control',
            'Alt',
            'Meta'];
        return ignore.indexOf(key) >= 0;
    }

    function processSearchValue(context) {

        var searchCriteria = $.trim($(context).val()).replace(/ +/g, ' ').toLowerCase();
        if (!searchCriteria || searchCriteria === '') {
            $("table[id^=content_] tr").show();
            $(".global-report-search-results").html('');
            return;
        }

        var reportTables = $("table[id^=content_]");

        var candidates = [];

        var matchingIssueCount = 0;
        reportTables.each(function (index, reportTable) {
            // two parts to this
            // 1) filter out rows that DON'T match the current search
            // 2) store possible matches for later tab auto-navigation

            var tableRows = $(reportTable).find("tr");

            // 1) filter out rows that DON'T match the current search
            tableRows.show().filter(function () {
                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                return !~text.indexOf(searchCriteria);
            }).hide();

            // 2) store possible matches for later tab auto-navigation
            var matchingRows = tableRows.filter(function (index, row) {
                var text = $(row).text().replace(/\s+/g, ' ').toLowerCase();
                return text.indexOf(searchCriteria) >= 0;
            });

            var issueCount = matchingRows.length;
            matchingIssueCount += issueCount;
            if (issueCount > 0) {
                candidates.push(reportTable);
            }
        });

        $(".global-report-search-results").html(matchingIssueCount + " matching issues");


        // highlight any matching tabs
        if (candidates.length > 0) {
            var tabIds = $(candidates).closest('.top-level-pane').map(function (index, candidate) {
                return "#" + candidate.id
            });
            temporaryHighlight($.makeArray(tabIds));
        }

        // open tab if only a single match is found, or if only 1 tab has matches
        if (matchingIssueCount === 1 || $(candidates).length === 1) {
            var tabAnchor = $(".parentTabs .nav.nav-tabs a").filter(function (index, anchor) {
                return $(anchor).attr('href') === '#' + $(candidates[0]).closest('.top-level-pane').attr('id');
            });

            $(tabAnchor[0]).click();
        }
    }

    // global issue search
    $('#global_search').keyup(function (event) {
        if (skipKey(event.key)) {
            return;
        }

        processSearchValue(this);
    });

    jQuery(function ($) {
        // /////
        // CLEARABLE INPUT
        function tog(v) {
            return v ? 'addClass' : 'removeClass';
        }

        $(document).on('input', '.clearable', function () {
            $(this)[tog(this.value)]('x');
        }).on('mousemove', '.x', function (e) {
            $(this)[tog(this.offsetWidth - 18 < e.clientX - this.getBoundingClientRect().left)]('onX');
        }).on('touchstart click', '.onX', function (ev) {
            ev.preventDefault();
            $(this).removeClass('x onX').val('').change();
            processSearchValue(this);
        });
    });

</script>
<?php include("../includes/footer.php"); ?>

</body>

<?php include_once("../includes/analytics.php"); ?>

</html>