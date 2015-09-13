<?php
$key = "Angular 2";
$pageTitle = "Angular 2 Data Grid";
$pageDescription = "This page describes how to use ag-grid (Angular Grid) with Angular 2.";
$pageKeyboards = "AngularJS Angular 2 Data Grid";
include '../documentation_header.php';
?>

<div>

    <h2>Angular 2</h2>

    <p>
        Below shows ag-Grid working with Angular 2. This is work in progress pending my learning and
        also Angular 2 still not released. The intent of presenting it here is so you can see
        how progress is coming along.
    </p>

    <show-example example="exampleNg2"></show-example>

    <h2>Notes on Angular 2 and ag-Grid</h2>

    <h4>Selector is 'ag-grid-ng2'</h4>

    <p>
        The component selector is 'ag-grid-ng2'. This is to avoid any name clash with Angular 1 or Web Components.
        That means you put a grid into your markup as follows:
    </p>
    <pre><code>&lt;ag-grid-ng2 [gridOptions]="gridOptions"></code></pre>

    <h4>Grid Events</h4>

    <p>
        The core events (have yet to do the column events) are all presented as Angular 2 events.
        These events map to the callbacks to similar name in gridOptions and are:
    </p>
    <p>
        <i>modelUpdated,
            cellClicked, cellDoubleClicked, cellValueChanged, cellFocused,
            rowSelected, selectionChanged, beforeFilterChanged, afterFilterChanged,
            filterModified, beforeSortChanged, afterSortChanged, virtualRowRemoved,
            rowClicked.</i>
    </p>
    <p>
        Use the Angular 2 event syntax to listen to the events. Eg:
    </p>
    <pre><code>&lt;ag-grid-ng2 [gridOptions]="gridOptions" (cell-clicked)="myCellClickedFunc($event)"></code></pre>

    <p>
        Each event has an event object with attributes relevant to the event, eg cellClicked gives details
        of the clicked cell.
    </p>

    <p>
        The example has a callback tied to each possible event. Open the console in the example to see output
        from the callbacks.
    </p>

    <h4>Example in ES5, no Typescript</h4>

    <p>
        ag-Grid is written in TypeScript, so wouldn't you think my example would be in TypeScript? Quite right,
        but I've kept it in ES5 so when you look at the source code, it's legible. When the dust is settled with
        the grid and Angular 2, I'll do a complete TypeScript example and check it into Github.
    </p>

    <h4>Items Left to Do</h4>

    <ul>
        <li>Bring in the rest of the events (eg column events)</li>
        <li>Bring in property bindings for config items where it's appropriate</li>
    </ul>

    <h4>Outstanding Issue: ag-Grid Angular 2 code in ES5, no Typescript</h4>

    <p>
        I have a problem with annotations (eg @Component and @View). When these are used, it introduces a runtime
        dependency between your code and the annotation. ag-Grid will use Angular 2 if it is present, but will
        happily run if not. This is similar to Angular 1 and Web Components, the grid will use them if present only.
        To allow the grid to work even when Angular 2 is not present, the grid cannot have a runtime dependency
        on it. As such, the annotations could not be used.
    </p>

    <h4>Allow compiling of the individual cells with Angular 2</h4>

    <p>
        This I still have to get to the bottom of. How do I get the grid to allow the client to include Angular 2
        in the cell content? Because I'm using Virtual Scrolling, then I can't rely on the normal Angular 2
        compiling. In Angular 1, this was done using $scope.$new() and $compile(). I've yet to fully understand it
        all for Angular 2.
    </p>

    <!--
        <p>
            Could not use annotations to keep the dependency optional for angular 2 and ag-Grid.
        </p>

        <p>
            But to use non-ES6 modules, I've to use angular2.sfx.dev.js. Does that mean I'm forcing my
            client application to also use sfx?
        </p>

        <p>
            Learning Angular 2 is easy. But before you start, I would suggest you read up on . . . .
            Angular 2 is easier than Angular 1? That's bollocks! The presentations say the Angular 2 data
            binding is more declarative, so you can immediately tell whether a directive's parameter is a property
            (data into a directive), an event (data out of a directive) or an attribute (just a text value). Now
            that is true and I agree, it will make our applications easier to read and maintain. However to say
            Angular 2 is easier than Angular 1 would be ignoring the bleeding edge ES7 and Typescipt (eg decorators),
            the new ES6 loading system (not yet supported by browsers), the more robust (complicated) event
            and update mechanism (which is more targeted and predictable than the old 'shot-gun' digest cycle,
            but more to learn), the new zones for asynchronous tracking, the lack of decent documentation
            (plenty of 'hello world' examples, but very little else, especially round how the internals work),
            and lets not forget the Shadow Dom and Templates of Web Components. So, before you learn Angular 2,
            some suggested reading is Type
        </p>

        <p>
            Let me begin again, learning Angular 2 is not easy. You can throw an 'hello world' page together
            quickly by copy and pasting the examples, but you will have a long way to go before you are
            putting together applications with Angular 2.
        </p>

        <p>
            There appears to be no way of replacing the components element in the DOM similar to 'replace' in ng-1.
            This is needed as the element doesn't behave like a normal element with regards CSS styling.
            Eg this doesn't work &lt;my-comp style="width: 200px"/>
        </p>

        <p>
            Is it possible to extend a DOM element? Web Components allows this, and as such you can add css styles.
        </p>
        -->

</div>

<?php include '../documentation_footer.php';?>
