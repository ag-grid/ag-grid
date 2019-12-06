<?php

$exportProperties = [
    [
        "suppressQuotes",
        "By default cell values are encoded according to CSV format rules: values are wrapped in double quotes, and any
        double quotes within the values are escaped, so <code>my\"value</code> becomes <code>\"my\"\"value\"</code>. Pass
        true to insert the value into the CSV file without escaping. It is your responsibility to ensure that no cells
        contain the columnSeparator character."
    ],
    [
        "columnSeparator",
        "Delimiter to insert between cell values. Defaults to comma."
    ]
];


?>