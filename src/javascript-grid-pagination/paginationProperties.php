<?php

$paginationProperties = [
    ['pagination',
        'True - <a href="../javascript-grid-pagination/">Pagination</a> is enabled.<br/>
         False (Default) - <a href="../javascript-grid-pagination/">Pagination</a> is disabled.'
    ],
    [
        'paginationPageSize',
        'Number. How many rows to load per page. Default value = 100. If <code>paginationAutoPageSize</code>
         is specified, this property is ignored.',
        'See example <a href="../javascript-grid-pagination/#customising-pagination">Customising Pagination</a>.'
    ]
    ,
    [
        'paginationAutoPageSize',
        'True - The number of rows to load per page is automatically adjusted by ag-Grid so each page
         shows enough rows to just fill the area designated for the grid.<br/>
         False (Default) - paginationPageSize is used.',
        'See example <a href="../javascript-grid-pagination/#auto-page-size">Auto Page Size</a>.'
    ],
    [
        'suppressPaginationPanel',
        'True - The out of the box ag-Grid controls for navigation are hidden. This is useful if
         <code>pagination=true</code> and you want to provide your own pagination controls.<br/>
         False (Default) - when <code>pagination=true</code> It automatically shows at the bottom the necessary
         controls so that the user can navigate through the different pages.',
        'See example <a href="../javascript-grid-pagination/#custom-pagination-controls">Custom Pagination Controls</a>.'
    ]
];


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