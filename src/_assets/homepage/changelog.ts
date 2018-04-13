import {$} from '../common/vendor';

$(function () {
    $('#page-changelog').each(function () {
        // show/hide tabs
        $('ul.nav-tabs a').click(function (e) {
            e.preventDefault();
            (<any>$(this)).tab('show');
        });

        function skipKey(key) {
            var ignore = ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'Shift', 'Control', 'Alt', 'Meta'];
            return ignore.indexOf(key) >= 0;
        }

        function displayFixVersionInformation(fixVersion) {
            const underscoredId = fixVersion.split('.').join('_');

            // NOTE!! This will _only_ work for 17.1.0 - to be made more generic post release
            $("#fixVersion_info_16_0_0").hide()
            $("#fixVersion_info_17_1_0").hide()

            if(fixVersion !== 'All Versions') {
                $(`#fixVersion_info_${underscoredId}`).show()
            }
        }
        
        function processSearchValue() {
            var value = (<any>document.getElementById('global_search')).value;
            var searchCriteria = (<any>$).trim(value).replace(/ +/g, ' ').toLowerCase();

            var reportTable = $("table[id^=content_]")[0];

            // hide the more info rows
            $(reportTable).find("tr.jira-more-info").hide();

            var tableRows = $(reportTable).find("tr.jira[jira_data]");

            // 1) filter out rows that DON'T match the current search
            tableRows
                .show()
                .filter(function () {
                    var selectedFixVersion = $('#fixVersionFilter').find(":selected").text();
                    selectedFixVersion = selectedFixVersion === 'All Versions' ? '' : selectedFixVersion;

                    var breakingChangesFail = (<HTMLInputElement>document.getElementById('breaking')).checked && $(this).attr("breaking") === undefined;
                    var deprecationsFail = (<HTMLInputElement>document.getElementById('deprecation')).checked && $(this).attr("deprecation") === undefined;

                    var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                    var searchTextFails = !~text.indexOf(searchCriteria);

                    var fixVersionFails = false;
                    if (!searchTextFails) {
                        var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
                        fixVersionFails = !~text.indexOf(selectedFixVersion);
                    }

                    return fixVersionFails || breakingChangesFail || deprecationsFail || searchTextFails;
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

        $("#fixVersionFilter").change(function () {
            processSearchValue();
            displayFixVersionInformation($("#fixVersionFilter").val())
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
        });

        // more info rows
        function toggleMoreInfo(id) {
            $("#" + id).toggle();
        }

        processSearchValue();
        displayFixVersionInformation($("#fixVersionFilter").val())
    });
});
