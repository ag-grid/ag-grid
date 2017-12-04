<?php

$excelCell = [
    ['styleId',
    '<p>(Optional) The associated excel style Id to be applied to this cell. This MUST be an existing excel style in your
    <i>gridOptions</i> definition</p>'
    ],
    ['data',
    '<p>An object of type ExcelData. See section below.</p>'],
    ['mergeAcross',
    '<p>(Optional). The number of cells to span across</p>']
];


$excelData = [
    ['type',
        '<p>One of {String, Number}. This is case sensitive</p> '],
    ['value',
        '<p>The value to show in the cell</p>']
];
?>