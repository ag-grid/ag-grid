<table class="aui" id="<?= 'content_' . $report_type ?>">
    <tbody>
    <?php
    if ($report_type == 'issue_by_epic') {

        function sortBySpringEta($a, $b)
        {
            $etaA = $a['fields']['customfield_10515'];
            $etaB = $b['fields']['customfield_10515'];

            $etaA = empty($etaA) ? 1000 : $etaA;
            $etaB = empty($etaB) ? 1000 : $etaB;

            // sort first by Sprint ETA
            $result = $etaA - $etaB;

            // then by epic priority
            $result .= $a['fields']['epicPriority'] - $b['fields']['epicPriority'];

            // and finally by epic name
            $result .= strcmp($a['fields']['epicName'], $b['fields']['epicName']);

            return $result;

        }

        // we treat epics differently as we effective stitch the two datasets together
        // ideally we'd do this on jira side, but atm it doesnt appear to be possible to have parent epic info
        // on a child issue
        $epic_data = json_decode(json_encode(retrieveJiraFilterData('epic_by_priority')), true);

        // build up a map for epic key=>epic name
        $epicKeyToName = array();
        $epicKeyToSprintETA = array();
        $epicKeyToEpicPriority = array();
        for ($x = 0; $x < count($epic_data['issues']); $x++) {
            $epicKeyToName[$epic_data['issues'][$x]['key']] = $epic_data['issues'][$x]['fields']['summary'];
            $epicKeyToSprintETA[$epic_data['issues'][$x]['key']] = $epic_data['issues'][$x]['fields']['customfield_10515'];
            $epicKeyToEpicPriority[$epic_data['issues'][$x]['key']] = $epic_data['issues'][$x]['fields']['priority']['id'];
        }

        // now add the epic name to each issue (we have the epic key, but not the name)
        $issue_data = json_decode(json_encode(retrieveJiraFilterData('issue_by_epic')), true);
        for ($x = 0; $x < count($issue_data['issues']); $x++) {
            $issue_fields = $issue_data['issues'][$x]['fields'];
            $issue_data['issues'][$x]['fields']['epicName'] = $epicKeyToName[$issue_fields['customfield_10005']];
            $issue_data['issues'][$x]['fields']['customfield_10515'] = $epicKeyToSprintETA[$issue_fields['customfield_10005']];
            $issue_data['issues'][$x]['fields']['epicPriority'] = $epicKeyToEpicPriority[$issue_fields['customfield_10005']];
        }

        // sort the issues by sprint eta - as we're sorting by the parent epic and we've stitched two datasets
        // together here, we have to do the sort client side (ie we can't rely on JIRA sorting to do it for us)
        $issues = $issue_data['issues'];
        usort($issues, 'sortBySpringEta');
        $issue_data['issues'] = $issues;


        // finally, convert back to object form
        $json_decoded = json_decode(json_encode($issue_data));
    } else {
        $json_decoded = retrieveJiraFilterData($report_type);
    }

    $moreInformationMap = extractMoreInformationMap($json_decoded);
    $keyToMoreInfo = $moreInformationMap['more_info'];
    $keyToBreakingChanges = $moreInformationMap['breaking'];
    $keyToDeprecations = $moreInformationMap['deprecation'];

    $issue_count = count($json_decoded->{'issues'});
    for ($i = 0; $i < $issue_count; $i++) {
        $key = filter_var($json_decoded->{'issues'}[$i]->{'key'}, FILTER_SANITIZE_STRING);
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
                if ($suppressTargetSprint) {
                    ?>
                    <!-- status -->
                    <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header"><span
                                class="jim-table-header-content">Status</span></th>

                    <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header" colspan="4"></th>
                    <?php
                } else {
                    ?>
                    <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header center-align"
                        nowrap><span
                                class="jim-table-header-content">Release ETA</span></th>
                    <?php
                }
                ?>
            </tr>
            <?php
        }
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
            <?php
            if ($displayEpic) {
                ?>
                <td class="jira-macro-table-underline-pdfexport">
                    <span style="height: 100%"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10002'}, FILTER_SANITIZE_STRING) ?></span>
                </td>
                <?php
            }
            ?>

            <!-- key -->
            <td nowrap="true"
                class="jira-macro-table-underline-pdfexport"><?= $key ?></td>

            <!-- summary -->
            <td class="jira-macro-table-underline-pdfexport"><?= filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'summary'}, FILTER_SANITIZE_STRING); ?></td>

            <!-- status / sprint eta -->
            <?php
            if ($suppressTargetSprint) {
                ?>
                <!-- status -->
                <td nowrap="true" class="jira-macro-table-underline-pdfexport">
                    <span
                            class="aui-lozenge aui-lozenge-subtle
                        <?= classForStatusAndResolution(
                                filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'status'}->{'name'}, FILTER_SANITIZE_STRING),
                                filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'resolution'}->{'name'}, FILTER_SANITIZE_STRING)) ?>">
                        <?= getStatusForStatusAndResolution(
                            filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'status'}->{'name'}, FILTER_SANITIZE_STRING),
                            filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'resolution'}->{'name'}, FILTER_SANITIZE_STRING)
                        ) ?>
                    </span>
                </td>
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
                <?php
            } else {
                $sprintEta = filter_var($json_decoded->{'issues'}[$i]->{'fields'}->{'customfield_10515'}, FILTER_SANITIZE_STRING)
                ?>
                <td class="jira-macro-table-underline-pdfexport center-align" nowrap>
                    <?php
                    if (!empty($sprintEta)) {
                        ?>
                        <span><?= getValueForTargetEta($sprintEta, $NEXT_SPRINT) ?></span>
                        <?php
                    } else {
                        ?>
                        <span class="aui-lozenge aui-lozenge-subtle <?= classForStatusAndResolution("Backlog", "") ?>">Backlog</span>
                        <?php
                    }
                    ?>
                </td>
                <?php
            } ?>
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
