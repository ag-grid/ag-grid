<?php
$pageTitle = "Date Component";
$pageDescription = "Describes how to implement customer date components for ag-Grid";
$pageKeyboards = "JavaScript Date Component";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Date Component</h1>

<p class="lead">
    You can create your own date components, and ag-Grid will use them every time it needs to ask user for a date value.
    The date components so far are used in ag-Grid in <strong>rich date filter</strong> and the <strong>floating date filter</strong>.
</p>

<p>
    By default the grid will use the browser provided date picker for Chrome (as we think it's nice), but for all other
    browser it will just provide a simple text field. You can provide your chosen date picker to ag-Grid. This is done by providing a custom
    Date Component via the grid property dateComponent as follows:
</p>

<snippet>
gridOptions: {
    ...
    // Here is where we specify the component to be used as the  date picket widget
    dateComponent: MyDateEditor
}},</snippet>

<p> The interface for dateComponent is like  this: </p>

<snippet>
interface IDateComp {
    // mandatory methods

    // The ini t(params) method is called on the filter once. See below for details on the parameters.
    init(params: IFilterParams): void;

    // Returns the  GUI for this fi lter. The GUI can be a) a string of html  or b) a DOM element or node.
    getGui(): any;

    /** Returns the current date represented by this editor */
    getDate(): Date;

    /** Sets the date represented by this component */
    setDate(date:Date): void;

    // optional methods

    &lt;span class="codeComment"&gt;// Gets called when the component is destroyed. If your custom component ne eds to do
    // any resource cleaning up, do it here.&lt;/span&gt;
    destroy?(): void;
}</snippet>

<h2>IDateParams</h2>

<p>
    The method <code>init(params)</code> takes a params object with the items listed below. If the user provides
    params via the <code>gridOptions.dateComponentParams</code> attribute, these will be additionally added to the
    params object, overriding item s of the same name if a name clash exists.
</p>

<snippet>
interface IDateParams {
    /** Callback method to call when the date has changed. */
    onDateChanged: () =&gt; void

}</snippet>


<h2>Custom Date Example</h2>

<p>
    The example below shows how to register a cus tom date component, and then how that component is automatically used in
    the date column for both the rich filter and the floating filter.
</p>

<?= example('Auto Height', 'custom-date', 'generated', array()) ?>




<?php include '../documentation-main/documentation_footer.php';?>
