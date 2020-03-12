<?php
$pageTitle = "ag-Grid Themes: Overview of our Themes.";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. It comes with five themes out of the box, this page covers how to use these themes, how to style theme and when to create your own.";
$pageKeywords = "ag-Grid Styling";
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
        Browsers use the same mechanism - CSS - for controlling how elements work (e.g. scrolling and whether they respond to mouse events),
        where elements appear, and how elements look. Our "structural stylesheet" (ag-grid.scss) sets CSS rules that control how the grid
        works, and the code depends on those rules not being overridden. There is nothing that we can do to prevent themes overriding critical
        rules, so as a theme author you need to be careful not to break the grid. Here's a guide:
    </p>

    <ul>
        <li>Visual styles including margins, paddings, sizes, colours, fonts, borders etc are all fine to change
            in a theme.
        <li>Setting a component to <code>display: flex</code> and changing flex child layout properties like
            <code>align-items</code>, <code>align-self</code> and <code>flex-direction</code> is probably OK
            if you're trying to change how something looks on a small scale, e.g. to change the align of some
            text or icons within a container; but if you're trying to change how the grid works e.g. turning a
            scrolling container into an auto-sizing container, you are likely to break Grid features.
        <li>The style properties <code>position</code>, <code>overflow</code> and <code>pointer-events</code>
            are intrinsic to how the grid works. Changing these values will change how the grid operates, and may break
            functionality now or in future minor releases.
    </ul>

<?php include '../documentation-main/documentation_footer.php';?>
