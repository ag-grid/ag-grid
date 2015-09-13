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
        Coming soon, using ag-Grid with Angular 2.
    </p>

    <show-example example="exampleAngular2"></show-example>

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

</div>

<?php include '../documentation_footer.php';?>
