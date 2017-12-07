<?php
$menu_items = json_decode(file_get_contents('../documentation-main/menu.json'), true);

function render_menu_items($items) {
    if (count($items) == 0) {
        return;
    }

    echo "<ul>";
    foreach($items as $item) {
        echo "<li>";
        $enterprise_icon = ($item['enterprise'] ? '<span class="enterprise-icon">e</span>' : '');
        if ($item['url']) {
            $url = $GLOBALS['rootFolder'] . $item['url'];
            echo <<<LINK
                <a href="{$url}">{$item['title']} $enterprise_icon</a>
LINK;
        } else {
            echo "<span>{$item['title']}</span>";
        }

        render_menu_items($item['items']);
        echo "</li>";
    }
    echo "</ul>";
}

render_menu_items($menu_items);
?>

<div>
    <a class="sidebarLink" href="/archive/">Archive Docs</a>
</div>
