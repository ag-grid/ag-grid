<div>

    <h2 id="implementing-the-web-components-datagrid">
        <img src="../images/svg/docs/getting_started.svg" width="50"/>
        <img style="vertical-align: middle" src="../images/webComponents.png" height="25px"/>
        Getting Started
    </h2>

    <?php include 'ag-grid-dependency.php' ?>

    <p>
        <a href="http://webcomponents.org/">Web Components</a> are reusable user interface widgets that are created
        using open Web technology. They are part of the browser and so they do not depend on external libraries
        such as AngularJS 1.x or JQuery.
    </p>
    <p>
        Web Components are of particular interest to ag-Grid as I see them as the future for reusable components.
        A true Web Component will be reusable in any framework. Angular's directives are based on Web Components.
    </p>
    <note>
        Web components are an emerging technology and not available in all browsers. Some browsers lacking support
        can be plugged using polyfills. The examples on this page use
        <a href="http://cdnjs.com/libraries/webcomponentsjs">webcomponent.js</a>
        polyfill from Google. The examples on this page have been tested to work with latest versions of Chrome
        and Firefox on Windows. They failed using IE 11 and Safari on Windows. I have not done extensive testing
        on which browsers Web Components as what browsers support Web Components and which don't is not a grid
        problem / discussion, it's specific to Web Components. If you are going to use Web Components in your
        application, then which browsers your application will run on is a big question you need to answer for
        yourself.
    </note>

    <h4 id="using-ag-grid-web-component">Using ag-Grid Web Component</h4>


    <p>
        When using Web Components, you have the choice of using the bundled version of ag-Grid
        or the CommonJS version.
    </p>
    <p>
        When the ag-Grid script loads, it does not register the Web Component. This is because the
        Web Component is an optional part of ag-Grid and you need to tell ag-Grid you
        want to use it.
    </p>

    <snippet>
        // get ag-Grid to install the web component
        agGrid.initialiseAgGridWithWebComponents();
    </snippet>

    <p>
        ag-Grid registers as a tag named 'ag-grid'. To insert a grid into your application, use the
        ag-grid tag and then either provide the grid options through Javascript or provide options
        through html attributes.
    </p>

    <p>
        HTML Code:
        <snippet>
            &lt;ag-grid id="myGrid"&gt;&lt;/ag-grid&gt;
        </snippet>
        Javascript Code:<br/>
        <snippet>
            var myGrid = document.querySelector('#myGrid');
            myGrid.setGridOptions(gridOptions);
        </snippet>
    </p>

    <h2 id="basic-web-components-example">Basic Web Components Example</h2>

    <p>
        The example below shows a simple grid using Web Components.
    </p>

    <h2 id="destroy">Destroy</h2>

    <p>
        To get the grid to release resources, call api.destroy(). If you do not do this, old grids will hang around
        and add to a memory leak problem in your application.
    </p>

</div>
