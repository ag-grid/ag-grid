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

        <h1>Specifying Custom Components</h1>

        <p>
            The pages for each component type (cell renderer, cell editor etc) contain details and
            examples on how to register each component type. However it is useful here to step back
            and focus on the component registration process which is common across all component types.
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
            grid property contains a map of 'component names' to 'components classes'.
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

        <h1>Specifying Framework Components</h1>

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

    </div>

<?php include '../documentation-main/documentation_footer.php'; ?>