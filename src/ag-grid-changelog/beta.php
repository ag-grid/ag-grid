<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">

    <title>ag-Grid Pipeline</title>
    <meta name="description" content="ag-Grid - Changelog of Work.">
    <meta name="keywords" content="ag-Grid javascript grid changelog release notes"/>
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
$navKey = "changelog";
include '../includes/navbar.php';

$headerTitle = "Changelog";
include '../includes/headerRow.php';

include '../jira_reports/jira_utilities.php';
?>

<div class="container info-page">
    <div class="row">
        <div class="col-md-12" style="padding-top: 10px; padding-bottom: 5px;">
            <div class="note" style="border-radius: 5px">
                <table>
                    <tr>
                        <td style="vertical-align: top">
                            <img src="../images/note.png"/>
                        </td>
                        <td style="padding-left: 10px;">
                            This page covers the full Changelog for all items for 8.x and above. For the Summary
                            Changelog, or
                            the legacy changelog covering versions 7.x and above, please go <a
                                    href="../change-log/changeLogIndex.php">here</a>.
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <div class="global-search-pane">
                <input class="clearable global-report-search" style="width: 60%" type="text" id="global_search" name=""
                       value=""
                       placeholder="Issue Search (eg. AG-1111/popup/feature)..."/>
                <div class="global-report-search-results">
                    <input type="checkbox" id="breaking" onclick="updateSearchFilter()">&nbsp;Filter By Breaking
                    Changes&nbsp;
                    <input type="checkbox" id="deprecation" onclick="updateSearchFilter()">&nbsp;Filter By
                    Deprecations
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

                                <th class="jira-macro-table-underline-pdfexport jira-tablesorter-header report-header" nowrap>
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
                                    <span style="width: 100%" class="btn btn-primary"
                                          onclick="toggleMoreInfo('<?= $key ?>')">More Info</span>
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

    function processSearchValue() {
        var searchCriteria = $.trim(document.getElementById('global_search').value).replace(/ +/g, ' ').toLowerCase();

        var reportTable = $("table[id^=content_]")[0];

        // hide the more info rows
        $(reportTable).find("tr.jira-more-info").hide();

        var tableRows = $(reportTable).find("tr.jira[jira_data]");

        // 1) filter out rows that DON'T match the current search
        tableRows
            .show()
            .filter(function() {
                var breakingChangesFail = document.getElementById('breaking').checked && $(this).attr("breaking") === undefined;
                var deprecationsFail = document.getElementById('deprecation').checked && $(this).attr("deprecation") === undefined;

                var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                var searchTextFails = !~text.indexOf(searchCriteria);

                return breakingChangesFail || deprecationsFail || searchTextFails;
            })
            .hide();
    }

    // global issue search
    $('#global_search').keyup(function (event) {
        if (skipKey(event.key)) {
            return;
        }

        processSearchValue();
    });

    function updateSearchFilter() {
        processSearchValue();
    }

    // clearable input (x in global search input)
    jQuery(function ($) {
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
            processSearchValue();
        });

        // register popovers
        $("[data-toggle=popover]").popover({container: 'body'});
    });

    // more info rows
    function toggleMoreInfo(id) {
        $("#" + id).toggle();
    }

</script>
<?php include("../includes/footer.php"); ?>

</body>

<?php include_once("../includes/analytics.php"); ?>

</html>