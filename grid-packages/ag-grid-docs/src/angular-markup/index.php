<?php
$pageTitle = "ag-Grid Reference: More Details - Angular Datagrid";
$pageDescription = "ag-Grid can be used as a data grid inside your Angular 2 application. This page details how to get started using ag-Grid inside an Angular 2 application.";
$pageKeyboards = "Angular 2 Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h1>Angular Markup</h1>

    <p class="lead">You can create Grids either programatically (with pure JavaScript/Typescript/Components), or declare them
        via
        declaratively with markup.</p>

    <h3 id="column-definition">Column Definition</h3>
    <snippet>
&lt;ag-grid-column headerName="Name" field="name" [width]="150"&gt;&lt;/ag-grid-column&gt;</snippet>

    <p>This example declares a simple Column Definition, specifying header name, field and width.</p>

    <h3 id="setting-column-properties">Setting Column Properties</h3>
    <p>There are some simple rules you should follow when setting column properties via Markup:</p>

<pre class="language-js" ng-non-bindable><code>// string value
propertyName="String Value"
[propertyName]="'String Value'"
[propertyName]="{{Interpolated Value}}"
[propertyName]="functionCallReturningAString()"

// boolean value
[propertyName]="true|false"
[propertyName]="{{Interpolated Value}}"
[propertyName]="functionCallReturningABoolean()"

// numeric value
[propertyName]="Numeric Value"
[propertyName]="functionCallReturningANumber()"

// function value
[propertyName]="functionName"
[propertyName]="functionCallReturningAFunction()"</code>
</pre>

<h4 id="setting-a-class-or-a-complex-value">Setting a Class or a Complex Value</h4>
    <p>You can set a Class or a Complex property in the following way:</p>
    <snippet>
// return a Class definition for a Filter
[filter]="getSkillFilter()"

private getSkillFilter():any {
    return SkillFilter;
}

// return an Object for filterParams
[filterParams]="getCountryFilterParams()"

private getCountryFilterParams():any {
    return {
        cellRenderer: this.countryCellRenderer,
        cellHeight: 20
    }
}</snippet>

    <h3 id="grouped-column-definition">Grouped Column Definition</h3>
    <p>To specify a Grouped Column, you can nest a column defintion:</p>
    <snippet>
&lt;ag-grid-column headerName="IT Skills"&gt;
    &lt;ag-grid-column headerName="Skills" [width]="125" [sortable]="false" [cellRenderer]="skillsCellRenderer" [filter]="getSkillFilter()"&gt;&lt;/ag-grid-column&gt;
    &lt;ag-grid-column headerName="Proficiency" field="proficiency" [width]="120" [cellRenderer]="percentCellRenderer" [filter]="getProficiencyFilter()"&gt;&lt;/ag-grid-column&gt;
&lt;/ag-grid-column&gt;</snippet>
    <p>In this example we have a parent Column of "IT Skills", with two child columns.</p>

    <h2 id="example-rich-grid-using-markup">Example: Rich Grid using Markup</h2>
    <p>
        The example below shows the same rich grid as the example above, but with configuration done via Markup.
    </p>
    <?= grid_example('ag-Grid in Angular with Markup', 'angular-rich-grid-markup', 'angular', array( "enterprise" => 1, "exampleHeight" => 525, "showResult" => true, "extras" => array( "fontawesome", "bootstrap" ) )); ?>

</div>

<?php include '../documentation-main/documentation_footer.php'; ?>
