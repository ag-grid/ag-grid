<?php
$pageTitle = "Security: Content Security Policy and OWASP Benchmark";
$pageDescription = "Core feature of ag-Grid supporting Angular, React, Javascript and more. One such feature is Security compliance with OWASP Benchmark and CSP rules.";
$pageKeyboards = "ag-Grid Security";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

    <h1>Security</h1>

    <p class="lead">
        The grid allows you to work with security tools and parameters to make your application meet your business requirements.</p>

    <h2>Content Security Policy (CSP)</h2>

    <p>
        The basic information on Content Security Policy can be found on the
        <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP">MDN web docs</a> website and will cover the
        necessary information on the subject. The grid works with CSP, but some basic configuration is necessary to
        have your application load correctly. Below is detailed what the minimum set of CSP rules for the grid is and why.
    </p>

    <h3>script-src</h3>

    <p>
        The <code>script-src</code> policy will work only with <code>'self'</code> rule. If you are working with
        expressions / code parsing inside of the grid instead of functions, it will be necessary to add the <code>unsafe-eval</code>
        rule to your policy.
    </p>
    <p>
        Using expressions instead of functions is an option for many grid properties such as
        <a href="../javascript-grid-cell-styles/#cell-class-rules">Cell Class Rules</a> and
        <a href="../javascript-grid-value-getters/">Value Getters</a>. Below demonstrates the difference
        where expressions are used instead of functions.
    </p>

        <snippet>
// this column definition does NOT use expressions.
// no need for unsafe-eval
let colDef = {
    cellClassRules: {
        'rag-green': function(params) { return params.value < 20; },
        'rag-amber': function(params) { return params.value >= 20 && params.value < 25; },
        'rag-red': function(params) { return params.value >= 25; }
    },
    valueGetter: function(params) { return params.data.price * params.data.fx; }
};

// this column definition does use expressions
// ******** unsafe-eval is needed
let colDef = {
    cellClassRules: {
        'rag-green': 'x < 20',
        'rag-amber': 'x >= 20 && x < 25',
        'rag-red': 'x >= 25'
    },
    valueGetter: 'data.price * data.fx'
};
</snippet>

    <h3>style-src</h3>

    <p>
        The <code>style-src</code> policy requires the <code>unsafe-inline</code> due to the
        <a href="../javascript-grid-dom-virtualisation/">DOM Row and Column Virtualisation</a>.
        The technique the grid uses to display position rows requires explicit positioning of the
        rows and columns. This positioning is only possible using CSS style attributes to set
        explicit X and Y positions. This is a feature that all data grids have. Without it, the data grid
        would have a very low limit on the amount of data that could be displayed.
    </p>

    <h3>img-src</h3>
    
    <p>
        The <code>img-src</code> policy requires the <code>data:</code> rule. This is because the grid pre-loads SVG
        images as data strings. One example of such an image is the filter menu section divider. If the image was
        not preloaded, the grid would flicker when the menu shows, while the image is getting loaded.
    </p>

    <h3>font-src</h3>

    <p>
        The <code>font-src</code> policy also requires the <code>data:</code> rule. This is for the same reason
        the grid pre-loads SVG images as strings, it also pre-loads the icon WebFont
        as a string. This is to make sure icons will not be initially empty and suddenly appear after the
        font is downloaded.
    </p>

    <h3>Summary</h3>

    <p>
        In summary, the minimal rule to load the grid is:
        <snippet>
        &lt;meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src data:"&gt;
        </snippet>
        However if you are using expressions / code parsing, the rule is:
        <snippet>
        &lt;meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src data:"&gt;
        </snippet>
    </p>


<?php include '../documentation-main/documentation_footer.php';?>
