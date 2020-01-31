<?php

    function getJsonFromFile($path) {
        return json_decode(file_get_contents($path));
    }

    function createPropertyTable($title, $properties, $prefix = null) {
        $toProcess = [];
        $displayName = $properties->meta->displayName ?? $title;
        $newPrefix = isset($prefix) ? "$prefix--$title" : $title;

        $headerTag = isset($prefix) ? "h3" : "h2";

        echo "<$headerTag id='$newPrefix'>$displayName</$headerTag>";

        $description = $properties->meta->description;

        if (isset($description)) {
            echo "<p>$description</p>";
        }

        echo '<table class="table content reference">';

        foreach ($properties as $name => $definition) {
            if ($name == 'meta') {
                continue;
            }

            echo "<tr><td><span class='reference__name'><code>$name</code></span>";

            if (isset($definition->description)) {
                // process property object
                if (isset($definition->isRequired)) {
                    echo "<br /><span class='reference__required'>Required</span>";
                }

                echo "</td><td>$definition->description";

                $example = $definition->example;

                if (isset($example->url)) {
                    echo " See <a href='$example->url'>$example->name</a>.";
                }

                if ($definition->default) {
                    echo "<br />Default: <code>" . formatJson($definition->default) . "</code>";
                }

                if ($definition->options) {
                    echo "<br />Options: <code>" . implode(' | ', array_map(formatJson, $definition->options)) . "</code>";
                }

                if (is_object($definition->type)) {
                    createCodeSample($definition->type);
                }

                echo "</td></tr>";
            } else if (is_string($definition)) {
                // process simple property string
                echo "</td><td>$definition</td></tr>";
            } else {
                // this must be the parent of a child object
                $targetId = "$newPrefix--$name";
                echo "</td><td>See <a href='#$targetId'>$name</a> for details of this configuration object.</td></tr>";
                $toProcess[$name] = $definition;
            }
        }

        echo '</table>';

        foreach ($toProcess as $name => $definition) {
            createPropertyTable($name, $definition, $newPrefix);
        }
    }

    function createCodeSample($type) {
        $parameters = $type->parameters;
        $returnType = $type->returnType;
        $returnTypeIsObject = is_object($returnType);

        $lines = [
            "function(params: ParamsType): " . ($returnTypeIsObject ? 'ReturnType' : $returnType) . ";",
            "",
            "interface ParamsType {"
        ];

        foreach ($parameters as $name => $parameterType) {
            $lines[] = "    $name: $parameterType;";
        }

        $lines[] = "}";

        if ($returnTypeIsObject) {
            array_push($lines, "", "interface ReturnType {");

            foreach ($returnType as $name => $parameterType) {
                $lines[] = "    $name: $parameterType;";
            }

            $lines[] = "}";
        }

        echo "<snippet class='language-ts reference__code'>" . implode("\n", $lines) . "</snippet>";
    }

    function createDocumentationFromFile($path) {
        $properties = getJsonFromFile("../javascript-charts-api-explorer/config.json");

        foreach ($properties as $key => $val) {
            createPropertyTable($key, $val);
        }
    }

    function formatJson($value) {
        $json = json_encode($value, JSON_PRETTY_PRINT);
        $json = preg_replace("/\[\s+(.*)\s+\]/s", "[$1]", $json); // remove outer spaces from arrays
        $json = str_replace('"', "'", $json); // use single quotes

        return $json;
    }

?>