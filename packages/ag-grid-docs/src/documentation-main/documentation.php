<?php
$pageTitle = "ag-Grid Documentation";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is our documentation page where you can learn about all of the features of the grid.";
$pageKeyboards = "ag-Grid JavaScript Grid Documentation";
define('skipInPageNav', true);
define('hideSideMenu', true);
include 'documentation_header.php';
?>

<?php

doLevel1();

function doLevel1() {
    $lev1Items = json_decode(file_get_contents('../documentation-main/menu.json'), true);

    foreach($lev1Items as $lev1Item) {

        $lev1ItemName = $lev1Item['group'];

        echo "<div class='group'>";
        echo "<h1>$lev1ItemName</h1>";

        doLevel2($lev1Item);
        echo "</div>";
    }
}



function doLevel2($parentItem) {
    $lev2Items = $parentItem['items'];

    echo "<div class='group-items'>";

    foreach($lev2Items as $lev2Item) {

        $lev2ItemName = $lev2Item['title'];
        $lev2ItemIcon = $lev2Item['icon'];

        echo "<div class='docs-homepage-section-preview'>";
        echo "<div class='card'>";
        echo "<div class='newIcon $lev2ItemIcon'></div>";
        echo "<h2>$lev2ItemName</h2>";
        
        doLevel3($lev2Item);

        echo "</div>";
        echo "</div>";
    }

    echo "</div>";

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

            echo "<span class='docs-homepage-level2-item level'>";
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

            $maxLevelShow = $parentItem['max-box-show-level'];
            if ($maxLevelShow > 2 || $maxLevelShow == null) {
                doLevel4($item);
            }


            echo "</li>";
        }
    }

    echo "</ul>";
}

function doLevel4($parentItem) {
    echo "<ul>";

    $items = $parentItem['items'];
    $length = count($items) - 1;

    foreach($items as $index=>$item) {
        $itemTitle = $item['title'];
        $itemUrl = $item['url'];

        echo "<li>"; // start level 3

        echo "<span class='docs-homepage-level3-item level'>";
        if (strlen($itemUrl) > 1) {
            echo "<a href='../$itemUrl'>$itemTitle</a>";
        } else {
            echo "$itemTitle";
        }

        if ($item['enterprise']) {
            echo "<span class=\"enterprise-icon\"></span>";
        }

        if ($index <> $length) {
            echo "<span class=\"level-3-split\">,&nbsp;</span>";
        }

        echo "</span>";

        if ($item['items'] != null) {
            doLevel5($item);
        }

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

        echo "<span class='docs-homepage-level4-item level'>";
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

        echo "<span class='docs-homepage-level5-item level'>";
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

<?php include 'documentation_footer.php'; ?>
