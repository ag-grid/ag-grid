<?php
$navKey = "changelog";
include_once '../includes/html-helpers.php';
include '../jira_reports/jira_utilities.php';
?>
<!DOCTYPE html>
<html>
<head lang="en">
    <?php
    meta_and_links("ag-Grid: Changelog of Upcoming Features and Roadmap", "ag-Grid javascript grid changelog release notes", "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. Our Changelog lists all delivered delivered new functionality and bux fixes.", false);
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

<div class="info-page" id="page-changelog">
    <div class="row">
        <section>
            <div class="note">
                This page covers the full Changelog for all items for 8.x and above. For the Summary
                Changelog, or the legacy changelog covering versions 7.x and above, please go <a
                        href="../change-log/changeLogIndex.php">here</a>.
            </div>
            <div class="global-search-pane" style="display: inline-block;width:100%">
                <input class="clearable global-report-search" style="float: left;height: 50px" type="text"
                       id="global_search" name="" value="" placeholder="Issue Search (eg. AG-1111/popup/feature)..."/>
                <div class="global-report-search-results" style="margin-left:20px;float: left">
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
            </div>

            <div>
                <?php
                function extractMoreInformationMap($data)
                {
                    $keyToMoreInfo = array();
                    $keyToBreakingChanges = array();
                    $keyToDeprecations = array();

                    for ($i = 0; $i < count($data->{'issues'}); $i++) {
                        $key = filter_var($data->{'issues'}[$i]->{'key'}, FILTER_SANITIZE_STRING);

                        // more info popovers - the content is here
                        $moreInfoContent = $data->{'issues'}[$i]->{'fields'}->{'customfield_10400'};

                        /* for testing - to be removed */
                        $random = mt_rand(10, 100);
                        $just_note = $random % 9 === 0;
                        $breaking = !$just_note && $random % 5 === 0;
                        $deprecation = !$just_note && $random % 6 === 0;
                        if ($just_note || $breaking || $deprecation) {
                            if ($just_note) {
                                $keyToMoreInfo[$key] = 'Some long winded comment unrelated to anything really..no breaking changes or deprecations.';
                            } else {
                                $keyToMoreInfo[$key] = 'Property Y introduced to add blah blah blah.';
                                if ($breaking) {
                                    $keyToBreakingChanges[$key] = 'Breaking Change: Property X removed.';
                                }
                                if ($deprecation) {
                                    $keyToDeprecations[$key] = 'Deprecation: Property X deprecated.';
                                }
                            }
                        }
                    }
                    /* for testing - to be removed */
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
                ?>
                <table class="aui" id="<?= 'content_' . $report_type ?>">
                    <tbody>
                    <?php
                    $json_decoded = retrieveJiraFilterData($report_type);

                    $moreInformationMap = extractMoreInformationMap($json_decoded);
                    $keyToMoreInfo = $moreInformationMap['more_info'];
                    $keyToBreakingChanges = $moreInformationMap['breaking'];
                    $keyToDeprecations = $moreInformationMap['deprecation'];

                    $issue_count = count($json_decoded->{'issues'});
                    for ($i = 0; $i < $issue_count; $i++) {
                        if ($i == 0) {
                            ?>
                            <tr>
                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header">
                                    <span class="jim-table-header-content">Key</span>
                                </th>

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header"
                                    nowrap>
                                    <span class="jim-table-header-content">Issue Type</span>
                                </th>

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header"
                                    nowrap>
                                    <span class="jim-table-header-content">Fix Version</span>
                                </th>

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header">
                                    <span class="jim-table-header-content">Summary</span>
                                </th>

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header">
                                    <span class="jim-table-header-content">Deprecation</span>
                                </th>

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header"
                                    nowrap>
                                    <span class="jim-table-header-content">Breaking Changes</span>
                                </th>

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header"
                                    nowrap="true">
                                    <span class="jim-table-header-content">More Info</span>
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
                                         src="<?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'iconUrl'}, FILTER_SANITIZE_STRING) ?>"
                                         height="16" width="16" border="0"/>
                                </span>
                                <span style="height: 100%"><?= mapIssueType(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'name'}, FILTER_SANITIZE_STRING)) ?></span>
                            </td>

                            <!-- fix version -->
                            <td nowrap="true"
                                class="jira-macro-table-underline-pdfexport"><?=
                                count($json_decoded->{'issues'}[$i]->{'fields'}->{'fixVersions'}[0]->{'name'}) > 0 ?
                                    filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'fixVersions'}[0]->{'name'}, FILTER_SANITIZE_STRING) :
                                    'TBD' ?></td>

                            <!-- summary -->
                            <td class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'summary'}, FILTER_SANITIZE_STRING); ?></td>

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
                                <td colspan="7">
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