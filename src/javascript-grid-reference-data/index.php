<?php
$pageTitle = "ag-Grid Reference: Reference Data";
$pageDescription = "ag-Grid is a feature-rich data grid supporting major JavaScript Frameworks. One such feature is Reference Data. Use Reference Data for easier editing of data that uses reference data for display. For example, country codes e.g. {IE, UK, USA} with display values e.g. {Ireland, Great Britain, United States of America}). Version 17 is available for download now, take it for a free two month trial.";
$pageKeyboards = "ag-Grid Value Handlers";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


    <h1>Reference Data</h1>

    <p class="lead">
        This section describes two different strategies for managing reference data in your application. Both approaches
        implement the same grid example so they can be easily compared.
    </p>

    <note>
        The term <strong>Reference Data</strong> is used here in a general way to describe data which can be defined using a key /
        value pair relationship (i.e. <code>"tyt": "Toyota"</code>). This data is typically static in nature, i.e. it is not expected
        to change between server requests.
    </note>

    <p>
        The examples contained within this section use the following reference data. Note that the data returned from
        the server only contains codes (keys) which must be mapped to names (values) for display purposes.
    </p>

    <snippet>
// data from server
var rowData = [
    {make: "tyt", exteriorColour: "fg", interiorColour: "bw", price: 35000},
    {make: "frd", exteriorColour: "bw", interiorColour: "cb", price: 32000},
        ...
]

// supporting reference data
var carMappings = {
     "tyt": "Toyota",
     "frd": "Ford",
     "prs": "Porsche",
     "nss": "Nissan"
};
var colourMappings = {
     "cb": "Cadet Blue",
     "bw": "Burlywood",
     "fg": "Forest Green"
};
</snippet>
    <h2 id="reference-data-with-value-handlers">Using Value Handlers</h2>

    <p>
        Value Handlers can be used to map keys contained within the row data to their corresponding display values. This
        approach involves more coding but allows for different data formats and offers more flexibility managing the data.
    </p>

    <p>
        The main idea of this approach is to use a <code>valueFormatter</code> to convert the code (key) to a value which
        is displayed in the cell. Then use a <code>valueParser</code> to convert the name back to a code (key) when saving
        it down into the underlying data.
    </p>

<snippet>
{
    headerName: "Make",
    field: "make",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
        values: extractValues(carMappings)
    },
    valueFormatter: function (params) {
        // convert code to value
        return lookupValue(carMappings, params.value);
    },
    valueParser: function (params) {
        // convert value to code
        return lookupKey(carMappings, params.newValue);
    }
}</snippet>

    <note>
        When editing using Cell Editors it's important to ensure the underlying data is updated with the codes (keys) rather
        than the values that are displayed in the cells.
    </note>


    <p>
      When using the <code>TextCellEditor</code> with reference data, you may want to display the formatted text rather
      than the code. In this case you should also include the <code>useFormatter</code> property as follows:
    </p>

<snippet>
cellEditor: 'agTextCellEditor',
cellEditorParams: {
   useFormatter: true
}</snippet>

    <h2 id="reference-data-with-ref-data-prop">Using the 'refData' property</h2>

    <p>
        Here we present the same grid example but this time using the <code>refData</code> ColDef property. This approach
        requires less coding and is more straightforward, however it may not be flexible enough for scenarios involving
        more complex reference data formats.
    </p>

    <p>
        All that is required with this approach is to specify the <code>refData</code> and the grid will take care of the rest,
        as shown below:
    </p>

    <snippet>
{
    headerName: "Make",
    field: "make",
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
       values: extractValues(carMappings)
    },
    refData: carMappings // just required to specify refData!
}</snippet>

    <p>Like in the previous example using <code>Value Handlers</code>, where the underlying data contains codes, the grid will
       use the specified reference data to display the associated values in the cells and save down the codes (keys) in
       the data when editing.
    </p>

    <h2 id="example-reference-data-with-value-handlers">Example - Value Handlers</h2>

    <p>
        The following example demonstrates how <code>Value Handlers</code> can be combined to work with reference data:
    </p>

    <ul class="content">
        <li>
            <b>'Make' Column:</b> uses the built-in 'select' <code>Cell Editor</code>. Mapped names are displayed in the drop
            down list and selections are saved as 'make' codes in the underlying data.
        </li>
        <li>
            <b>'Exterior Colour' Column:</b> uses the built-in 'richSelect' <code>Cell Editor</code>. Mapped names are displayed
            in the drop down list and selections are saved as 'colour' codes in the underlying data.
        </li>
        <li>
            <b>'Interior Colour' Column:</b> uses a <code>Text Cell Editor</code> with <code>useFormatter=true</code>. Mapped
            names are displayed in the cells and edited values are saved as 'colour' codes in the underlying data.
            (Note a valid name must be entered).
        </li>
        <li>
            <b>Set Filters:</b> display a list of names rather than codes.
        </li>
        <li>
            <b>'Price' Columns:</b> additionally demonstrate the use of <code>valueGetters</code> and <code>valueSetters</code>.
        </li>
    </ul>

    <?= example('Value Handlers', 'ref-data-value-handler', 'generated', array("enterprise" => 1)) ?>

    <h2 id="example-reference-data-with-ref-data-prop">Example - 'refData' Property</h2>

    <p>
        The following example demonstrates how the <code>refData</code> property simplifies working with reference data:
    </p>

    <ul class="content">
        <li>
            <b>'Make' Column:</b> uses the built-in 'select' <code>Cell Editor</code> with the <code>refData</code> property specified.
            Mapped names are displayed in the drop down list and selections are saved as 'make' codes in the underlying data.
        </li>
        <li>
            <b>'Exterior Colour' Column:</b> uses the built-in 'richSelect' <code>Cell Editor</code> with the <code>refData</code>
            property specified. Mapped names are displayed in the drop down list and selections are saved as 'colour' codes
            in the underlying data.
        </li>
        <li>
            <b>'Interior Colour' Column:</b> uses a <code>Text Cell Editor</code> with the <code>refData</code> property specified.
            Mapped names are displayed in the cells and edited values are saved as 'colour' codes in the underlying data.
            (Note a valid name must be entered).
        </li>
        <li>
            <b>Set Filters:</b> display a list of names rather than codes.
        </li>
        <li>
            <b>'Price' Columns:</b> additionally demonstrate the use of <code>valueGetters</code> and <code>valueSetters</code>.
        </li>
    </ul>

    <?= example('Ref Data Property', 'ref-data-property', 'generated', array("enterprise" => 1)) ?>

<?php include '../documentation-main/documentation_footer.php';?>