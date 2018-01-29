<?php
$jiraDataPrefix = '../mock_jira_data/';
if (strpos($_SERVER['HTTP_HOST'], 'ag-grid.com') !== false) {
    $jiraDataPrefix = '../jiradata/';
}
$filename = $jiraDataPrefix . $csvFile;
$json_decoded = json_decode(file_get_contents($filename));
$issue_count = count($json_decoded->{'issues'});
$noReportTitle = $reportTitle === "";
for ($i = 0; $i < $issue_count; $i++) {
    if ($i == 0) {
        ?>
        <tr>
            <td colspan="<?= $noReportTitle ? 9 : 8 ?>"
                style="font-weight: bold;font-size: large;<?= $firstReport ? '' : 'padding-top: 40px' ?>">
                <?php
                if (!$noReportTitle) {
                    ?>
                    <span style="float: left"
                          id="ag-GridBacklog-Completed-WillbeintheNextRelease"><?= $reportTitle ?></span>
                    <?php
                }
                if ($firstReport) {
                    ?>
                    <span style="float: right">Last Updated: <?= date("d F Y H:i", filemtime($filename)) ?></span>
                    <?php

                }
                ?>
            </td>
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
                        class="jim-table-header-content">Fix Version</span></th>
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

<!--            <th style="text-align: left; text-transform: capitalize;"-->
<!--                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span-->
<!--                    class="jim-table-header-content">Status</span></th>-->

            <th nowrap="true" style="text-align: left; text-transform: capitalize;"
                class="jira-macro-table-underline-pdfexport jira-tablesorter-header"><span
                    class="jim-table-header-content">More Info</span></th>

        </tr>
        <?php
    }
    $firstReport = false;

    $class = $i % 2 == 0 ? 'rowNormal' : 'rowAlternate';

    $moreInfoContent = $json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10400'};

    if (strlen($moreInfoContent) > 0) {
        ?>
        <div class="hidden" id="<?= filter_var($json_decoded->{'issues'}[$i]->{'key'}, FILTER_SANITIZE_STRING) ?>">
            <div class="popover-heading">
                This is the heading for #1
            </div>

            <div class="popover-body">
                <?=
                $moreInfoContent;
                ?>
            </div>
        </div>
        <?php
    }
    ?>
    <tr class="<?= $class ?>">
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'key'}, FILTER_SANITIZE_STRING) ?></td>
        <td nowrap="true" class="jira-macro-table-underline-pdfexport">
            <span><img style="vertical-align: middle"
                       src="<?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'iconUrl'}, FILTER_SANITIZE_STRING) ?>"
                       height="16" width="16" border="0"/></span>
            <span
                style="height: 100%"><?= mapIssueType(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'issuetype'}->{'name'}, FILTER_SANITIZE_STRING)) ?></span>
        </td>
        <td
            <td nowrap="true"
                class="jira-macro-table-underline-pdfexport"><?=
                count($json_decoded->{'issues'}[$i]->{'fields'}->{'fixVersions'}[0]->{'name'}) > 0 ?
                filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'fixVersions'}[0]->{'name'}, FILTER_SANITIZE_STRING) :
                'TBD'?></td>
            <!-- fix version -->
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
        <!-- status -->
<!--        <td nowrap="true" class="jira-macro-table-underline-pdfexport">      -->
<!--            <span-->
<!--                class="aui-lozenge aui-lozenge-subtle aui-lozenge-success">--><?//= mapStatus(filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'status'}->{'name'}, FILTER_SANITIZE_STRING)) ?>
<!--            </span>-->
<!--        </td>-->
        <td nowrap="true"
            class="jira-macro-table-underline-pdfexport"
            align="center">
            <?php
            if (strlen($moreInfoContent) > 0) {
                ?>
                <a style="width: 100%" class="btn btn-primary" data-placement="top"
                   data-popover-content="#<?= filter_var($json_decoded->{'issues'}[$i]->{'key'}, FILTER_SANITIZE_STRING) ?>"
                   data-toggle="popover" data-trigger="click" href="#" tabindex="0" data-placement="left">More Info</a>
            <?php } ?>
        </td>
    </tr>
    <?php
}
?>
<script>
    $(function () {
        $("[data-toggle=popover]").popover({
            html: true,
            content: function () {
                var that = this;
                setTimeout(function () {
                    $("#" + $(that).attr("aria-describedby")).attr("tabindex",-1).focus();
                    $("#" + $(that).attr("aria-describedby")).blur();
                }, 10);
                var content = $(this).attr("data-popover-content");
                return $(content).children(".popover-body").html();
            },
//            title: function () {
//                var title = $(this).attr("data-popover-content");
//                return $(title).children(".popover-heading").html();
//            }
        });
    });
</script>
