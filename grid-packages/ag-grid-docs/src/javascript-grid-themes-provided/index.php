<?php
$pageTitle = "ag-Grid Provided Themes";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It stores the data in Row Models. Each piece of row data provided to the datgrid is wrapped in a Row Node. This section describes the Row Node and how you can use it in your applications.";
$pageKeywords = "ag-Grid data row model";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1>Provided Themes</h1>

<p class="lead">
    The grid comes with several provided themes which act as a great starting point for any application specific
    customisations.
</p>

<h2>Themes Summary</h2>

<p>
    The table below provides a summary of the themes provided with the grid. To see the themes in action click on
    the theme name.
</p>


<table class="properties">
    <style>
        .theme-name-cell {
            white-space: nowrap;
            font-weight: bold;
        }
        .recommendation {
            font-weight: bold;
        }
    </style>
    <tr>
        <th>Theme Name</th>
        <th>Description</th>
    </tr>
    <tr>
        <td class="theme-name-cell">
            <a href="/example.php?theme=ag-theme-alpine" target="_blank">ag-theme-alpine</a><br/>
            <a href="/example.php?theme=ag-theme-alpine-dark" target="_blank">ag-theme-alpine-dark</a>
        </td>
        <td>
            <p>
                Modern looking themes with high contrast, and generous padding.
            </p>
            <p>
                <span class="recommendation">Recommendation:</span>
                This is the recommended grid theme, and a great choice for most applications.
            </p>
        </td>
    </tr>
    <tr>
        <td class="theme-name-cell">
            <a href="/example.php?theme=ag-theme-balham" target="_blank">ag-theme-balham</a><br/>
            <a href="/example.php?theme=ag-theme-balham-dark" target="_blank">ag-theme-balham-dark</a>
        </td>
        <td>
            <p>
                Themes for professional data-heavy applications.
            </p>
            <p>
                <span class="recommendation">Recommendation:</span>
                Balham was the recommended theme before Alpine was developed. It is still a great choice
                for applications that need to fit more data onto each page.
            </p>
        </td>
    </tr>
    <tr>
        <td class="theme-name-cell">
            <a href="/example.php?theme=ag-theme-material" target="_blank">ag-theme-material</a>
        </td>
        <td>
            <p>
                A theme designed according to the Google Material Language Specs.
            </p>
            <p>
                <span class="recommendation">Recommendation:</span>
                This theme looks great for simple applications with lots of white space, and is the obvious
                choice if the rest of your application follows the Google Material Design spec. However the
                Material spec doesn't cater for advanced grid features such as grouped columns and tool panels.
                If your application uses these features, consider using <code>ag-theme-alpine</code> instead.
            </p>
        </td>
    </tr>
</table>


<h2>Loading Provided Themes</h2>

<p>
    There are two kinds of stylesheet that need to be loaded when using provided themes:
</p>

<ul class="content">
    <li><b><code>ag-grid.css</code></b> - structural styles containing CSS rules that are essential to the functioning of the grid.</li>
    <li><b><code>ag-theme-{theme-name}.css</code></b> - theme styles that add design look and feel on top of the structural styles.</li>
</ul>

<note>
    Both stylesheets need to be included with the structural styles (<code>ag-grid.css</code>) loaded before theme styles
    (<code>ag-theme-{theme-name}.css</code>).
</note>

<p>There are various ways to load these stylesheets as described in the sections below:</p>

<h3>Pre-built Bundles</h3>
<p>
    Some pre-built bundles, whether <a href="/javascript-grid-download/">downloaded from our website</a> or included in
    the <code>ag-grid-community</code> <a href="/javascript-grid-npm/">NPM package</a>, already embed the structural
    styles and all provided themes. If you are using one of these files you do not need to separately load CSS.
</p>

<h3>JavaScript Bundler's</h3>
<p>
    If you are using a JavaScript bundler like webpack or Rollup and it is configured to load styles, you can
    <code>require()</code> the correct CSS file from node_modules. This is the recommended approach as webpack will take
    care of minifying your CSS in production.
</p>

<h3>App Hosted</h3>
<p>
    You can copy, either manually or as part of your app's build, the required CSS files
    (<code>ag-grid.css</code> and <code>ag-theme-{theme-name}.css</code>) from node_modules and serve it with your app.
</p>

<h3>CDN</h3>
<p>You can load the structural styles and theme from a free CDN by adding this code to your page.</p>

<snippet language="html">
&lt;link rel="stylesheet"
      href="https://unpkg.com/@ag-grid-community/all-modules@23.0.0/dist/styles/ag-grid.css"&gt;</code>

&lt;link rel="stylesheet"
      href="https://unpkg.com/@ag-grid-community/all-modules@23.0.0/dist/styles/ag-theme-alpine.css"&gt;</code>
</snippet>

<p>
    If you do this, be sure to update the CSS version number in the URL to match the JS version you're using, and
    change the theme name in the URL to the one you're using. This is useful for testing and prototyping but not
    recommended for production as your app will be unavailable if the unpkg servers are down.
</p>

<h2>Applying a Theme to an App</h2>

<p>
    To use a theme add the theme class name to the <code>div</code> element that contains your grid. The following is
    an example of using the Alpine theme:
</p>

<snippet language="html">
    &lt;div id="myGrid" class="ag-theme-alpine"&gt;&lt;/div&gt;
</snippet>

<p>
    In order for the above code to work, the correct stylesheets must be
    <a href="/javascript-grid-themes-provided/#loading-provided-themes">loaded</a>.
</p>

<p>
    Note that the Material theme requires the Roboto font, and this is not bundled in the material CSS. The easiest way
    to load Roboto is through Google's CDN:
</p>

<snippet language="html">
&lt;link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet"&gt;
&lt;div id="myGrid" class="ag-theme-material"&gt;&lt;/div&gt;
</snippet>

<?php include '../documentation-main/documentation_footer.php';?>
