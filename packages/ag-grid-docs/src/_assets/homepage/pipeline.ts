import {$} from '../common/vendor';

$(function () {
    $('#page-pipeline').each(function () {
        function debounce(func, wait, immediate = false) {
            var timeout;
            return function (_) {
                var context = this,
                    args = arguments;
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
            var tabAnchors = $('.parentTabs .nav.nav-tabs a').filter(function (index, anchor) {
                return targetIds.indexOf($(anchor).attr('href')) >= 0;
            });

            $(tabAnchors).addClass('search-highlight');
            setTimeout(function () {
                $(tabAnchors).removeClass('search-highlight');
            }, 500);
        }, 250);

        // show/hide tabs
        $('ul.nav-tabs a').click(function (e) {
            e.preventDefault();
            (<any>$(this)).tab('show');
        });

        function skipKey(key) {
            var ignore = ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'Shift', 'Control', 'Alt', 'Meta'];
            return ignore.indexOf(key) >= 0;
        }

        function processSearchValue() {
            let value = (<any>document.getElementById('global_search')).value;
            var searchCriteria = (<any>$).trim(value).replace(/ +/g, ' ').toLowerCase();
            if (!searchCriteria || searchCriteria === '') {
                $('table[id^=content_] tr').show();
                $('.global-report-search-results').html('');
            }

            var reportTables = $('table[id^=content_]');

            var candidates = [];

            var matchingIssueCount = 0;
            reportTables.each(function (index, reportTable) {
                // hide the more info rows
                $(reportTable).find("tr.jira-more-info").hide();

                // two parts to this
                // 1) filter out rows that DON'T match the current search
                // 2) store possible matches for later tab auto-navigation

                var tableRows = $(reportTable).find('tr.jira[jira_data]');

                var rowCount = tableRows.length;

                // 1) filter out rows that DON'T match the current search
                tableRows
                    .show()
                    .filter(function () {
                        var breakingChangesFail = (<HTMLInputElement>document.getElementById('breaking')).checked && $(this).attr("breaking") === undefined;
                        var deprecationsFail = (<HTMLInputElement>document.getElementById('deprecation')).checked && $(this).attr("deprecation") === undefined;

                        var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                        var searchTextFails = !~text.indexOf(searchCriteria);

                        // 2) store possible matches for later tab auto-navigation
                        rowCount += (breakingChangesFail || deprecationsFail || searchTextFails) ? -1 : 0;

                        return breakingChangesFail || deprecationsFail || searchTextFails;
                    })
                    .hide();

                var issueCount = rowCount;
                matchingIssueCount += issueCount;
                if (issueCount > 0) {
                    candidates.push(reportTable);
                }
            });

            $('.global-report-search-results').html(matchingIssueCount + ' matching issues');

            // highlight any matching tabs
            if (candidates.length > 0) {
                var tabIds = $(candidates)
                    .closest('.top-level-pane')
                    .map(function (index, candidate) {
                        return '#' + candidate.id;
                    });
                temporaryHighlight((<any>$).makeArray(tabIds));
            }

            // open tab if only a single match is found, or if only 1 tab has matches
            if (matchingIssueCount === 1 || $(candidates).length === 1) {
                var tabAnchor = $('.parentTabs .nav.nav-tabs a').filter(function (index, anchor) {
                    return (
                        $(anchor).attr('href') ===
                        '#' +
                        $(candidates[0])
                            .closest('.top-level-pane')
                            .attr('id')
                    );
                });

                $(tabAnchor[0]).click();
            }
        }

        // global issue search
        $('#global_search').keyup(function (event) {
            if (skipKey(event.key)) {
                return;
            }

            processSearchValue();
        });

        $("#fixVersionFilter").change(function () {
            processSearchValue();
        });

        $("#breaking").click(function () {
            processSearchValue();
        });
        $("#deprecation").click(function () {
            processSearchValue();
        });
        $("span[more-info]").click(function () {
            toggleMoreInfo($(this).attr("data-key"))
        });

        jQuery(function ($) {
            // /////
            // CLEARABLE INPUT
            function tog(v) {
                return v ? 'addClass' : 'removeClass';
            }

            $(document)
                .on('input', '.clearable', function () {
                    $(this)[tog(this.value)]('x');
                })
                .on('mousemove', '.x', function (e) {
                    $(this)[tog(this.offsetWidth - 18 < e.clientX - this.getBoundingClientRect().left)]('onX');
                })
                .on('touchstart click', '.onX', function (ev) {
                    ev.preventDefault();
                    $(this)
                        .removeClass('x onX')
                        .val('')
                        .change();
                    processSearchValue();
                });

            // register popovers
            (<any> $('[data-toggle=popover]')).popover({container: 'body'});
        });

        // more info rows
        function toggleMoreInfo(id) {
            $("#" + id).toggle();
        }
    });
});
