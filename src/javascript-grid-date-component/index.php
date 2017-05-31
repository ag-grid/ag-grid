<?php
$key = "Date Component";
$pageTitle = "Date Component";
$pageDescription = "Describes how to implement customer date components for ag-Grid";
$pageKeyboards = "JavaScript Date Component";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h2>Date Component</h2>


<p>
    You can create your own date components, and ag-Grid will use them every time it needs to ask user for a date value.

    The date components so far are used in ag-Grid in:
    <ol>
        <li>On the rich date filter</li>
        <li>On the floating date filter</li>
    </ol>
</p>

<p>
    By default the grid will use the browser provided date picker for Chrome (as we think it's nice), but for all other
    browser it will just provide a simple text field. You can provide your chosen date picker to ag-Grid. This is done by providing a custom
    Date Component via the grid property dateComponent as follows:
</p>

<pre>
gridOptions: {
    ...
    <span class="codeComment">// Here is where we specify the component to be used as the date picket widget</span>
    dateComponent: MyDateEditor
}},
</pre>

<p>
    The interface for dateComponent is like this:
</p>

<pre>interface IDate {
    <span class="codeComment">// mandatory methods</span>

    <span class="codeComment">// The init(params) method is called on the filter once. See below for details on the parameters.</span>
    init(params: IFilterParams): void;

    <span class="codeComment">// Returns the GUI for this filter. The GUI can be a) a string of html or b) a DOM element or node.</span>
    getGui(): any;

    <span class="codeComment">/** Returns the current date represented by this editor */</span>
    getDate(): Date;

    <span class="codeComment">/** Sets the date represented by this component */</span>
    setDate(date:Date): void;

    <span class="codeComment">// optional methods</span>

    <span class="codeComment">// Gets called when the component is destroyed. If your custom component needs to do
    // any resource cleaning up, do it here.</span>
    destroy?(): void;
}</pre>

<h4>IDateParams</h4>

<p>
    The method init(params) takes a params object with the items listed below. If the user provides
    params via the <i>gridOptions.dateComponentParams</i> attribute, these will be additionally added to the
    params object, overriding items of the same name if a name clash exists.
</p>

<pre>interface IDateParams {

    <span class="codeComment">/** Callback method to call when the date has changed. */</span>
    onDateChanged:()=>void

}</pre>


<h3>Custom Date Example</h3>

<p>
    The example below shows how to register a custom date component, and then how that component is automatically used in
    the date column for both the rich filter and the floating filter.
</p>

<show-complex-example example="./exampleCustomDate.html"
                      sources="{
                                [
                                    { root: './', files: 'exampleCustomDate.html,exampleCustomDate.js' }
                                ]
                              }"
                      plunker="https://embed.plnkr.co/UQG80i3bRCGnkgtVwteC/"
                      exampleheight="500px">
</show-complex-example>

<?php include '../documentation-main/documentation_footer.php';?>
