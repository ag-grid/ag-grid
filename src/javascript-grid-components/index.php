<?php
$key = "Components";
$pageTitle = "ag-Grid Components";
$pageDescription = "ag-Grid Components";
$pageKeyboards = "ag-Grid Components";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

    <div>

        <h1 class="first-h1" id="Components">
            <img src="../images/svg/docs/components.svg" width="50"/>
            Components
        </h1>

        <p>
            You can create your own custom components to customise the behaviour
            of the grid. For example you can customise how cells are rendered,
            how values are edited and also create your own filters.
        </p>

        <note>
            <p>
            </p>
            <p>
                An ag-Grid cell renderer Component does not need to extend any class or do anything except implement the
                methods shown in the interface.
            </p>
        </note>

        <p>
            The following sections show how to use your own components inside the grid.
        </p>

        <div class="row">
            <div class="col-md-6">
                <div class="list-group">

                    <a href="../javascript-grid-cell-rendering-components/" class="list-group-item">
                        <div class="float-parent">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Cell Renderer</h3>
                            <p class="list-group-item-text">
                                A cell renderer customises the contents of a cell.
                            </p>
                        </div>
                    </a>

                </div>
            </div>

            <div class="col-md-6">
                <div class="list-group">

                    <a href="../javascript-grid-cell-editor/" class="list-group-item">
                        <div class="float-parent">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Cell Editor</h3>
                            <p class="list-group-item-text">
                                A cell editor customises the editing of a cell.
                            </p>
                        </div>
                    </a>

                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="list-group">
                    <a href="../javascript-grid-filter-component/" class="list-group-item">
                        <div class="float-parent" style="display: block;">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Filter Component</h3>
                            <p class="list-group-item-text">
                                For custom column filter that appears inside the column menu.
                            </p>
                        </div>
                    </a>

                </div>
            </div>

            <div class="col-md-6">
                <div class="list-group">
                    <a href="../javascript-grid-floating-filter-component/" class="list-group-item">
                        <div class="float-parent" style="display: block;">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Floating Filter Component</h3>
                            <p class="list-group-item-text">
                                For custom column floating filters that display in the header area.
                            </p>
                        </div>
                    </a>

                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="list-group">

                    <a href="../javascript-grid-date-component/" class="list-group-item">
                        <div class="float-parent">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Date Component</h3>
                            <p class="list-group-item-text">
                                To customise the date selection component in the date filter.
                            </p>
                        </div>
                    </a>

                </div>
            </div>

            <div class="col-md-6">
                <div class="list-group">

                    <a href="../javascript-grid-header-rendering/" class="list-group-item">
                        <div class="float-parent">
                            <div class="section-icon-container">
                                <img src="../images/components.png" width="50" />
                            </div>
                            <h3 class="list-group-item-heading">Header Component</h3>
                            <p class="list-group-item-text">
                                To customise column headers, including column groups.
                            </p>
                        </div>
                    </a>

                </div>
            </div>
        </div>

        <h1 id="registering-custom-components">Registering Custom Components</h1>

        <p>
            The pages for each component type (cell renderer, cell editor etc) contain
            examples on how to register and use each component type. However it is useful here to step back
            and focus on the component registration process which is common across all component types
            and all frameworks (React, Angular etc).
        </p>

        <p>
            There are two ways to register custom components:
            <ol>
                <li>By name.</li>
                <li>Direct reference.</li>
            </ol>
            Both options are fully supported by the grid, however the preferred
            options is by name as it's more flexible. All of the examples in the documentation
            use this approach. The direct reference approach is kept for backwards
            compatibility reasons as this was the original way to do it in ag-Grid.
        </p>

        <h3>1. By Name</h3>

        <p>
            A component is registered with the grid by providing it through the
            <code>components</code> grid property. The <code>components</code>
            grid property contains a map of 'component names' to 'component classes'.
            Components of all types (editors, renderers, filters etc) are
            all stored together and must have unique names.
        </p>

        <snippet>
gridOptions = {

    // register the components using 'components' grid property
    components: {
        // 'countryCellRenderer' is mapped to class CountryCellRenderer
        countryCellRenderer: CountryCellRenderer,
        // 'countryFilter' is mapped to class CountryFilter
        countryFilter: CountryFilter
    },

    // then refer to the component by name
    columnDefs: [
        {
            field: 'country',
            cellRenderer: 'countryCellRenderer',
            filter: 'countryFilter'
        },
    ],

    ...
}</snippet>

        <h3>2. Direct Reference</h3>

        <p>
            A shorter approach is to refer to the component class directly.
        </p>
<snippet>
gridOptions = {

    // then refer to the component by name
    columnDefs: [
        {
            field: 'country',
            cellRenderer: CountryCellRenderer,
            filter: CountryFilter
        },
    ],

    ...
}</snippet>

        <h3>Advantages of By Name</h3>

        <p>
            Registering components by name has the following advantages:
            <ul>
                <li>
                    Implementations can change without having to change all the column definitions.
                    For example, you may have 20 columns using a currency cell renderer. If you want
                    to update the cell renderer to another currency cell renderer, you only need to
                    do it in only place (where the cell renderer is registered) and all columns
                    will pick up the new implementation.
                </li>
                <li>
                    The part of the grid specifying column definitions is plain JSON. This is helpful
                    for applications that read column definitions from static data. If you referred
                    to the class name directly inside the column definition, it would not be possible
                    to convert the column definition to JSON.
                </li>
            </ul>
        </p>

        <h1>Registering Framework Components</h1>

        <p>
            If you are using a framework such as Angular or React, it is possible to provide
            components in those frameworks. This is done by using the <code>frameworkComponents</code>
            property rather than the <code>components</code> property. Then the component is registered
            by name as normal.
        </p>
<snippet>
gridOptions = {

    // use frameworkComponents instead of components. most frameworks will allow you
    // to specify this as a bound property.
    frameworkComponents: {
        countryCellRenderer: AngularCountryCellRenderer,
        countryFilter: AngularCountryFilter
    },

    // then refer to the component by name as before
    columnDefs: [
        {
            field: 'country',
            cellRenderer: 'countryCellRenderer',
            filter: 'countryFilter'
        },
    ],

    ...
}</snippet>

        <p>
            You can also refer to the component classes directly using the <code>framework</code>
            variant of the property. For example instead of using <code>cellRenderer</code>
            you use <code>cellRendererFramework</code>.
        </p>

<snippet>
gridOptions = {

    // then refer to the component by name
    columnDefs: [
        {
            field: 'country',
            cellRendererFramework: CountryCellRenderer,
            filterFramework: CountryFilter
        },
    ],

    ...
}</snippet>

        <h1>Summary of Component Registration</h1>

        <p>
            Here we give an overview, as there is a lot of similar sounding information above.
        </p>

        <p>
            The grid options has the following properties for registering components:
        </p>

        <?php include 'componentProperties.php' ?>

        <h3>Component Registration</h3>

        <?php printPropertiesTable($componentRegistrationGridOptions) ?>

        <h3>Component Usage</h3>

        <p>
            The below table gives an overview of where components can be used. The table shows
            both options for usage:
            <ul>
            <li>
                <b>Name / Direct JavaScript:</b> This can be: 1) A component name referring to a
                registered component (either plain JavaScript or framework component); 2) A direct
                reference to a JavaScript component.
            </li>
            <li>
                <b>Direct Framework:</b> A direct reference to a framework (React, Angular etc) component.
            </li>

        </ul>
        </p>

        <table class="row-model-table">
            <tr class="first-row">
                <td>Component</td><td>Where</td><td>Name / Direct JavaScript</td><td>Direct Framework</td>
            </tr>
            <tr class="item-row">
                <td>Detail Cell Renderer</td><td>Grid Option</td><td>detailCellRenderer</td><td>detailCellRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Full Width Cell Renderer</td><td>Grid Option</td><td>fullWidthCellRenderer</td><td>fullWidthCellRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Group Row Cell Renderer</td><td>Grid Option</td><td>groupRowRenderer</td><td>groupRowRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Group Row Inner Cell Renderer</td><td>Grid Option</td><td>groupRowInnerRenderer</td><td>groupRowInnerRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Loading Overlay</td><td>Grid Option</td><td>loadingOverlayRenderer</td><td>loadingOverlayRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>No Rows Overlay</td><td>Grid Option</td><td>noRowsOverlayRenderer</td><td>noRowsOverlayRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Date Component</td><td>Grid Option</td><td>dateComponent</td><td>dateComponent<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Cell Renderer</td><td>Column Definition</td><td>cellRenderer</td><td>cellRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Pinned Row Cell Renderer</td><td>Column Definition</td><td>pinnedRowCellRenderer</td><td>pinnedRowCellRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Cell Editor</td><td>Column Definition</td><td>cellEditor</td><td>cellEditor<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Filter</td><td>Column Definition</td><td>filter</td><td>filter<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Floating Filter</td><td>Column Definition</td><td>floatingFilterComponent</td><td>floatingFilterComponent<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Header Component</td><td>Column Definition</td><td>headerComponent</td><td>headerComponent<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Header Group Component</td><td>Column Definition</td><td>headerGroupComponent</td><td>headerGroupComponent<b>Framework</b></td>
            </tr>
        </table>

        <h1>JavaScript or Framework</h1>

        <p>
            If you are using a framework, then you have a choice of the following:
            <ol>
                <li>Provide an ag-Grid component in JavaScript.</li>
                <li>Provide an ag-Grid component as a framework component (eg React or Angular).</li>
            </ol>
            For example if you want to build a cell renderer and you are using React, you have the choice
            to build the cell renderer using React or using plain JavaScript.
        </p>

        <p>
            If using a framework, you should first read how to build the component using plain JavaScript.
            This is because the framework specific component builds on what you learn from the JavaScript
            component.
        </p>

        <h1>Mixing JavaScript and Framework</h1>

        <p>
            It is possible to mix JavaScript and framework components in the same application.
            The following code snippet shows how such can be configured:
        </p>

        <snippet>
gridOptions = {

    // JavaScript components registered here
    components: {
        countryFilter: CustomCountryFilter
    },

    // Framework components registered here
    frameworkComponents: {
        countryCellRenderer: CountryCellRenderer
    },

    columnDefs: [ {
        field: 'country',

        // filter is a registered plain JavaScript component
        filter: 'countryFilter',

        // cell renderer is a registered framework (React, Angular etc) component
        cellRenderer: 'countryCellRenderer'
    } ]
};</snippet>

    </div>

<?php include '../documentation-main/documentation_footer.php'; ?>