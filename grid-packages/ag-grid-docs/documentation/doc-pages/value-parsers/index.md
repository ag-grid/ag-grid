---
title: "Parsing Values"
---

After editing cells in the grid you have the opportunity to parse the value before inserting it into your data. This is done using Value Parsers.

For example suppose you are editing a number using the default editor. The result will be a String, however you will probably want to store the result as a number. Use a Value Parser to convert the String to a Number.

<snippet spaceBetweenProperties="true">
const gridOptions = {
    columnDefs: [
        {
            // name is a string, so don't need to convert
            field: 'name',
            editable: true,
        },
        {
            // age is a number, so want to convert from string to number
            field: 'age',
            editable: true,
            valueParser: params => Number(params.newValue)
        }
    ]
}
</snippet>

<api-documentation source='column-properties/properties.json' section="editing" names='["valueParser"]' ></api-documentation>

The return value of a value parser should be the result of the parse, i.e. return the value you want stored in the data.

Below shows an example using value parsers. The following can be noted:

- All columns are editable. After any edit, the console prints the new data for that row.
- Column 'Name' is a string column. No parser is needed.
- Column 'Bad Number' is bad because after an edit, the value is stored as a string in the data, whereas the data value should be number type.
- Column 'Good Number' is good because after an edit, the value is converted to a number using the value parser.

<grid-example title='Value Parsers' name='example-parsers' type='generated' options='{ "exampleHeight": 550 }'></grid-example>
