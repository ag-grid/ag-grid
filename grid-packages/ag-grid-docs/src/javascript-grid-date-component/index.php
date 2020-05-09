<?php
$pageTitle = "ag-Grid Components: Date Component";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It supports the use of components, here we describe how to use a Date Component. The grid comes with a default date picker but you can also use your own.";
$pageKeywords = "JavaScript Date Component";
$pageGroup = "components";
include '../documentation-main/documentation_header.php';
?>

<h1>Date Component</h1>

<p class="lead">
    You can create your own date components, and ag-Grid will use them every time it needs to ask the user for a date value.
    The date components are currently used in <strong>date filters</strong>.
</p>

<p>
    By default the grid will use the browser provided date picker for Chrome and Firefox (as we think it's nice), but for all other
    browsers it will just provide a simple text field. You can use your own date picker to ag-Grid by providing a custom
    Date Component via the grid property <code>dateComponent</code> as follows:
</p>

<?= createSnippet(<<<SNIPPET
gridOptions: {
    ...
    // Here is where we specify the component to be used as the date picker widget
    dateComponent: MyDateEditor
},
SNIPPET
) ?>

<p>The interface for <code>dateComponent</code> is this:</p>

<?= createSnippet(<<<SNIPPET
interface IDateComp {
    // Mandatory methods

    // The init(params) method is called on the component once. See below for details on the parameters.
    init(params: IDateParams): void;

    // Returns the DOM element for this component
    getGui(): HTMLElement;

    // Returns the current date represented by this editor
    getDate(): Date;

    // Sets the date represented by this component
    setDate(date: Date): void;

    // Optional methods

    // Sets the input text placeholder
    setInputPlaceholder(placeholder: string): void;

    // Gets called when the component is destroyed. If your custom component needs to do
    // any resource cleaning up, do it here.
    destroy?(): void;
}
SNIPPET
, 'ts') ?>

<h2><code>IDateParams</code></h2>

<p>
    The method <code>init(params)</code> takes a <code>params</code> object with the items listed below. If the user provides
    params via the <code>gridOptions.dateComponentParams</code> attribute, these will be additionally added to the
    <code>params</code> object, overriding items of the same name if a name clash exists.
</p>

<?= createSnippet(<<<SNIPPET
interface IDateParams {
    // Callback method to call when the date has changed
    onDateChanged: () => void;
}
SNIPPET
, 'ts') ?>

<h2>Example: Custom Date Component</h2>

<p>
    The example below shows how to register a custom date component that contains an extra floating calendar picker rendered
    from the filter field. The problem with this approach is that we have no control over third party components and therefore
    no way to implement a <code>preventDefault</code> when the user clicks on the Calendar Picker (for more info see
    <a href="../javascript-grid-floating-filter-component/#example-custom-floating-filter">Custom Floating Filter Example</a>).
    Our way of fixing this problem is to add the <code>ag-custom-component-popup</code> class to the floating calendar.
</p>

<?= grid_example('Custom Date Component', 'custom-date', 'generated', ['extras' => ['fontawesome', 'flatpickr']]) ?>

<?php include '../documentation-main/documentation_footer.php'; ?>
