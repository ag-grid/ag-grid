<?php
$json_decoded = json_decode(file_get_contents($csvFile));
$issue_count = count($json_decoded->{'issues'});
for ($i = 0; $i < $issue_count; $i++) {
    if ($i == 0) {
        ?>
        <tr>
            <td colspan="7" style="<?= $firstReport ? '' : 'padding-top: 55px' ?>"><h2
                    id="ag-GridBacklog-Completed-WillbeintheNextRelease"><?= $reportTitle ?></h2></td>
        </tr>
        <tr>

            <th style="text-align: left; text-transform: capitalize;"
                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                    class="jim-table-header-content">Key</span></th>
            <th style="text-align: left; text-transform: capitalize;"
                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                    class="jim-table-header-content">Issue Type</span></th>

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
            class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'key'},FILTER_SANITIZE_STRING)?></td><!-- key -->
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><img
                src="https://ag-grid.atlassian.net/secure/viewavatar?size=xsmall&amp;avatarId=<?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'avatarId'},FILTER_SANITIZE_STRING) ?>&amp;avatarType=issuetype"
                height="16" width="16" border="0" align="absmiddle"> <?= mapIssueType(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'name'},FILTER_SANITIZE_STRING)) ?></td>
        <!-- issue type -->
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'summary'},FILTER_SANITIZE_STRING); ?></td><!-- summary -->
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><?= toDate(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'created'},FILTER_SANITIZE_STRING)) ?></td><!-- created -->
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><?= toDate(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'updated'},FILTER_SANITIZE_STRING)) ?></td><!-- updated -->
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><?= count(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10300'},FILTER_SANITIZE_STRING)) > 0 ? filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10300'}[0]->{'value'},FILTER_SANITIZE_STRING) : 'ag-Grid' ?></td>
        <!-- reporter/source -->
        <td nowrap="true" class="jira-macro-table-underline-pdfexport">      <!-- status -->
            <span class="aui-lozenge aui-lozenge-subtle aui-lozenge-success"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'status'}->{'name'},FILTER_SANITIZE_STRING) ?></span>
        </td>
    </tr>
<?php
}
?>

