<?php
$pageTitle = "ag-Grid Documentation";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is our documentation page where you can learn about all of the features of the grid.";
$pageKeyboards = "ag-Grid JavaScript Grid Documentation";
define('skipInPageNav', true);
include 'documentation_header.php';
?>

<?php

doLevel1();
//doOldMenu();

function doLevel1() {
    $lev1Items = json_decode(file_get_contents('../documentation-main/menu.json'), true);

    foreach($lev1Items as $lev1Item) {

        $lev1ItemName = $lev1Item['group'];

        echo "<h1>$lev1ItemName</h1>";

        doLevel2($lev1Item);
    }
}



function doLevel2($parentItem) {
    $lev2Items = $parentItem['items'];

    foreach($lev2Items as $lev2Item) {

        $lev2ItemName = $lev2Item['title'];
        $lev2ItemIcon = $lev2Item['icon'];

        echo "<div class='docs-homepage-section-preview'>";
        echo "<div class='newIcon $lev2ItemIcon'></div>";
        echo "<h2>$lev2ItemName</h2>";

        doLevel3($lev2Item);

        echo "</div>";

    }

}


function doLevel3($parentItem) {
    echo "<ul>";

    $items = $parentItem['items'];
    $length = count($items) - 1;

    foreach($items as $index=>$item) {
        $itemTitle = $item['title'];
        $boxTitle =  $item['box-title'];
        if ($boxTitle <> '') {
            $itemTitle = $boxTitle;
        }
        $itemUrl = $item['url'];
        $itemTextDecorator = $parentItem['level-2-text-decorator'];
        $forcedDisplayStyle = $parentItem['level-2-display-style-forced'];
        $forcedStyle = '';

        if ($forcedDisplayStyle <> '') {
            $forcedStyle = "display: $forcedDisplayStyle";
        }

        if ($index == $length) {
            $itemTextDecorator = '';
        }


        if ($itemTitle <> 'See Also') {
            echo "<li style='$forcedStyle'>";

            echo "<span class='docs-homepage-level2-item'>";
            if (strlen($itemUrl) > 1) {
                echo "<a href='../$itemUrl'>$itemTitle</a>";
            } else {
                echo "$itemTitle";
            }

            if ($item['enterprise']) {
                echo "<span class=\"enterprise-icon\"></span>$itemTextDecorator";
            }else {
                echo "$itemTextDecorator";
            }

            echo "</span>";

            $maxLevelShow = $item['max-box-show-level'];
            if ($maxLevelShow > 2) {
                doLevel4($item, $itemTextDecorator);
            }


            echo "</li>";
        }
    }

    echo "</ul>";
}

function doLevel4($parentItem) {
    echo "<ul>";

    $items = $parentItem['items'];

    foreach($items as $item) {
        $itemTitle = $item['title'];
        $itemUrl = $item['url'];

        echo "<li>"; // start level 3

        echo "<span class='docs-homepage-level3-item'>";
        if (strlen($itemUrl) > 1) {
            echo "<a href='../$itemUrl'>$itemTitle</a>";
        } else {
            echo "$itemTitle";
        }

        if ($item['enterprise']) {
            echo "<span class=\"enterprise-icon\"/>";
        }

        echo "</span>";

        doLevel5($item);

        echo "</li>"; // end level 3
    }

    echo "</ul>";
}

function doLevel5($parentItem) {
    echo "<ul>";

    $items = $parentItem['items'];

    foreach($items as $item) {
        $itemTitle = $item['title'];
        $itemUrl = $item['url'];

        echo "<li>"; // start level 3

        echo "<span class='docs-homepage-level3-item'>";
        if (strlen($itemUrl) > 1) {
            echo "<a href='../$itemUrl'>$itemTitle</a>";
        } else {
            echo "$itemTitle";
        }

        if ($item['enterprise']) {
            echo "<span class=\"enterprise-icon\"/>";
        }

        echo "</span>";

        doLevel6($item);

        echo "</li>"; // end level 3
    }

    echo "</ul>";
}

function doLevel6($parentItem) {
    echo "<ul>";

    $items = $parentItem['items'];

    foreach($items as $item) {
        $itemTitle = $item['title'];
        $itemUrl = $item['url'];

        echo "<li>"; // start level 3

        echo "<span class='docs-homepage-level3-item'>";
        if (strlen($itemUrl) > 1) {
            echo "<a href='../$itemUrl'>$itemTitle</a>";
        } else {
            echo "$itemTitle";
        }

        if ($item['enterprise']) {
            echo "<span class=\"enterprise-icon\"/>";
        }

        echo "</span>";

        echo "</li>"; // end level 3
    }

    echo "</ul>";
}

?>


<?
function doOldMenu() {
?>

<div class="docs-homepage-section-preview">
    <div>
    <h2>How Do I?</h2>
    <p>Review the guides section for step by step, task oriented articles that navigate through the recommended means of using ag-Grid.</p>
    <p> <a href="../javascript-grid-npm/">Go to Guides</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Reference</h2>
    <p>
        All the configuration options (<strong>properties</strong>, <strong>events</strong>, <strong>API</strong>, etc.) for ag-Grid.
        Use this as a quick reference to look all available options.
    </p>
    <p> <a href="../javascript-grid-reference-overview/">Go to Reference</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Explore Everything ag-Grid Can Do</h2>
    <p>
        A detailed look at all the features. Go here for detailed explanations and examples
        for all features. Items that are only available
        in ag-Grid Enterprise are marked with the <span class="enterprise-icon">e</span> symbol.
    </p>

    <p> <a href="../javascript-grid-features/">Go to Features</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Deal With Large Data Sets Easily</h2>
    <p>
        The grid supports many ways to load data including <strong>infinite scrolling</strong>
        and <strong>lazy loading</strong> of group data.
        Learn how to apply these techniques to manage large amounts of data.
    </p>

    <p> <a href="../javascript-grid-row-models/">Go to Row Models</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Choose the Right Look for Your Project</h2>
    <p>
        The grid comes with many built in themes and also the ability to design
        your own theme. Get the grid to fit the overall look and feel of your
        application.
    </p>

    <p> <a href="../javascript-grid-styling/">Go to Themes</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Customize ag-Grid up to Your Requirements, Your Way</h2>
    <p>
        Introduce your own behaviours into the grid by providing custom
        components such as <strong>Cell Renderers</strong>, <strong>Cell Editors</strong>, <strong>Filters</strong> and
        <strong>Header Components</strong>. 

        These can be done using plain JavaScript or a framework of your choice e.g. Angular or React.
    </p>

    <p> <a href="../javascript-grid-components/">Go to Components</a> </p>
    </div>
</div>

<div class="docs-homepage-section-preview">
    <div>
    <h2>Explore What ag-Grid Can Do</h2>
    <p>
        End to end examples demonstrating many of the features of ag-Grid.
    </p>

    <p> <a href="../javascript-grid-examples/">Go to Examples</a> </p>
    </div>
</div>

<?
}
?>

<?php include 'documentation_footer.php'; ?>
