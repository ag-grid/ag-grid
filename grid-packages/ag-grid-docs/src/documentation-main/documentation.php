<?php
$pageTitle = "ag-Grid Documentation";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is our documentation page where you can learn about all of the features of the grid.";
$pageKeywords = "ag-Grid JavaScript Grid Documentation";
define('skipInPageNav', true);

include 'documentation_header.php';
?>

<div class="group" style="overflow: hidden;">
    <h1>Getting Started</h1>
    <div class="group-items flex-lg-column flex-xl-row">
        <div class="d-flex flex-fill flex-nowrap">
            <div class="docs-homepage-section-preview get-started-framework card-javascript flex-fill" style="height: auto; min-width: auto">
                <a href="../../javascript-grid/" style="height: 4rem; background-size: 3rem 3rem;" title="JavaScript">JavaScript</a>
                <div class="d-none d-md-block">
                    <p>
                        <a href="../../javascript-grid/" style="white-space: nowrap;">Get Started with JS</a>
                    </p>
                </div>
            </div>
            <div class="docs-homepage-section-preview get-started-framework card-angular flex-fill" style="height: auto; min-width: auto">
                <a href="../../angular-grid/" style="height: 4rem; background-size: 3rem 3rem;" title="Angular">Angular</a>
                <div class="d-none d-md-block">
                    <p>
                        <a href="../../angular-grid/" style="white-space: nowrap;">Get Started with Angular</a>
                    </p>
                </div>
            </div>
        </div>
        <div class="d-flex flex-fill flex-nowrap">
            <div class="docs-homepage-section-preview get-started-framework card-react flex-fill" style="height: auto; min-width: auto">
                <a href="../../react-grid/" style="height: 4rem; background-size: 3rem 3rem;" title="React">React</a>
                <div class="d-none d-md-block">
                    <p>
                        <a href="../../react-grid/" style="white-space: nowrap;">Get Started with React</a>
                    </p>
                </div>
            </div>
            <div class="docs-homepage-section-preview get-started-framework card-vue-inverted flex-fill" style="height: auto; min-width: auto">
                <a href="../../vuejs-grid/" style="height: 4rem; background-size: 3rem 3rem;" title="Vue">Vue.js</a>
                <div class="d-none d-md-block">
                    <p>
                        <a href="../../vuejs-grid/" style="white-space: nowrap;">Get Started with Vue</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

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

        if (!$icon) { continue; }

        echo "<div class='docs-homepage-section-preview'>";
        echo "<div class='card'>";
        echo "<div class='newIcon $icon'></div>";
        echo "<h2>$title<div class=\"uiIcon icon-arrowBottom\">Open</div><div class=\"uiIcon icon-arrowTop\">Close</div></h2>";

        if ($groupConfig['items'] <> null) {
            renderItems($groupConfig['items'], 0, null, $title);
        }

        echo "</div>";
        echo "</div>";
    }
}

function renderItems($items, $level, $forceTopLevelSubItems = NULL, $parentTitle) {
    $levelClass = $level > 0 ? 'level' : '';

    if ($forceTopLevelSubItems <> NULL) {
        $levelClass = $levelClass.' top-level-sub-items';
    }

    echo "<ul class=\"docs-homepage-level$level-item $levelClass\">";

    foreach($items as $item) {
        echo "<li>";
        $title = ''.$forceTopLevelSubItems ? '<span class="parent-title">'.$parentTitle.' </span>'.$item['title'] : $item['title'];
        $url = $item['url'];
        $enterprise = $item['enterprise'];
        $childItems = $item['items'];
        $hasLink = $url <> "";
        $shouldHide = $item['showInCollapsed'] <> true;
        $shouldForceTopLevelSubItems = $item['forceTopLevelSubItems'];

        $spanClasses = '';

        if (!$hasLink) {
            $spanClasses = $spanClasses.'no-link';
        }

        if ($shouldHide) {
            $spanClasses = $spanClasses.' hide-collapsed';
        }

        echo "<span class=\"$spanClasses\">";

        if ($hasLink) {
            echo "<a href=\"../$url\">";
        }

        echo "$title";

        if ($enterprise) {
            echo "<span class=\"enterprise-icon\"></span>";
        }

        if ($hasLink) {
            echo "</a>";
        }

        if ($level > 0 and $forceTopLevelSubItems <> TRUE) {
            echo "<span class=\"item-split\">, &nbsp;</span>";
        }

        echo "</span>";

        if (!$item['hideChildren'] && $item['items'] <> null) {
            renderItems($item['items'], $level + 1, $shouldForceTopLevelSubItems, $title);
        }

        echo "</li>";
    }

    echo "</ul>";
}

?>

<?php include 'documentation_footer.php'; ?>
