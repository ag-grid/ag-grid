<?php
$pageTitle = "Charts Standalone: API";
$pageDescription = "ag-Grid is a feature-rich data grid that can also chart data out of the box. Learn how to chart data directly from inside ag-Grid.";
$pageKeyboards = "Javascript Grid Charting";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<h1 class="heading">Charts Standalone - API</h1>

<p class="lead">
    This section details the standalone chart API.
</p>

<?php
    function createPropertyTable($title, $properties, $prefix = null) {
        $toProcess = [];
        $displayName = $properties->meta->displayName ?? $title;
        $newPrefix = isset($prefix) ? "$prefix--$title" : $title;

        if (isset($prefix)) {
            echo "<h3 id='$newPrefix'>$displayName</h3>";
        } else {
            echo "<h2 id='$newPrefix'>$displayName</h2>";
        }

        $description = $properties->meta->description;

        if (isset($description)) {
            echo "<p>$description</p>";
        }

        echo '<table class="table content reference">';

        foreach ($properties as $key => $val) {
            if ($key == 'meta') {
                continue;
            }

            if (isset($val->description)) {
                // process property object
                echo "<tr><th>$key</th>";
                echo "<td>";
                echo $val->description;

                $example = $val->example;

                if (isset($example->name)) {
                    echo " See <a href='$example->url'>$example->name</a>";
                }

                echo "</td>";
                echo "</tr>";
            } else if (is_string($val)) {
                // process simple property string
                echo "<tr><th>$key</th><td>$val</td></tr>";
            } else {
                // this must be the parent of a child object
                $targetId = "$newPrefix--$key";
                echo "<tr><th>$key</th><td>An object with properties described in <a href='#$targetId'>$key</a>.</td></tr>";
                $toProcess[$key] = $val;
            }
        }

        echo '</table>';

        foreach ($toProcess as $key => $val) {
            createPropertyTable($key, $val, $newPrefix);
        }
    }

    $properties = json_decode(file_get_contents("../javascript-charts-api-explorer/config.json"));

    foreach ($properties as $key => $val) {
        createPropertyTable($key, $val);
    }
?>

<?php include '../documentation-main/documentation_footer.php'; ?>
