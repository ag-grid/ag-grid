<?php
$menu_items = json_decode(file_get_contents('../documentation-main/menu.json'), true);

if (basename($_SERVER['PHP_SELF']) == 'index.php') {
    // 'my-fancy-best-dir-name/'
    $article_id = end(explode('/', dirname($_SERVER['PHP_SELF']))). "/";
} else {
    // 'my-fancy-best-dir-name/file.php'
    $article_id = join('/', array_slice(explode('/', $_SERVER['PHP_SELF']), -2, 2));
}

define('DOC_SECTION', $article_id);

function is_current($item) {
    return explode('#', $item['url'])[0] == DOC_SECTION;
}

function should_expand($item) {
    if (count($item['items']) == 0) {
        return false;
    }

    foreach ($item['items'] as $child) {
        if (is_current($child) || should_expand($child)) {
            return true;
        }
    }
    return false;
}

function render_menu_items($items) {
    if (count($items) == 0) {
        return;
    }

    echo "<ul>";
    foreach($items as $item) {
        $li_class = should_expand($item) ? ' class="expanded"' : '';
        echo "<li$li_class>";
        $enterprise_icon = ($item['enterprise'] ? '<span class="enterprise-icon">e</span>' : '');
        $new_marker = ($item['new'] ? '<span class="new-marker">new</span>' : '');
        if ($item['url']) {
            $url = $GLOBALS['rootFolder'] . $item['url'];
            $a_class = is_current($item) ? ' class="active"' : '';
            echo <<<LINK
                <a href="$url"$a_class>{$item['title']}$new_marker$enterprise_icon</a>
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
