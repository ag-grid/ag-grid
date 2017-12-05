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

    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.6.0/css/font-awesome.min.css" rel="stylesheet">

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

// update when doing a release
$CURRENT_SPRINT = "3";
$NEXT_SPRINT = "4";

include '../jira_reports/jira_utilities.php';
?>

<div class="container info-page">
    <div class="row">
        <div class="col-md-12" style="padding-top: 10px; padding-bottom: 5px;">
            <h1>Next Release Target: 11th December</h1>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <div class="global-search-pane">
                <input class="clearable global-report-search" type="text" id="global_search" name="" value=""
                       placeholder="Issue Search (eg. AG-1111/popup/feature)..."/>
                <div class="global-report-search-results"></div>
            </div>
            <div>
                <ul class="nav nav-tabs passive-tab" style="border: none">
                    <li><a href="" class="" style="background-color:lightgreen;width: 200px;">Next Release</a></li>
                    <li><a href="" class="" style="background-color:lightblue;width: 935px">Future Releases</a></li>
                </ul>
            </div>
            <div class="tabbable boxed parentTabs">
                <ul class="nav nav-tabs">
                    <li class="active">
                        <a href="#release" class="report-link" style="width: 200px">Next Release
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover" data-content="Items targeted to be in the next release" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li>
                        <a href="#bugs" class="report-link">Bugs
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover" data-content="Items reported via Zendesk/Github - these are prioritised above Feature Requests" aria-hidden="true"></i>
                        </a></li>
                    <li>
                        <a href="#fr" class="report-link">Standard Feature Requests
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover" data-content="Items that can be addressed on their own. These are recorded in a backlog and prioritised" aria-hidden="true"></i>
                        </a></li>
                    <li>
                        <a href="#epics" class="report-link">Complex Feature Requests
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover" data-content="Items that we group into Epics. We then prioritise based on the Epic rather than the individual feature request" aria-hidden="true"></i>
                        </a></li>
                    <li>
                        <a href="#parked" class="report-link">Parked Items
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
        }, 500)
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

        // register popovers
        $("[data-toggle=popover]").popover({container: 'body'});
    });

</script>
<?php include("../includes/footer.php"); ?>

</body>

<?php include_once("../includes/analytics.php"); ?>

</html>