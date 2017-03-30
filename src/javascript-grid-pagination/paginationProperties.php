<?php

$paginationProperties = [
    ['pagination',
    '<p>True - Pagination is enabled.</p><p>False (Default) - Pagination is disabled.</p>'
    ],
    ['paginationPageSize',
    '<p>Number. How many rows to load per page. Default value = 100. If <i>paginationAutoPageSize</i>
    is specified, this property is ignored</p>'],
    ['paginationAutoPageSize',
    '<p>True - The number of rows to load per page is automatically adjusted by ag-Grid so each page
    shows enough rows to just fill the area designated for the grid.</p>
    
    <p>False (Default) - paginationPageSize is used.</p>'],
    ['suppressPaginationPanel',
    '<p>True - The out of the box ag-Grid controls for navigation are hidden. This is useful if
    <i>pagination=true</i> and you want to provide your own pagination controls.</p>
    <p>False (Default) - when <i>pagination=true</i> It automatically shows at the bottom the necessary
    controls so that the user can navigate through the different pages.</p>'],
    ['paginationStartPage',
    '<p>Number. The starting page that will be shown by ag-Grid. If this number
    is greater than the maximum number of pages, ag-Grid will place the user in the last page.</p>']
];


$paginationApi = [
    ['paginationIsLastPageFound()',
        '<p>Returns true when last page known. This will always be true if you are using the in memory row model
        for pagination.</p>
        <p>Returns false when last page now known. This only happens when using infinite scrolling row model.</p>'],
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
?>