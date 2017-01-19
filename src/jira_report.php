<?php
$jiraDataPrefix = '../mock_jira_data/';
if(strpos($_SERVER['HTTP_HOST'], 'ag-grid.com') !== false) {
    $jiraDataPrefix='../jiradata/';
}
$json_decoded = json_decode(file_get_contents($jiraDataPrefix.$csvFile));
$issue_count = count($json_decoded->{'issues'});
for ($i = 0; $i < $issue_count; $i++) {
    if ($i == 0) {
        ?>
        <tr>
            <td colspan="7"
                style="font-weight: bold;font-size: large;<?= $firstReport ? '' : 'padding-top: 40px' ?>"><span
                    id="ag-GridBacklog-Completed-WillbeintheNextRelease"><?= $reportTitle ?></span></td>
        </tr>
        <tr>

            <th style="text-align: left; text-transform: capitalize;"
                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                    class="jim-table-header-content">Key</span></th>
            <th style="text-align: left; text-transform: capitalize;"
                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                    class="jim-table-header-content">Issue Type</span></th>

            <?php
            if ($showFixVersion) {
                ?>
                <th style="text-align: left; text-transform: capitalize;"
                    class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                        class="jim-table-header-content">Fix Version</span></th>
                <?php
            }
            ?>

            <th style="text-align: left; text-transform: capitalize;"
                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                    class="jim-table-header-content">Summary</span></th>

            <th style="text-align: left; text-transform: capitalize;"
                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                    class="jim-table-header-content">Created</span></th>

            <th style="text-align: left; text-transform: capitalize;"
                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                    class="jim-table-header-content">Updated</span></th>

            <th style="text-align: left; text-transform: capitalize;"
                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                    class="jim-table-header-content">Reporter</span></th>

            <th style="text-align: left; text-transform: capitalize;"
                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                    class="jim-table-header-content">Status</span></th>
        </tr>
        <?php
    }
    $firstReport = false;

    $class = $i % 2 == 0 ? 'rowNormal' : 'rowAlternate';

//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'key'};
//
//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'avatarId'};
//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'name'};
//
//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'priority'}->{'iconUrl'};
//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'priority'}->{'name'};
//
//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10300'}[0]->{'value'}; /* source*/
//
//    echo implode(",", $json_decoded->{'issues'}[$i]->{'fields'}->{'labels'});
//
//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'components'}[0]->{'name'}; /* components (could me many) */
//
//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'summary'};
//
//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'created'};
//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'updated'};
//
//    echo $json_decoded->{'issues'}[$i]->{'fields'}->{'status'}->{'name'};
    ?>
    <tr class="<?= $class ?>">
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'key'}, FILTER_SANITIZE_STRING) ?></td>
        <!-- key -->
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport">
            <span  style="display: inline;height: 100%">
                <img style="height: 100%;vertical-align: middle"
                src="<?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'iconUrl'}, FILTER_SANITIZE_STRING) ?>"
                height="16" width="16" border="0"
                >
                <span style="height: 100%""><?= mapIssueType(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'name'}, FILTER_SANITIZE_STRING)) ?></span>
            </span>
        </td>
        <!-- issue type -->
        <td
        <?php
        if ($showFixVersion) {
        ?>
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'fixVersions'}[0]->{'name'}, FILTER_SANITIZE_STRING) ?></td>
        <!-- fix version -->
            <?php
        }
        ?>

        <td
            class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'summary'}, FILTER_SANITIZE_STRING); ?></td>
        <!-- summary -->
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><?= toDate(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'created'}, FILTER_SANITIZE_STRING)) ?></td>
        <!-- created -->
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><?= toDate(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'updated'}, FILTER_SANITIZE_STRING)) ?></td>
        <!-- updated -->
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><?= mapReporter(count($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10300'}) > 0 ? filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10300'}[0]->{'value'}, FILTER_SANITIZE_STRING) : '') ?></td>
        <!-- reporter/source -->
        <td nowrap="true" class="jira-macro-table-underline-pdfexport">      <!-- status -->
            <span
                class="aui-lozenge aui-lozenge-subtle aui-lozenge-success"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'status'}->{'name'}, FILTER_SANITIZE_STRING) ?></span>
        </td>
    </tr>
    <?php
}
?>

