<?php
error_reporting(E_STRICT);

$menu_items = json_decode(file_get_contents('../documentation-main/menu.json'), true);

if (basename($_SERVER['PHP_SELF']) == 'index.php') {
    $parts = explode('/', dirname($_SERVER['PHP_SELF']));
    // 'my-fancy-best-dir-name/'
    $article_id = end($parts). "/";
} else {
    // 'my-fancy-best-dir-name/file.php'
    $parts = explode('/', $_SERVER['PHP_SELF']);
    $article_id = join('/', array_slice($parts, -2, 2));
}

define('DOC_SECTION', $article_id);

function is_current($item) {
    return (!is_bool($item['disableActive']) || !$item['disableActive']) &&
        $item['url'] &&
        explode('#', $item['url'])[0] === DOC_SECTION;
}

function should_expand($item) {
    if (count($item['items']) === 0) {
        return false;
    }

    if (is_current($item)) {
        return true;
    }

    foreach ($item['items'] as $child) {
        if (is_current($child) || should_expand($child)) {
            return true;
        }
    }

    return false;
}

function render_titles($items, $gtm = array()) {
    echo "<ul>";
    foreach ($items as $item) {
        $actualMenuItems = $item['items'];
        render_menu_items($actualMenuItems, $gtm, 1);
    }
    echo "</ul>";

}

function render_menu_items($items, $gtm, $level) {
    if (count($items) === 0) {
        return;
    }

    if ($level > 1) {
        echo "<ul>";
    }

    foreach($items as $item) {
        $item_gtm = array_merge($gtm, ($item['gtm'] ? $item['gtm'] : array()));
        $isCurrent = is_current($item);
        $isCategory = $level === 1 || $item['isCategory'];
        $li_class = !$isCategory || should_expand($item) ? ' class="expanded"' : '';

        echo "<li$li_class>";

        $enterprise_icon = $item['enterprise'] ? '<span class="enterprise-icon">e</span>' : '';
        $new_marker = $item['new'] ? '<span class="new-marker">new</span>' : '';

        if ($item['url']) {
            $url = $GLOBALS['rootFolder'] . $item['url'];
            $a_classes = array();

            if ($current) {
                array_push($a_classes, 'active');
            }

            if ($isCategory) {
                array_push($a_classes, 'has-children');
            }

            $a_class = count($a_classes) > 0 ? ' class="' . join($a_classes, ' ') . '"' : '';

            if ($isCurrent) {
                $GLOBALS['DOC_GTM'] = json_encode($item_gtm);
            }
            echo "<a href=\"$url\"$a_class>{$item['title']}$new_marker$enterprise_icon</a>";
        } else {
            $class = $isCategory ? 'has-children' : '';
            echo "<span class='$class'>{$item['title']}</span>";
        }

        if (!$item['hideChildren']) {
            render_menu_items($item['items'], $item_gtm, $level + 1);
        }

        echo "</li>";
    }

    if ($level > 1) {
        echo "</ul>";
    }
}

render_titles($menu_items, array());
?>
<script>
dataLayer.push(<?=$GLOBALS['DOC_GTM'] ?>);
</script>
