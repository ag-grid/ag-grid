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
        or you can create you own theme by applying CSS styles to the grid.
    </p>

    <p>
        You have the following options when choosing a theme:
    </p>

    <ol class="content">
        <li>
            Use one of the <a href="../javascript-grid-themes-provided/#customising-themes">provided themes</a>. This is the simplest approach.
        </li>
        <li>
            Customise one of the provided themes using
            <a href="../javascript-grid-themes-provided/#customising-themes">theme parameters and CSS rules</a>.
            This requires configuring your project to build Sass files, and allows you to change elements of the look
            and feel like colours, padding, and borders.
        </li>
        <li>
            Create your own theme from scratch by extending the base theme. This is the best option for apps that look very different to the provided themes.
        </li>
    </ol>

    <h2>When to extend the base theme</h2>

    <p>If you extend a provided theme and then very extensively alter it to make a totally different design, you may encounter a couple of issues. Firstly, if the provided theme contains design elements that you don't want, you will need to add CSS rules to remove them. Secondly, between releases we may change implementation details of the provided theme in a way that breaks these rules you have added. For these apps that want a look and feel totally different from our provided themes, it is appropriate to extend the base theme. The base theme contains basic configurable borders and sensible default padding but otherwise has no opinionated design elements.</p>

    <p>
        If you extend the base theme but want the icons from a provided theme, this can be
        done by adding the font from the theme you like. You can find these in the 
        <code>dist/styles/webfont</code> folder of the distribution. Link this font into your application and follow the instructions for configuring a <a href="/javascript-grid-icons/">custom icon font</a>.
    </p>

    <h2>Understanding theme maintenance and breaking changes</h2>

    <p>
        With each release of the grid, we add features and improve existing ones, and as a result the DOM structure changes with every release - even minor and patch releases. Of course, we test and update the CSS rules in our themes to make sure they still work. But if you have written your own CSS rules, you will need to test and update them.
    </p>

    <p>
        This is why it is more stable to use theme parameters than CSS rules to change the look and feel of the grid - if you
        use theme parameters, the theme takes care of generating CSS from them, so you don't have to update anything between releases.
    </p>

    <p>
        Sometimes you will have to write CSS however. In this case, bear in mind that the simpler your CSS rules are, the less likely they are to break between releases. Prefer selectors that target a single class name where possible.
    </p>

    <h2>When not to use themes</h2>

    <p>
        Themes are intended to change the overall look and feel of a grid. If you want to style a particular column, or a particular header, consider using either cell and header renderers, or applying CSS classes or styles at the column definition level.
    </p>

    <p>
        Sometimes it is possible to achieve the same effect using custom renderers as it is with themes. If so, use whichever one makes more sense for you, there isn't a hard and fast rule.
    </p>

    <h2>Avoiding breaking the grid with custom themes</h2>

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
            text or icons within a container; but if you're trying to change the layout of the grid on a larger scale e.g. turning a vertical scrolling list into a horizontal one, you are likely to break Grid features.
        <li>The style properties <code>position</code>, <code>overflow</code> and <code>pointer-events</code>
            are intrinsic to how the grid works. Changing these values will change how the grid operates, and may break
            functionality now or in future minor releases.
    </ul>

<?php include '../documentation-main/documentation_footer.php';?>
