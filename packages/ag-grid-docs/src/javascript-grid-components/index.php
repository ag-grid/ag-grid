<?php
$pageTitle = "ag-Grid Components: An Overview";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It supports the use of components, this pge contains an overview of how to register these components and how to work with your chosen framework components.";
$pageKeyboards = "ag-Grid Components";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1> Components </h1>

<p class="lead">
    You can create your own custom components to customise the behaviour
    of the grid. For example you can customise how cells are rendered,
    how values are edited and also create your own filters.
</p>

<p>
    The full list of component types you can provide in ag-Grid are as follows:
    <ul>
        <li>
            <a href="../javascript-grid-cell-rendering-components/">Cell Renderer</a>:
            To customises the contents of a cell.
        </li>
        <li>
            <a href="../javascript-grid-cell-editor/">Cell Editor</a>:
            To customises editing of a cell.
        </li>
        <li>
            <a href="../javascript-grid-filter-component/">Filter Component</a>:
            For custom column filter that appears inside the column menu.
        </li>
        <li>
            <a href="../javascript-grid-floating-filter-component/">Floating Filter</a>:
            For custom column filter that appears inside the column menu.
        </li>
        <li>
            <a href="../javascript-grid-date-component/">Date Component</a>:
            To customise the date selection component in the date filter.
        </li>
        <li>
            <a href="../javascript-grid-header-rendering/">Header Component</a>:
            To customise the header of a column and column groups.
        </li>
        <li>
            <a href="../javascript-grid-overlay-component/">Overlay Component</a>:
            To customise loading and no rows overlay components.
        </li>
    </ul>
    The remainder of this page gives information that is common across all the component types.
</p>

        <h2>Registering Custom Components</h2>

        <p>
            The pages for each component type (cell renderer, cell editor etc) contain
            examples on how to register and use each component type. However it is useful here to step back
            and focus on the component registration process which is common across all component types
            and all frameworks (React, Angular etc).
        </p>

        <p>
            There are two ways to register custom components:
</p>
        <ol class="content">
            <li>By name.</li>
            <li>Direct reference.</li>
        </ol>

        <p>Both options are fully supported by the grid, however the preferred
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
        </p>

        <ul class="content">
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

        <h2>Registering Framework Components</h2>

        <p>
            Most of the frameworks ag-Grid works with use components. It is possible to use the framework
            components inside of ag-Grid. Configuring the components is same and explained in this section.
            The frameworks that follow this conventions are:
        </p>

        <ul class="content">
            <li><b>Angular</b> (version 2 and later)</li>
            <li><b>React</b></li>
            <li><b>VueJS</b></li>
            <li><b>Polymer</b></li>
        </ul>

        <p>The following frameworks are not configured in this way:</p>

        <ul class="content">
            <li>
                <b>AngularJS 1</b>: This framework does not follow the same pattern as other frameworks. See
                <a href="../best-angularjs-data-grid/#angular-compiling">AngularJS</a> on how you can turn on AngularJS
                1
                compiling to use AngularJS bindings inside ag-Grid.
            </li>
            <li><b>Aurelia</b>: Aurelia uses templates instead of components.</li>
        </ul>

        <p>
            If you are using one of the supported frameworks registration is done using the
            <code>frameworkComponents</code> property rather than the <code>components</code> property.
            Then the component is registered by name as normal.
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

        <h2>Summary of Component Registration</h2>

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
        </p>
        <ul class="content">
            <li>
                <b>Name / Direct JavaScript:</b> This can be: 1) A component name referring to a
                registered component (either plain JavaScript or framework component); 2) A direct
                reference to a JavaScript component.
            </li>
            <li>
                <b>Direct Framework:</b> A direct reference to a framework (React, Angular etc) component.
            </li>

        </ul>

        <table class="row-model-table reference">
            <tr class="first-row">
                <td>Component</td>
                <td>Where</td>
                <td>Name / Direct JavaScript</td>
                <td>Direct Framework</td>
            </tr>
            <tr class="item-row">
                <td>Detail Cell Renderer</td>
                <td>Grid Option</td>
                <td>detailCellRenderer</td>
                <td>detailCellRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Full Width Cell Renderer</td>
                <td>Grid Option</td>
                <td>fullWidthCellRenderer</td>
                <td>fullWidthCellRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Group Row Cell Renderer</td>
                <td>Grid Option</td>
                <td>groupRowRenderer</td>
                <td>groupRowRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Group Row Inner Cell Renderer</td>
                <td>Grid Option</td>
                <td>groupRowInnerRenderer</td>
                <td>groupRowInnerRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Loading Overlay</td>
                <td>Grid Option</td>
                <td>loadingOverlayRenderer</td>
                <td>loadingOverlayRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>No Rows Overlay</td>
                <td>Grid Option</td>
                <td>noRowsOverlayRenderer</td>
                <td>noRowsOverlayRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Date Component</td>
                <td>Grid Option</td>
                <td>dateComponent</td>
                <td>dateComponent<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Cell Renderer</td>
                <td>Column Definition</td>
                <td>cellRenderer</td>
                <td>cellRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Pinned Row Cell Renderer</td>
                <td>Column Definition</td>
                <td>pinnedRowCellRenderer</td>
                <td>pinnedRowCellRenderer<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Cell Editor</td>
                <td>Column Definition</td>
                <td>cellEditor</td>
                <td>cellEditor<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Filter</td>
                <td>Column Definition</td>
                <td>filter</td>
                <td>filter<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Floating Filter</td>
                <td>Column Definition</td>
                <td>floatingFilterComponent</td>
                <td>floatingFilterComponent<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Header Component</td>
                <td>Column Definition</td>
                <td>headerComponent</td>
                <td>headerComponent<b>Framework</b></td>
            </tr>
            <tr class="item-row">
                <td>Header Group Component</td>
                <td>Column Definition</td>
                <td>headerGroupComponent</td>
                <td>headerGroupComponent<b>Framework</b></td>
            </tr>
        </table>

        <h2>JavaScript or Framework</h2>

        <p>
            If you are using a framework, then you have a choice of the following:
        </p>    

        <ol class="content">
            <li>Provide an ag-Grid component in JavaScript.</li>
            <li>Provide an ag-Grid component as a framework component (eg React or Angular).</li>
        </ol>

        <p>
        For example if you want to build a cell renderer and you are using React, you have the choice
        to build the cell renderer using React or using plain JavaScript.
        </p>

        <p>
            If using a framework, you should first read how to build the component using plain JavaScript.
            This is because the framework specific component builds on what you learn from the JavaScript
            component.
        </p>

        <h2>Mixing JavaScript and Framework</h2>

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

        <h2>Grid Provided Components</h2>

        <p>
            The grid comes with pre-registered components that can be used. Each component
            provided by the grid starts with the namespaces 'ag' to minimise naming conflicts
            with user provided components. The full list of grid provided components are in
            the table below.
        </p>

        <table class="row-model-table reference">
            <tr class="first-row">
                <td colspan="2"><h3>Date Inputs</h3></td>
            </tr>

            <tr class="item-row">
                <td>agDateInput</td>
                <td>Default date input used by filters.</td>
            </tr>

            <tr class="first-row">
                <td colspan="2"><h3>Column Headers</h3></td>
            </tr>
            <tr class="item-row">
                <td>agColumnHeader</td>
                <td>Default column header.</td>
            </tr>
            <tr class="item-row">
                <td>agColumnHeaderGroup</td>
                <td>Default column group header.</td>
            </tr>

            <tr class="first-row">
                <td colspan="2"><h3>Column Filters</h3></td>
            </tr>
            <tr class="item-row">
                <td>agSetColumnFilter</td>
                <td>Set filter (default when using ag-Grid Enterprise).</td>
            </tr>
            <tr class="item-row">
                <td>agTextColumnFilter</td>
                <td>Simple text filter (default when using ag-Grid Free).</td>
            </tr>
            <tr class="item-row">
                <td>agNumberColumnFilter</td>
                <td>Number filter.</td>
            </tr>
            <tr class="item-row">
                <td>agDateColumnFilter</td>
                <td>Date filter.</td>
            </tr>

            <tr class="first-row">
                <td colspan="2"><h3>Floating Filters</h3></td>
            </tr>
            <tr class="item-row">
                <td>agSetColumnFloatingFilter</td>
                <td>Floating set filter.</td>
            </tr>
            <tr class="item-row">
                <td>agTextColumnFloatingFilter</td>
                <td>Floating text filter.</td>
            </tr>
            <tr class="item-row">
                <td>agNumberColumnFloatingFilter</td>
                <td>Floating number filter.</td>
            </tr>
            <tr class="item-row">
                <td>agDateColumnFloatingFilter</td>
                <td>Floating date filter.</td>
            </tr>

            <tr class="first-row">
                <td colspan="2"><h3>Cell Renderers</h3></td>
            </tr>
            <tr class="item-row">
                <td>agAnimateShowChangeCellRenderer</td>
                <td>Cell renderer that animates value changes.</td>
            </tr>
            <tr class="item-row">
                <td>agAnimateSlideCellRenderer</td>
                <td>Cell renderer that animates value changes.</td>
            </tr>
            <tr class="item-row">
                <td>agGroupCellRenderer</td>
                <td>Cell renderer for displaying group information.</td>
            </tr>
            <tr class="item-row">
                <td>agLoadingCellRenderer</td>
                <td>Cell editor for loading row when using Enterprise row model.</td>
            </tr>

            <tr class="first-row">
                <td colspan="2"><h3>Overlays</h3></td>
            </tr>
            <tr class="item-row">
                <td>agLoadingOverlay</td>
                <td>Loading overlay.</td>
            </tr>
            <tr class="item-row">
                <td>agNoRowsOverlay</td>
                <td>No rows overlay.</td>
            </tr>

            <tr class="first-row">
                <td colspan="2"><h3>Cell Editors</h3></td>
            </tr>
            <tr class="item-row">
                <td>agTextCellEditor</td>
                <td>Text cell editor.</td>
            </tr>
            <tr class="item-row">
                <td>agSelectCellEditor</td>
                <td>Select cell editor.</td>
            </tr>
            <tr class="item-row">
                <td>agRichSelectCellEditor<span class="enterprise-icon">e</span></td>
                <td>Rich select editor.</td>
            </tr>
            <tr class="item-row">
                <td>agPopupTextCellEditor</td>
                <td>Popup text cell editor.</td>
            </tr>
            <tr class="item-row">
                <td>agPopupSelectCellEditor</td>
                <td>Popup select cell editor.</td>
            </tr>
            <tr class="item-row">
                <td>agLargeTextCellEditor</td>
                <td>Large text cell editor.</td>
            </tr>

            <tr class="first-row">
                <td colspan="2"><h3>Master Detail</h3></td>
            </tr>
            <tr class="item-row">
                <td>agDetailCellRenderer<span class="enterprise-icon">e</span></td>
                <td>Detail panel for master / detail grid.</td>
            </tr>
        </table>

        <h3>Overriding Grid Components</h3>

        <p>
            It is also possible to override components. Where the grid uses a default value,
            this means the override component will be used instead. The default components,
            where overriding makes sense, are as follows:
        </p>

        <ul class="content">
            <li><b>agDateInput</b>: To change the default date selection across all filters.</li>
            <li><b>agColumnHeader</b>: To change the default column header across all columns.</li>
            <li><b>agColumnGroupHeader</b>: To change the default column group header across all columns.</li>
            <li><b>agLoadingCellRenderer</b>: To change the default loading cell renderer for Enterprise Row Model.</li>
            <li><b>agLoadingOverlay</b>: To change the default 'loading' overlay.</li>
            <li><b>agNoRowsOverlay</b>: To change the default loading 'no rows' overlay.</li>
            <li><b>agTextCellEditor</b>: To change the default text cell editor.</li>
            <li><b>agDetailCellRenderer</b>: To change the default detail panel for master / detail grids.</li>
        </ul>



<?php include '../documentation-main/documentation_footer.php'; ?>