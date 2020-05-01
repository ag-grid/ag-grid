<?php
$pageTitle = "ag-Grid Themes: Overview of our Themes.";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It comes with five themes out of the box, this page covers how to use these themes, how to style theme and when to create your own.";
$pageKeywords = "ag-Grid Styling";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h1> Themes </h1>

    <p class="lead">
        The grid is styled using CSS, and a theme is a set of CSS rules styling the grid. 
        The grid comes bundled with <a href="../javascript-grid-themes-provided/">Provided Themes</a>, 
        or you can create your own.
    </p>

    <h2>Theming the Grid</h2>

    <p>
        The grid can be themed using one of the following approaches:
    </p>

    <ol class="content">
        <li>
            Use one of the <a href="../javascript-grid-themes-provided/">Provided Themes</a>. This is the most 
            straightforward approach. You can make simple customisations using CSS variables and rules.
        </li>
        <li>
            <a href="../javascript-grid-themes-customising/">Customise Provided Themes</a> using theme parameters 
            and CSS rules. This requires configuring your project to build Sass files and allows you to change elements 
            of the look and feel like colours, padding, and borders.
        </li>
        <li>
            Create your own theme from scratch by extending the base theme. This is the best option for apps that look 
            very different from the provided themes.
        </li>
    </ol>

    <h2>When to extend the base theme</h2>

    <p>
        If you extend a provided theme and then very extensively alter it to make a totally different design, you may encounter 
        a couple of issues:
    </p>

    <ol class="content">
        <li>
            If the provided theme contains design elements that you don't want, you need to add CSS rules to remove them. 
        </li>
        <li>
            Between releases, we may change some of the implementation details of the provided theme in a way that breaks
            these rules you have added. For these apps that want a look and feel that is entirely different from our provided 
            themes, it is appropriate to extend the base theme. The base theme contains the most basic configurable borders 
            and sensible default padding but otherwise has no opinionated design elements.
        </li>
    </ol>

    <note>
        If you extend the base theme but want the icons from a provided theme, this can be done by adding the font from the theme 
        you like. You can find these in the <code>dist/styles/webfont</code> folder of the distribution. Link this font into your 
        application and follow the instructions for configuring a custom <a href="../javascript-grid-icons/">icon font</a>.
    </note>

    <h2>When not to use themes</h2>

    <p>
        Themes are intended to change the overall look and feel of a grid. If you want to style a particular column or a particular 
        header, consider using either cell and header renderers, or applying CSS classes or styles at the column definition level. 
        Sometimes it is possible to achieve the same effect using <a href="../javascript-grid-component-types/">custom renderers</a> 
        as it is with themes. If so, use whichever one makes more sense for you.
    </p>

<?php include '../documentation-main/documentation_footer.php';?>
