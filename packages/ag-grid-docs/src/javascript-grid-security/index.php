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

    <p>The basic information on Content Security Policy can be found on the <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP">MDN web docs</a> website 
    and will cover the necessary information on the subject. ag-Grid works with CSP, but some basic configuration is necessary to have your application load correctly.
    You can see below, what the minimum set of CSP rules for ag-Grid is and why: 
    </p>

    <h3>script-src</h3>

    <p>
        The <code>script-src</code> policy will work only with <code>'self'</code> rule, but if you are working with custom parsers, like the 
        <a href="/javascript-grid-cell-styles/#cell-class-rules">Cell Class Rules</a> using expressions, for example: 
        <snippet>
cellClassRules: {
    'rag-green': 'x < 20',
    'rag-amber': 'x >= 20 && x < 25',
    'rag-red': 'x >= 25'
}
        </snippet>
        it will be necessary to add the <code>unsafe-eval</code> rule to your policy.
    </p>

    <h3>style-src</h3>

    <p>
        The <code>style-src</code> policty requires the <code>unsafe-inline</code> due to the nature of the grid itself. As you scroll the grid, or drag/resize 
        columns, or do anything that changes the initial look of the grid, we apply inline styles to the relevant elements and this requires the <code>unsafe-inline</code>
        rule to be added here.
    </p>

    <h3>img-src</h3>
    
    <p>
        The <code>img-src</code> policy requires the <code>data:</code> rule because we load some SVG images as data strings to make sure they are pre-loaded by the grid.
        One example of such an image is the filter menu section divider
    </p>

    <h3>font-src</h3>

    <p>
        The <code>font-src</code> policy also requires the <code>data:</code> rule because of the same reason we pre-load SVG images as strings, we also load our icon WebFont 
        as a string to make sure icons will not be initially empty and suddenly appear after the font is downloaded.
    </p>
    
    <p>

        So the minimal rule to load the grid is:
        <snippet>
        &lt;meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src data:"&gt;
        </snippet>
        If you are using code parsing as mentioned above, the rule is:
        <snippet>
        &lt;meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src data:"&gt;
        </snippet>
</snippet>
    </p>

    <h2>OWASP Benchmark</h2>

    <p>Stay tuned...</p>

<?php include '../documentation-main/documentation_footer.php';?>
