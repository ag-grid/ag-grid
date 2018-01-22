<?php
$features = json_decode(file_get_contents(dirname(__FILE__) . '/features.json'), true);
$groups = json_decode(file_get_contents(dirname(__FILE__) . '/feature-groups.json'), true);

$mapped_features = [];
foreach($features as $feature) {
    $mapped_features[$feature['title']] = $feature;
}

foreach ($groups as $group) {
    echo "<div class=\"feature-group\"><h3>" . $group['group'] . "</h3></div>";
    foreach($group['items'] as $item) {
        $feature = $mapped_features[$item];
         
        if (!$feature['src']) {
            echo "<div " . ($feature["enterprise"] ? 'class="enterprise"' : '') . ">
                <h4><a href='/" . $feature['url'] . "'>" . $feature['title']  . "</a></h4>
                <div>
                    <p>" . $feature['description']  . "</p>
                </div>

                <div>" .  ($feature["snippet"] ? '<pre><code class="language-js">' . htmlspecialchars($feature['snippet']) . '</code></pre>' : '') . "</div>
            </div>";
        } else {
            echo "<div " . ($feature["enterprise"] ? 'class="enterprise"' : '') . ">
                <h4><a href='/" . $feature['url'] . "'>" . $feature['title']  . "</a></h4>
                <div>
                    <p>" . $feature['description']  . "</p>
                    " .  ($feature["snippet"] ? '<pre><code class="language-js">' . htmlspecialchars($feature['snippet']) . '</code></pre>' : '') . "
                </div>

                <div>
                    <a href='/" . $feature['url'] . "'><img src='/_assets/homepage/feature-placeholder.svg' data-src='/" . $feature['src'] . "' alt='" . $feature['title']. "'>See more</a>
                </div>
            </div>";
        }
    }
}
?>
