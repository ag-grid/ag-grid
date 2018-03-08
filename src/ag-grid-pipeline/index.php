<?php
$navKey = "pipeline";
include_once '../includes/html-helpers.php';
gtm_data_layer('pipeline');
include '../jira_reports/jira_utilities.php';
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
    <?php
    meta_and_links("ag-Grid: Pipeline of Upcoming Features and Roadmap", "ag-Grid javascript grid pipeline changelog release notes", "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. Our Pipeline lists all known bugs, upcoming features and our Roadmap for major future releases. Version 16 is out now.", false);
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

<?php
const NEXT_SPRINT = 6;

function createMoreInfoContent($key, $moreInformationMap)
{
    $keyToMoreInfo = $moreInformationMap['more_info'];
    $keyToBreakingChanges = $moreInformationMap['breaking'];
    $keyToDeprecations = $moreInformationMap['deprecation'];

    $moreInfoContent = '';
    if (array_key_exists($key, $keyToMoreInfo)) {
        $moreInfoContent .= $keyToMoreInfo[$key] . '<br/>';
    }
    if (array_key_exists($key, $keyToBreakingChanges)) {
        $moreInfoContent .= '<span style="font-style: italic">' . $keyToBreakingChanges[$key] . '</span><br/>';
    }
    if (array_key_exists($key, $keyToDeprecations)) {
        $moreInfoContent .= '<span style="font-style: italic">' . $keyToDeprecations[$key] . '</span><br/>';
    }

    return $moreInfoContent;
}

function extractMoreInformationMap($data)
{
    $keyToMoreInfo = array();
    $keyToBreakingChanges = array();
    $keyToDeprecations = array();

    for ($i = 0; $i < count($data->{'issues'}); $i++) {
        $key = filter_var($data->{'issues'}[$i]->{'key'}, FILTER_SANITIZE_STRING);

        // information shown in the more info popovers - the content is here
        $moreInfoContent = $data->{'issues'}[$i]->{'fields'}->{'customfield_10522'};
        $deprecationNotes = $data->{'issues'}[$i]->{'fields'}->{'customfield_10520'};
        $breakingChangesNotes = $data->{'issues'}[$i]->{'fields'}->{'customfield_10521'};

        if (!empty($moreInfoContent)) {
            $keyToMoreInfo[$key] = $moreInfoContent;
        }
        if (!empty($breakingChangesNotes)) {
            $keyToBreakingChanges[$key] = $breakingChangesNotes;
        }
        if (!empty($deprecationNotes)) {
            $keyToDeprecations[$key] = $deprecationNotes;
        }
    }
    $moreInformationMap = array(
        'more_info' => $keyToMoreInfo,
        'breaking' => $keyToBreakingChanges,
        'deprecation' => $keyToDeprecations
    );

    return $moreInformationMap;
}

?>

<div class="info-page" id="page-pipeline">
    <div class="row">
        <section>
            <h1>Next Release Target: TBD - 15.0.0 just released</h1>

            <div class="note">
                <p>
            The ag-Grid pipeline visualises the features and bug fixes we have in our internal issue tracker (JIRA).
                The issues commonly have an ID, that looks like <code>AG-XXX</code>.</p>
                <p>The next release tab contains items that we are looking into for our next release, that usually has a
                scheduled release date.<br/></p>
                The green tabs contain items from our backlog (no concrete release date), grouped by type.
            </div>

            <div class="global-search-pane" style="display: inline-block;width: 100%">
                <input class="clearable global-report-search" style="float: left;height: 50px" type="text"
                       id="global_search" name="" value=""
                       placeholder="Issue Search (eg. AG-1111/popup/feature)..."/>
                <div style="margin-left:20px;float: left">
                    <table>
                        <tr>
                            <td style="width: 20px;padding:0"><input type="checkbox" id="breaking"></td>
                            <td style="padding:0">Filter By Breaking Changes</td>
                        </tr>
                        <tr>
                            <td style="padding:0"><input type="checkbox" id="deprecation"></td>
                            <td style="padding:0">Filter By Deprecations</td>
                        </tr>
                    </table>
                </div>
                <div style="margin-top: 15px;float: right">
                    <span style="margin-right: 10px">
                         <img style="vertical-align: middle" src="<?= mapIssueIcon("Bug") ?>"
                              height="16" width="16" border="0"/> Bug
                    <span style="margin-right: 10px">
                        <img style="vertical-align: middle" src="<?= mapIssueIcon("Feature Request") ?>"
                             height="16" width="16" border="0"/> Feature Request
                    </span>
                    <span style="margin-right: 10px">
                        <span class='aui-lozenge-complete' style='padding: 1px; border-radius: 2px'>D</span> Deprecation
                    </span>
                    <span class='aui-lozenge-error' style='padding: 1px; border-radius: 2px'>B</span> Breaking Changes
                </div>
            </div>
            <div class="global-report-search-results"></div>

            <div class="tabbable boxed parentTabs">
                <ul class="nav nav-tabs inner-nav">
                    <li class="nav-item">
                        <a href="#release" class="report-link nav-link active">Next Release
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover"
                               data-content="Items targeted to be in the next release" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="#bugs" class="report-link nav-link">Bugs
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover"
                               data-content="Items reported via Zendesk/Github - these are prioritised above Feature Requests"
                               aria-hidden="true"></i>
                        </a></li>
                    <li class="nav-item">
                        <a href="#fr" class="report-link nav-link">Standard Feature Requests
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover"
                               data-content="Items that can be addressed on their own. These are recorded in a backlog and prioritised"
                               aria-hidden="true"></i>
                        </a></li>
                    <li class="nav-item">
                        <a href="#epics" class="report-link nav-link">Complex Feature Requests
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover"
                               data-content="Items that we group into Epics. We then prioritise based on the Epic rather than the individual feature request"
                               aria-hidden="true"></i>
                        </a></li>
                    <li class="nav-item">
                        <a href="#parked" class="report-link nav-link">Parked Items
                            <i class="fa fa-question-circle-o" data-toggle="popover" data-trigger="hover"
                               data-content="Items parked for the immediate due to complexity/relevance to our entire user base"
                               aria-hidden="true"></i>
                        </a></li>
                </ul>
                <div class="tab-content" style="margin-top: 5px">
                    <div class="tab-pane top-level-pane active" id="release">
                        <?php
                        $displayParentEpicData = 1;
                        $filterOutEpics = 1;
                        $suppressTargetSprint = 1;
                        $report_type = 'current_release';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="bugs">
                        <?php
                        $displayParentEpicData = 0;
                        $filterOutEpics = 1;
                        $suppressTargetSprint = 0;
                        $report_type = 'bugs';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="fr">
                        <?php
                        $displayParentEpicData = 0;
                        $filterOutEpics = 1;
                        $suppressTargetSprint = 0;
                        $report_type = 'feature_requests';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="epics">
                        <?php
                        $displayParentEpicData = 1;
                        $filterOutEpics = 0;
                        $suppressTargetSprint = 0;
                        $report_type = 'issue_by_epic';
                        include '../jira_reports/jira_report.php';
                        ?>
                    </div>
                    <div class="tab-pane top-level-pane" id="parked">
                        <?php
                        $displayParentEpicData = 0;
                        $filterOutEpics = 1;
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