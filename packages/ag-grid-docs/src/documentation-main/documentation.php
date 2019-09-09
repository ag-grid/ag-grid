<?php
$pageTitle = "ag-Grid Documentation";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is our documentation page where you can learn about all of the features of the grid.";
$pageKeyboards = "ag-Grid JavaScript Grid Documentation";
define('skipInPageNav', true);
define('hideSideMenu', true);
include 'documentation_header.php';
?>

<?php

renderDocs();

function renderDocs() {
    $top_level_items = json_decode(file_get_contents('../documentation-main/menu.json'), true);

    foreach($top_level_items as $item) {

        $name = $item['group'];

        echo "<div class='group'>";
        echo "<h1>$name</h1>";
        echo "<div class='group-items'>";
            renderTitle($item);
        echo "</div>";
        echo "</div>";
    }
}

function renderTitle($group) {
    $groupConfigs = $group['items'];

    foreach($groupConfigs as $groupConfig) {
        


        $title = $groupConfig['title'];
        $icon = $groupConfig['icon'];

        echo "<div class='docs-homepage-section-preview'>";
        echo "<div class='card'>";
        echo "<div class='newIcon $icon'></div>";
        echo "<h2>$title</h2>";

        if ($groupConfig['items'] <> null) {
            renderItems($groupConfig['items'], 0);
        }

        echo "</div>";
        echo "</div>";
    }
}

function renderItems($items, $level) {
    $levelClass = $level > 0 ? 'level' : '';
    echo "<ul class=\"docs-homepage-level$level-item $levelClass\">";

    foreach($items as $item) {
        echo "<li>";
        $title = $item['title'];
        $url = $item['url'];
        $enterprise = $item['enterprise'];
        $childItems = $item['items'];
        $hasLink = $url <> "";
        $shouldHide = $item['showInCollapsed'] <> true;
        $spanClasses = '';

        if (!$hasLink) {
            $spanClasses = $spanClasses.'no-link';
        }

        if ($shouldHide) {
            $spanClasses = $spanClasses.' hide-collapsed';
        }

        echo "<span class=\"$spanClasses\">";

        if ($hasLink) {
            echo "<a href=\"$url\">";
        }

        echo "$title";

        if ($hasLink) {
            echo "</a>";
        }

        if ($enterprise) {
            echo "<span class=\"enterprise-icon\"></span>";
        }

        if ($level > 0) {
            echo "<span class=\"item-split\">, &nbsp;</span>";
        }

        echo "</span>";

        if ($item['items'] <> null) {
            renderItems($item['items'], $level + 1);
        }

        echo "</li>";
    }
    echo "</ul>";
}

?>

<?php include 'documentation_footer.php'; ?>
