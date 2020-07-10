<?php
$pageTitle = "Column State";
$pageDescription = "Columns state can be change by the grid, eg column width. This stateful parts of the column can be modified.";
$pageKeywords = "Javascript Grid Column State";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Column State</h1>

<p class="lead">
    This page will have Niall's fabulous Column State work. It's not finished!!!
    Intro...
</p>

<h2>Updating Column Definitions</h2>

<p>
    Matching columns based on id.
</p>

<p>
    Keeping column order.
</p>

<p>
    <code>width</code> vs <code>defaultWidth</code>...
</p>

<p>
    Null values vs Undefined / missing values.
</p>

<p>Examples:</p>
<ul>
    <li>Set column defs, change header names.</li>
    <li>Set column defs, change stateful items, width vs defaultWidth.</li>
    <li>Set column defs, new order.</li>
</ul>

<h2>Get / Apply State</h2>

<p>
    Saving and restoring state.
</p>

<p>Examples:</p>
<ul>
    <li>Saving / applying everything.</li>
    <li>Saving / apply just widths.</li>
    <li>Apply just order.</li>
    <li>Events</li>
</ul>

<p>
    Applying specific state.
</p>

<p>
    Default column state.
</p>

<p>Examples:</p>

<ul>
    <li>Buttons to turn on / off different state items.</li>
</ul>

<h2>State vs ColDef Comparison</h2>

<ul>
    <li>State can modify auto cols.</li>
    <li>State better for storing, as don't have noise.</li>
    <li>State doesn't bother with column groups.</li>
    <li>Col Defs adds/removes columns, state only applies to current columns.</li>
    <li>Events</li>
</ul>

<?php include '../documentation-main/documentation_footer.php';?>
