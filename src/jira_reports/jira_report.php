<table class="aui" id="<?= 'content_' . $report_type ?>">
    <tbody>
    <?php
    if ($report_type == 'issue_by_epic') {
        // we treat epics differently as we effective stitch the two datasets together
        // ideally we'd do this on jira side, but atm it doesnt appear to be possible to have parent epic info
        // on a child issue
        $epic_data = json_decode(json_encode(retrieveJiraFilterData('epic_by_priority')), true);

        // build up a map for epic key=>epic name
        $epicKeyToName = array();
        for ($x = 0; $x < count($epic_data['issues']); $x++) {
            $epicKeyToName[$epic_data['issues'][$x]['key']] = $epic_data['issues'][$x]['fields']['summary'];
        }

        // now add the epic name to each issue (we have the epic key, but not the name)
        $issue_data = json_decode(json_encode(retrieveJiraFilterData('issue_by_epic')), true);
        for ($x = 0; $x < count($issue_data['issues']); $x++) {
            $issue_fields = $issue_data['issues'][$x]['fields'];
            $issue_data['issues'][$x]['fields']['epicName'] = $epicKeyToName[$issue_fields['customfield_10005']];
        }

        // finally, convert back to object form
        $json_decoded = json_decode(json_encode($issue_data));
    } else {
        $json_decoded = retrieveJiraFilterData($report_type);
    }
    $issue_count = count($json_decoded->{'issues'});
    for ($i = 0; $i < $issue_count; $i++) {
        if ($i == 0) {
            ?>
            <tr>
                <?php
                if ($displayEpic) {
                    ?>
                    <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header"><span
                                class="jim-table-header-content">Epic</span></th>
                    <?php
                }
                ?>

                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header"><span
                            class="jim-table-header-content">Key</span></th>

                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header"><span
                            class="jim-table-header-content">Summary</span></th>

                <?php
                if (!$suppressPriority) {
                    ?>
                    <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header"><span
                                class="jim-table-header-content">Time Frame</span></th>
                    <?php
                }
                ?>
            </tr>
            <?php
        }
        ?>
        <tr class="jira <?= $i % 2 == 0 ? 'issue-row' : 'issue-row-alternate' ?>">
            <?php
            if ($displayEpic) {
                ?>
                <td nowrap="true" class="jira-macro-table-underline-pdfexport">
                    <span style="height: 100%"><?= mapIssueType(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'epicName'}, FILTER_SANITIZE_STRING)) ?></span>
                </td>
                <?php
            }
            ?>

            <!-- key -->
            <td nowrap="true"
                class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'key'}, FILTER_SANITIZE_STRING) ?></td>

            <!-- summary -->
            <td class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'summary'}, FILTER_SANITIZE_STRING); ?></td>

            <!-- priority -->
            <?php
            if (!$suppressPriority) {
                ?>
                <td class="jira-macro-table-underline-pdfexport" nowrap>
                    <span>
                        <?= mapPriority(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'priority'}->{'name'}, FILTER_SANITIZE_STRING)) ?>
                    </span>
                </td>
                <?php
            }
            ?>
        </tr>
        <?php
    }
    ?>
    </tbody>
</table>
