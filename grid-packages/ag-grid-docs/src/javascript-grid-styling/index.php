<?php
$pageTitle = "ag-Grid Themes: Overview of our Themes.";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It comes with five themes out of the box, this page covers how to use these themes, how to style theme and when to create your own.";
$pageKeyboards = "ag-Grid Styling";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>


<h1> Themes </h1>

    <p class="lead">
        The grid is styled using CSS. A set of CSS rules styling the grid is referred to as a theme.
        The grid comes bundled with <a href="../javascript-grid-themes-provided/">Provided Themes</a>
        or you can create you own theme by applying your own style to the grid.
    </p>

    <h2>When to Create a Theme</h2>

    <p>
        You have the following options when choosing a theme:
    </p>

    <ol class="content">
        <li>
            Use one of the provided themes e.g. <code>ag-theme-balham</code>.
        </li>
        <li>
            Use one of the provided themes and tweak using the provided
            <a href="../javascript-grid-themes-provided/#customizing-sass-variables">Sass variables</a>.
        </li>
        <li>
            Create your own theme from scratch. This is the most complex approach and you are more
            exposed to breaking changes in grid releases.
        </li>
    </ol>

    <p>
        You should only create your own theme when options 1 and 2 above don't suit, as it is
        the most difficult.
        If you do decide to create your own theme, then you can use one of the provided themes and
        use that as a template. They can be found on GitHub <a href="https://github.com/ag-grid/ag-grid/tree/master/packages/ag-grid-community/src/styles">here</a>.
        <p>
        This section does not provide an example of building a theme as a number of themes
        are already provided with the grid - these can be used as a basis for any additional themes you may wish to create.
        </p>
        <h3>Important</h3><p>If you create your own theme, it's name has to follow the <code>ag-theme-</code>&lt;theme name&gt; naming convention, otherwise 
        styles will not be applied to floating elements (eg. context menus) properly.</p>
    </p>



    <h2 id="when-to-style-via-themes">When to Style via Themes</h2>

    <p>
        Themes are intended to change the overall look and feel of a grid. If you want to style a particular
        column, or a particular header, consider using either cell and header renderers, or applying CSS
        classes or styles at the column definition level.
    </p>

    <p>
        Sometimes it is possible to achieve the same effect using custom renderers as it is with themes.
        If so, use whichever one makes more sense for you, there isn't a hard and fast rule.
    </p>

    <h2 id="what-to-style-via-themes">What to Style via Themes</h2>

    <p>
        Any of the CSS classes described below can have style associated with them.  
        However you should be cautious about overriding style that is associated outside of the theme.
        For example, the ag-pinned-cols-viewport, has the following style:
    </p>

    <snippet language="css">
   .ag-pinned-cols-viewport {
        float: left;
        position: absolute;
        overflow: hidden;
    }</snippet>

    <p>
        The style attributes float, position and overflow are intrinsic to how the grid works. Changing
        these values will change how the grid operates. If unsure, take a look at the styles associated
        with an element using your browsers developer tools. If still unsure, try it out, if the style
        you want to apply breaks the grid, then it's not a good style to apply.
    </p>



<?php include '../documentation-main/documentation_footer.php';?>
