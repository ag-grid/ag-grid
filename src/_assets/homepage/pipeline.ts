import {$, lazyload, AnchorJS, Prism, initCookieDisclaimer} from '../common/vendor';

$(function() {
    $('#page-pipeline').each(function() {
        function debounce(func, wait, immediate = false) {
            var timeout;
            return function(_) {
                var context = this,
                    args = arguments;
                var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        }

        var temporaryHighlight = debounce(function(targetIds) {
            var tabAnchors = $('.parentTabs .nav.nav-tabs a').filter(function(index, anchor) {
                return targetIds.indexOf($(anchor).attr('href')) >= 0;
            });

            $(tabAnchors).addClass('search-highlight');
            setTimeout(function() {
                $(tabAnchors).removeClass('search-highlight');
            }, 500);
        }, 250);

        // show/hide tabs
        $('ul.nav-tabs a').click(function(e) {
            e.preventDefault();
            (<any>$(this)).tab('show');
        });

        function skipKey(key) {
            var ignore = ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'Shift', 'Control', 'Alt', 'Meta'];
            return ignore.indexOf(key) >= 0;
        }

        function processSearchValue(context) {
            var searchCriteria = $.trim($(context).val())
                .replace(/ +/g, ' ')
                .toLowerCase();
            if (!searchCriteria || searchCriteria === '') {
                $('table[id^=content_] tr').show();
                $('.global-report-search-results').html('');
                return;
            }

            var reportTables = $('table[id^=content_]');

            var candidates = [];

            var matchingIssueCount = 0;
            reportTables.each(function(index, reportTable) {
                // two parts to this
                // 1) filter out rows that DON'T match the current search
                // 2) store possible matches for later tab auto-navigation

                var tableRows = $(reportTable).find('tr.jira');

                // 1) filter out rows that DON'T match the current search
                tableRows
                    .show()
                    .filter(function() {
                        var text = $(this)
                            .text()
                            .replace(/\s+/g, ' ')
                            .toLowerCase();
                        return !~text.indexOf(searchCriteria);
                    })
                    .hide();

                // 2) store possible matches for later tab auto-navigation
                var matchingRows = tableRows.filter(function(index, row) {
                    var text = $(row)
                        .text()
                        .replace(/\s+/g, ' ')
                        .toLowerCase();
                    return text.indexOf(searchCriteria) >= 0;
                });

                var issueCount = matchingRows.length;
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
                    .map(function(index, candidate) {
                        return '#' + candidate.id;
                    });
                temporaryHighlight($.makeArray(tabIds));
            }

            // open tab if only a single match is found, or if only 1 tab has matches
            if (matchingIssueCount === 1 || $(candidates).length === 1) {
                var tabAnchor = $('.parentTabs .nav.nav-tabs a').filter(function(index, anchor) {
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
        $('#global_search').keyup(function(event) {
            if (skipKey(event.key)) {
                return;
            }

            processSearchValue(this);
        });

        jQuery(function($) {
            // /////
            // CLEARABLE INPUT
            function tog(v) {
                return v ? 'addClass' : 'removeClass';
            }

            $(document)
                .on('input', '.clearable', function() {
                    $(this)[tog(this.value)]('x');
                })
                .on('mousemove', '.x', function(e) {
                    $(this)[tog(this.offsetWidth - 18 < e.clientX - this.getBoundingClientRect().left)]('onX');
                })
                .on('touchstart click', '.onX', function(ev) {
                    ev.preventDefault();
                    $(this)
                        .removeClass('x onX')
                        .val('')
                        .change();
                    processSearchValue(this);
                });

            // register popovers
            (<any> $('[data-toggle=popover]')).popover({container: 'body'});
        });
    });
});
