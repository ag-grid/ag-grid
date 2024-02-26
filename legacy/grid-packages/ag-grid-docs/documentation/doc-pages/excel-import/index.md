---
title: "Excel Import"
---

Below we illustrate how you might import an Excel spreadsheet into AG Grid using a third-party library - in this example we're using [xlsx-style](https://github.com/protobi/js-xlsx).

In this example we're providing a simple Excel file for importing but in your application you could allow uploading of Excel files by end users.

The spreadsheet contains a few rows of simple data, which the example parses and sets as row data.

The spreadsheet can be downloaded [here](https://www.ag-grid.com/example-assets/olympic-data.xlsx).

## Example Import

<grid-example title='Import Excel into AG Grid' name='excel-import' type='typescript' options='{ "enterprise": true,"modules": ["clientside", "menu", "excel"], "exampleHeight": 500, "extras": ["xlsx-style"] }'></grid-example>