<?php

$paginationApi = [
    ['paginationIsLastPageFound()',
        '<p>Returns true when last page known. This will always be true if you are using the Client-side Row Model
        for pagination.</p>
        <p>Returns false when last page now known. This only happens when using Infinite Scrolling Row Model.</p>'],
    ['paginationGetPageSize()',
        '<p>How many rows ag-Grid is showing per page.</p>'],
    ['paginationSetPageSize(newPageSize)',
        '<p>Sets the <i>paginationPageSize</i> to <i>newPageSize</i> Then it repaginates the grid so the changes
        are applied immediately on the screen.</p>'],
    ['paginationGetCurrentPage()',
        '<p>Returns the 0 index based page which ag-Grid is showing right now.</p>'],
    ['paginationGetTotalPages()',
        '<p>Returns the total number of pages. If <i>paginationIsLastPageFound() == false</i> returns null.</p>'],
    ['paginationGetRowCount()',
        '<p>The total number of rows. If <i>paginationIsLastPageFound() == false</i> returns null.</p>'],
    ['paginationGoToPage(pageNumber)',
        '<p>Goes to the specified page. If the page requested doesn\'t exist, it will go to the last
            page.</p>'],
    ['paginationGoToNextPage()<br>paginationGoToPreviousPage()<br>paginationGoToFirstPage()<br>paginationGoToLastPage()',
        '<p>Shorthands for <i>goToPage(relevantPageNumber)</i>.</p>']
];

$paginationCallbacks = [
    ['paginationNumberFormatter(params)',
        'Allows user to format the numbers in the pagination panel, ie \'row count\' and \'page number\' labels.
                This is for pagination panel only, to format numbers inside the grid\'s cells (ie your data), then
                use <code>valueFormatter</code> in the column definitions.']
];
?>