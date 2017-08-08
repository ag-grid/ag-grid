<?php
$key = "Reference Data";
$pageTitle = "ag-Grid Reference Data";
$pageDescription = "This page explains how to use Value Handlers in ag-Grid with Reference Data";
$pageKeyboards = "ag-Grid Value Handlers";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>
    <h1 class="reference-data" id="value-getters">Reference Data</h1>
    <p>
        This section describes two different strategies for managing reference data in your application. Both approaches
        implement the same grid example so they can be easily compared.
    </p>

    <note>
        The term <i>Reference Data</i> is used here in a general way to describe data which can be defined using a key /
        value pair relationship (i.e. "tyt": "Toyota"). This data is typically static in nature, i.e. it is not expected
        to change between server requests.
    </note>

    <p>
        The examples contained within this section use the following reference data. Note that the data returned from
        the server only contains codes (keys) which must be mapped to names (values) for display purposes.
    </p>

    <pre><span class="codeComment">// data from server</span>
var rowData = [
    {make: "tyt", exteriorColour: "fg", interiorColour: "bw", price: 35000},
    {make: "frd", exteriorColour: "bw", interiorColour: "cb", price: 32000},
        ...
]

<span class="codeComment">// supporting reference data</span>
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

</pre>
    <h2 id="reference-data-with-value-handlers">Using Value Handlers</h2>

    <p>
        Value Handlers can be used to map keys contained within the row data to their corresponding display values. This
        approach involves more coding but allows for different data formats and offers more flexibility managing the data.
    </p>

    <p>
        The main idea of this approach is to use a <code>valueFormatter</code> to convert the code (key) to a value which is
        displayed in the cell. Then use a <code>valueParser</code> to convert the name back to a code (key) when saving it down
        into the underlying data.
    </p>

<pre>{
    headerName: "Make",
    field: "make",
    cellEditor: "select",
    cellEditorParams: {
        values: extractValues(carMappings)
    },
    valueFormatter: function (params) {
        <span class="codeComment">// convert code to value</span>
        return lookupValue(carMappings, params.value);
    },
    valueParser: function (params) {
        <span class="codeComment">// convert value to code</span>
        return lookupKey(carMappings, params.newValue);
    }
}</pre>

    <note>
        When editing using Cell Editors it's important to ensure the underlying data is updated with the codes (keys) rather than
        the values that are displayed in the cells.
    </note>

    <h2 id="reference-data-with-ref-data-prop">Using the 'refData' property</h2>

    <p>
        Here we present the same grid example but this time using the <code>refData</code> ColDef property. This approach
        requires less coding and is more straightforward, however it may not be flexible enough for scenarios involving
        more complex reference data formats.
    </p>

    <p>
        All that is required with this approach is to specify the <code>refData</code> and the grid will take care of the rest, as shown below:
    </p>

    <pre>{
    headerName: "Make",
    field: "make",
    cellEditor: "select",
    cellEditorParams: {
       values: extractValues(carMappings)
    },
    refData: carMappings <span class="codeComment">// just required to specify refData!</span>
}</pre>


    <p>Like in the previous example using <i>Value Handlers</i>, where the underlying data contains codes, the grid will
       use the specified reference data to display the associated values in the cells and save down the codes (keys) in
       the data when editing.
    </p>


    <h2 id="example-reference-data-with-value-handlers">Example - Value Handlers</h2>

    <p>
        The following example demonstrates how <i>Value Handlers</i> can be combined to work with reference data:
    </p>

    <ul>
        <li>
            <b>'Make' Column:</b> uses the built-in 'select' <i>Cell Editor</i>. Mapped names are displayed in the drop
            down list and selections are saved as 'make' codes in the underlying data.
        </li>
        <li>
            <b>'Exterior Colour' Column:</b> uses the built-in 'richSelect' <i>Cell Editor</i>. Mapped names are displayed
            in the drop down list and selections are saved as 'colour' codes in the underlying data.
        </li>
        <li>
            <b>'Interior Colour' Column:</b> uses a <i>Text Cell Editor</i>. Mapped names are displayed in the cells and
            edited values are saved as 'colour' codes in the underlying data. (Note a valid name must be entered).
        </li>
        <li>
            <b>Set Filters:</b> display a list of names rather than codes.
        </li>
        <li>
            <b>'Price' Columns:</b> additionally demonstrate the use of <code>valueGetter's</code> and <code>valueSetter's</code>.
        </li>
    </ul>

    <show-example example="exampleRefDataWithValueHandlers"></show-example>

    <h2 id="example-reference-data-with-ref-data-prop">Example - 'refData' Property</h2>

    <p>
        The following example demonstrates how the <code>refData</code> property simplifies working with reference data:
    </p>

    <ul>
        <li>
            <b>'Make' Column:</b> uses the built-in 'select' <i>Cell Editor</i> with the <code>refData</code> property specified.
            Mapped names are displayed in the drop down list and selections are saved as 'make' codes in the underlying data.
        </li>
        <li>
            <b>'Exterior Colour' Column:</b> uses the built-in 'richSelect' <i>Cell Editor</i> with the <code>refData</code>
            property specified. Mapped names are displayed in the drop down list and selections are saved as 'colour' codes
            in the underlying data.
        </li>
        <li>
            <b>'Interior Colour' Column:</b> uses a <i>Text Cell Editor</i> with the <code>refData</code> property specified.
            Mapped names are displayed in the cells and edited values are saved as 'colour' codes in the underlying data.
            (Note a valid name must be entered).
        </li>
        <li>
            <b>Set Filters:</b> display a list of names rather than codes.
        </li>
        <li>
            <b>'Price' Columns:</b> additionally demonstrate the use of <code>valueGetter's</code> and <code>valueSetter's</code>.
        </li>
    </ul>

    <show-example example="exampleRefDataProperty"></show-example>
</div>

<?php include '../documentation-main/documentation_footer.php';?>