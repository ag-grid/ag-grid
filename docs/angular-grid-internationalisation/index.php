<?php
$key = "Internationalisation";
$pageTitle = "Angular Grid Internationalisation";
$pageDescription = "You can change text used in different parts of the grid for Internationalisation. This page explains how to change languages via the grid options.";
$pageKeyboards = "Angular Grid Internationalisation";
include '../documentation_header.php';
?>

<div>

    <h2>Internationalisation</h2>

    <p>
        You can change the text in the paging panels and the default filters by providing a <i>localeText</i> to
        the <i>gridOptions</i>. The example below shows all the text that can be defined.
    </p>

    <pre>    $scope.gridOptions = {
        // note - we do not set 'virtualPaging' here, so the grid knows we are doing standard paging
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        columnDefs: columnDefs,
        localeText: {
            page: 'daPage',
            more: 'daMore',
            to: 'daTo',
            of: 'daOf',
            next: 'daNexten',
            last: 'daLasten',
            first: 'daFirsten',
            previous: 'daPreviousen',
            loadingOoo: 'daLoading...',
            // for set filter
            selectAll: 'daSelect Allen',
            searchOoo: 'daSearch...',
            blanks: 'daBlanc',
            // for number filter
            equals: 'daEquals',
            lessThan: 'daLessThan',
            greaterThan: 'daGreaterThan',
            applyFilter: 'daApplyFilter',
            filterOoo: 'daFilter...',
            // for text filter
            contains: 'daContains',
            startsWith: 'daStarts dawith',
            endsWith: 'daEnds dawith',
            // the header of the default group column
            group: 'laGroup',
            // tool panel
            columns: 'laColumns',
            pivotedColumns: 'laPivot Cols',
            pivotedColumnsEmptyMessage: 'la please drag cols to here',
            valueColumns: 'laValue Cols',
            valueColumnsEmptyMessage: 'la please drag cols to here'
        }
    };</pre>

    <show-example example="internationalisation"></show-example>
</div>

<?php include '../documentation_footer.php';?>