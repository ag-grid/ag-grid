<?php

?>
<table class="aui">
    <tbody>
    <?php
    $json_decoded = retrieveJiraFilterData($jira_report);
    $issue_count = count($json_decoded->{'issues'});
    for ($i = 0; $i < $issue_count; $i++) {
        if ($i == 0) {
            ?>
            <tr>
                <?php
                if ($displayEpic) {
                    ?>
                    <th style="text-align: left; text-transform: capitalize;"
                        class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                                class="jim-table-header-content">Epic</span></th>
                    <?php
                }
                ?>

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
                            class="jim-table-header-content">Priority</span></th>

                <th style="text-align: left; text-transform: capitalize;"
                    class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                            class="jim-table-header-content">Status</span></th>

                <th style="text-align: left; text-transform: capitalize;"
                    class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                            class="jim-table-header-content">Created</span></th>

                <th style="text-align: left; text-transform: capitalize;"
                    class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                            class="jim-table-header-content">Updated</span></th>

                <th style="text-align: left; text-transform: capitalize;"
                    class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                            class="jim-table-header-content">Reporter</span></th>

            </tr>
            <?php
        }
        ?>
        <tr class="jira <?= $i % 2 == 0 ? 'issue-row' : 'issue-row-alternate' ?>">
            <?php
            if ($displayEpic) {
                ?>
                <td nowrap="true" class="jira-macro-table-underline-pdfexport">
<!--                <span>-->
<!--                    <img style="vertical-align: middle"-->
<!--                         src="--><?//= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10005'}, FILTER_SANITIZE_STRING) ?><!--"-->
<!--                         height="16" width="16" border="0"/>-->
<!--                </span>-->
                    <span style="height: 100%"><?= mapIssueType(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10005'}, FILTER_SANITIZE_STRING)) ?></span>
                </td>
                <?php
            }
            ?>

            <!-- key -->
            <td nowrap="true"
                class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'key'}, FILTER_SANITIZE_STRING) ?></td>

            <!-- issue type -->
            <td nowrap="true" class="jira-macro-table-underline-pdfexport">
                <span>
                    <img style="vertical-align: middle"
                         src="<?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'iconUrl'}, FILTER_SANITIZE_STRING) ?>"
                         height="16" width="16" border="0"/>
                </span>
                <span style="height: 100%"><?= mapIssueType(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'name'}, FILTER_SANITIZE_STRING)) ?></span>
            </td>

            <!-- summary -->
            <td class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'summary'}, FILTER_SANITIZE_STRING); ?></td>

            <!-- priority -->
            <td class="jira-macro-table-underline-pdfexport">
                <span>
                    <img style="vertical-align: middle"
                         src="<?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'priority'}->{'iconUrl'}, FILTER_SANITIZE_STRING) ?>"
                         height="16" width="16" border="0"/>
                </span>
            </td>

            <!-- status -->
            <td nowrap="true" class="jira-macro-table-underline-pdfexport">
            <span class="aui-lozenge aui-lozenge-subtle aui-lozenge-success">
                <?= mapStatus(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'status'}->{'name'}, FILTER_SANITIZE_STRING)) ?>
            </span>
            </td>

            <!-- created -->
            <td nowrap="true"
                class="jira-macro-table-underline-pdfexport"><?= toDate(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'created'}, FILTER_SANITIZE_STRING)) ?></td>

            <!-- updated -->
            <td nowrap="true"
                class="jira-macro-table-underline-pdfexport"><?= toDate(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'updated'}, FILTER_SANITIZE_STRING)) ?></td>

            <!-- reporter/source -->
            <td nowrap="true"
                class="jira-macro-table-underline-pdfexport"><?= mapReporter(count($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10300'}) > 0 ? filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10300'}[0]->{'value'}, FILTER_SANITIZE_STRING) : '') ?></td>
        </tr>
        <?php
    }
    ?>
    </tbody>
</table>
