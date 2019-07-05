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
    return $item['url'] && explode('#', $item['url'])[0] == DOC_SECTION;
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

function render_menu_items($items, $gtm = array()) {
    if (count($items) == 0) {
        return;
    }

    echo "<ul>";
    foreach($items as $item) {
        $item_gtm = array_merge($gtm, ($item['gtm'] ? $item['gtm'] : array()));
        $current = is_current($item);
        $li_class = should_expand($item) || $current ? ' class="expanded"' : '';

        echo "<li$li_class>";

        $enterprise_icon = ($item['enterprise'] ? '<span class="enterprise-icon">e</span>' : '');
        $new_marker = ($item['new'] ? '<span class="new-marker">new</span>' : '');
        if ($item['url']) {
            $url = $GLOBALS['rootFolder'] . $item['url'];
            $a_classes = array();
            if ($current) {
                array_push($a_classes, 'active');
            } 

            if (count($item['items']) > 0) {
                array_push($a_classes, 'has-children');
            }

            $a_class = count($a_classes) > 0 ? ' class="' . join($a_classes, ' ') . '"' : '';

            if ($current) {
                $GLOBALS['DOC_GTM'] = json_encode($item_gtm);
            }
            echo <<<LINK
                <a href="$url"$a_class>{$item['title']}$new_marker$enterprise_icon</a>
LINK;
        } else {
            echo "<span>{$item['title']}</span>";
        }

        render_menu_items($item['items'], $item_gtm);
        echo "</li>";
    }
    echo "</ul>";
}

render_menu_items($menu_items, array());
?>
<script>
dataLayer.push(<?=$GLOBALS['DOC_GTM'] ?>);
</script>
