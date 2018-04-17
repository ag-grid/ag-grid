<?php
$navKey = "changelog";
include_once '../includes/html-helpers.php';
gtm_data_layer('changelog');
include '../jira_reports/jira_utilities.php';
?>
<!DOCTYPE html>
<html lang="en">
<head lang="en">
    <?php
    meta_and_links("ag-Grid: Changelog of Delivered Features and Bug Fixes", "ag-Grid javascript grid changelog release notes", "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. Our Changelog lists all delivered delivered new functionality and bux fixes.", false);
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
function extractFixVersions($data)
{
    $fixVersions = array();

    for ($i = 0; $i < count($data->{'issues'}); $i++) {
        $fixVersion = filter_var($data->{'issues'}[$i]->{'fields'}->{'fixVersions'}[0]->{'name'});
        if (strlen($fixVersion) > 0) {
            array_push($fixVersions, $fixVersion);
        }
    }

    $fixVersions = array_values(array_unique($fixVersions));

    return $fixVersions;
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

$report_type = 'changelog';

$json_decoded = retrieveJiraFilterData($report_type);
$fixVersions = extractFixVersions($json_decoded);
$currentFixVersion = isset($_GET["fixVersion"]) ? htmlspecialchars($_GET["fixVersion"]) : 'all';
$moreInformationMap = extractMoreInformationMap($json_decoded);
$keyToMoreInfo = $moreInformationMap['more_info'];
$keyToBreakingChanges = $moreInformationMap['breaking'];
$keyToDeprecations = $moreInformationMap['deprecation'];
?>

<div class="info-page" id="page-changelog">
    <div class="row">
        <section>
            <div class="note">
                This page covers the full Changelog for all items for 8.x and above. For the Summary
                Changelog, or the legacy changelog covering versions 7.x and above, please go <a
                        href="../change-log/changeLogIndex.php">here</a>.<br/><br/>

                For a list of up and coming Bug Fixes and Features please refer to our <a
                        href="../ag-grid-pipeline">Pipeline</a>.<br/></br>
                Documentation for previous versions can be found
<a href="https://www.ag-grid.com/archive/">here.</a>
            </div>
            <div class="global-search-pane" style="display: inline-block;width:100%">
                <input class="clearable global-report-search" style="float: left;height: 50px" type="text"
                       id="global_search" name="" value="" placeholder="Issue Search (eg. AG-1111/popup/feature)..."/>
                <div class="global-report-search-results" style="margin-left:20px;float: left">
                    <table>
                        <tr>
                            <td>
                                <select id="fixVersionFilter" style="margin-right: 20px">
                                    <option <?=$currentFixVersion == 'all' ? 'selected' : '' ?>>All Versions</option>
                                    <?php
                                    foreach ($fixVersions as &$value) {
                                        ?>
                                        <option <?=$currentFixVersion == $value ? 'selected' : '' ?>><?= $value ?></option>
                                        <?php
                                    }
                                    ?>

                                </select>
                            </td>
                            <td style="width: 20px;padding:0"><input type="checkbox" id="breaking"></td>
                            <td style="padding:0">Filter By Breaking Changes</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td style="padding:0"><input type="checkbox" id="deprecation"></td>
                            <td style="padding:0">Filter By Deprecations</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div style="margin-top: 0;margin-bottom: 10px;float: right">
                <span style="margin-right: 10px">
                     <img style="vertical-align: middle" src="<?= mapIssueIcon("Bug") ?>"
                          height="16" width="16" border="0"/> Bug
                <span style="margin-right: 10px">
                    <img style="vertical-align: middle" src="<?= mapIssueIcon("Feature Request") ?>"
                         height="16" width="16" border="0"/> Feature Request
                </span>
                <span style="margin-right: 10px">
                    <i class="fa fa-external-link"></i> Documentation URL
                </span>
                <span style="margin-right: 10px">
                    <span class='aui-lozenge-complete' style='padding: 1px; border-radius: 2px'>D</span> Deprecation
                </span>
                <span class='aui-lozenge-error' style='padding: 1px; border-radius: 2px'>B</span> Breaking Changes
            </div>
            <div>
                <?php include_once 'versionReleaseNotes.php' ?>
            </div>
            <div>
                <table class="aui" id="<?= 'content_' . $report_type ?>">
                    <tbody>

                    <?php
                    $issue_count = count($json_decoded->{'issues'});
                    for ($i = 0; $i < $issue_count; $i++) {
                        if ($i == 0) {
                            ?>
                            <tr>
                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header">
                                    <span class="jim-table-header-content">Key</span>
                                </th>

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header">
                                    <span class="jim-table-header-content">Issue<br/>Type</span>
                                </th>

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header"
                                    nowrap>
                                    <span class="jim-table-header-content">Fix<br/>Version</span>
                                </th>

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header">
                                    <span class="jim-table-header-content">Summary</span>
                                </th>

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header" colspan="4">
                                </th>
                            </tr>
                            <?php
                        }

                        $key = filter_var($json_decoded->{'issues'}[$i]->{'key'}, FILTER_SANITIZE_STRING);
                        if (empty($key)) {
                            continue;
                        }

                        $moreInfoContent = createMoreInfoContent($key, $moreInformationMap);
                        ?>
                        <tr class="jira <?= $i % 2 == 0 ? 'issue-row' : 'issue-row-alternate' ?>"
                            style="<?= strlen($moreInfoContent) > 0 ? 'border-bottom: none' : '' ?>"
                            jira_data
                            <?= array_key_exists($key, $keyToBreakingChanges) ? 'breaking' : '' ?>
                            <?= array_key_exists($key, $keyToDeprecations) ? 'deprecation' : '' ?>
                        >
                            <!-- key -->
                            <td nowrap="true"
                                class="jira-macro-table-underline-pdfexport"><?= $key ?></td>

                            <!-- issue type -->
                            <td nowrap="true" class="jira-macro-table-underline-pdfexport">
                                <span>
                                    <img style="vertical-align: middle"
                                         src="<?= mapIssueIcon(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'name'}, FILTER_SANITIZE_STRING)) ?>"
                                         height="16" width="16" border="0"
                                         title="<?= mapIssueType(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'name'}, FILTER_SANITIZE_STRING)) ?>"/>
                                </span>
                            </td>

                            <!-- fix version -->
                            <td nowrap="true"
                                class="jira-macro-table-underline-pdfexport"><?=
                                count($json_decoded->{'issues'}[$i]->{'fields'}->{'fixVersions'}[0]->{'name'}) > 0 ?
                                    filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'fixVersions'}[0]->{'name'}, FILTER_SANITIZE_STRING) :
                                    'TBD' ?></td>

                            <!-- summary -->
                            <td class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'summary'}, FILTER_SANITIZE_STRING); ?></td>

                            <!-- docs url -->
                            <td class="jira-macro-table-underline-pdfexport">
                                <?php
                                if (!empty($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10523'})) {
                                    ?>

                                    <a href="<?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10523'}, FILTER_SANITIZE_STRING); ?>"
                                       target="_blank"><i class="fa fa-external-link"></i></a>
                                    <?php
                                }
                                ?>
                            </td>

                            <!-- deprecation -->
                            <td class="jira-macro-table-underline-pdfexport">
                                <?php
                                if (array_key_exists($key, $keyToDeprecations)) {
                                    echo "<span class='aui-lozenge-complete' style='padding: 1px; border-radius: 2px'>D</span>";
                                } else {
                                    echo "";
                                }
                                ?>
                            </td>

                            <!-- breaking changes -->
                            <td class="jira-macro-table-underline-pdfexport">
                                <?php
                                if (array_key_exists($key, $keyToBreakingChanges)) {
                                    echo "<span class='aui-lozenge-error' style='padding: 1px; border-radius: 2px'>B</span>";
                                } else {
                                    echo "";
                                }
                                ?>
                            </td>

                            <!-- more info  -->
                            <td nowrap="true"
                                class="jira-macro-table-underline-pdfexport">
                                <?php
                                if (strlen($moreInfoContent) > 0) {
                                    ?>
                                    <span style="width: 100%" class="btn btn-primary" more-info data-key="<?= $key ?>">More Info</span>
                                <?php } ?>
                            </td>
                        </tr>
                        <?php
                        if (strlen($moreInfoContent) > 0) {
                            ?>
                            <tr class="jira-more-info jira <?= $i % 2 == 0 ? 'issue-row' : 'issue-row-alternate' ?>"
                                id="<?= $key ?>">
                                <td colspan="8">
                                    <div><?= $moreInfoContent ?></div>
                                </td>
                            </tr>
                        <?php } ?>
                        <?php
                    }
                    ?>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</div>


<script src="../dist/homepage.js"></script>
<?php include_once("../includes/footer.php"); ?>
<?php include_once("../includes/analytics.php"); ?>
</body>
</html>