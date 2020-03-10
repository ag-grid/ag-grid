<?php

    function getJsonFromFile($path) {
        return json_decode(file_get_contents($path));
    }

    function createPropertyTable($title, $properties, $prefix = null, $skipHeader = false, $names = []) {
        $toProcess = [];
        $newPrefix = isset($prefix) ? "$prefix.$title" : $title;

        if (!$skipHeader) {
            $displayName = $properties->meta->displayName;

            if (!isset($displayName)) {
                $displayName = $title;
            }

            $headerTag = isset($prefix) ? "h3" : "h2";

            echo "<$headerTag id='$newPrefix'>$displayName</$headerTag>";

            $description = $properties->meta->description;

            if (isset($description)) {
                echo "<p>$description</p>";
            }
        }

        echo '<table class="table content reference">';

        foreach ($properties as $name => $definition) {
            if ($name == 'meta' || (!empty($names) && !in_array($name, $names))) {
                continue;
            }

            echo "<tr><td><span class='reference__name'><code>$name</code></span>";

            if (isset($definition->description)) {
                // process property object
                if (isset($definition->isRequired)) {
                    echo "<br /><span class='reference__required'>Required</span>";
                }

                echo "</td><td>$definition->description";

                $more = $definition->more;

                if (isset($more->url)) {
                    echo " See <a href='$more->url'>$more->name</a>.";
                }

                if (isset($definition->default)) {
                    echo "<br />Default: <code>" . formatJson($definition->default) . "</code>";
                }

                if (isset($definition->options)) {
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
                $targetId = "$newPrefix.$name";
                echo "</td><td>";

                if (isset($definition->meta->description)) {
                    echo $definition->meta->description . " ";
                }

                echo "See <a href='#$targetId'>$name</a> for more details about this configuration object.</td></tr>";
                $toProcess[$name] = $definition;
            }
        }

        echo '</table>';

        foreach ($toProcess as $name => $definition) {
            createPropertyTable($name, $definition, $newPrefix);
        }
    }

    function createCodeSample($type) {
        $arguments = isset($type->parameters) ? ['params' => $type->parameters] : $type->arguments;
        $returnType = $type->returnType;
        $returnTypeIsObject = is_object($returnType);
        $argumentDefinitions = [];

        foreach ($arguments as $name => $argumentType) {
            $type = is_object($argumentType) ? ucfirst($name) . 'Type' : $argumentType;
            $argumentDefinitions[] = "$name: $type";
        }

        $lines = [
            'function(' . implode(",\n         ", $argumentDefinitions) . '): ' . ($returnTypeIsObject ? 'ReturnType' : $returnType) . ';',
            '',
        ];

        foreach ($arguments as $name => $argumentType) {
            if (!is_object($argumentType)) {
                continue;
            }

            $lines[] = 'interface ' . ucfirst($name) . 'Type' . ' {';

            foreach ($argumentType as $name => $type) {
                $lines[] = "    $name: $type;";
            }

            array_push($lines, '}', '');
        }

        if ($returnTypeIsObject) {
            array_push($lines, '', 'interface ReturnType {');

            foreach ($returnType as $name => $parameterType) {
                $lines[] = "    $name: $parameterType;";
            }

            $lines[] = '}';
        }

        echo "<snippet class='language-ts reference__code'>" . implode("\n", $lines) . "</snippet>";
    }

    function createDocumentationFromFile($path, $expression = null, $names = []) {
        $properties = getJsonFromFile($path);

        if (isset($expression)) {
            $keys = explode(".", $expression);
            $key = null;

            while (count($keys) > 0) {
                $key = array_shift($keys);
                $properties = $properties->$key;
            }

            createPropertyTable($key, $properties, $expression, true, $names);
        } else {
            foreach ($properties as $key => $val) {
                createPropertyTable($key, $val);
            }
        }
    }

    function formatJson($value) {
        $json = json_encode($value, JSON_PRETTY_PRINT);
        $json = preg_replace("/\[\s+(.*)\s+\]/s", "[$1]", $json); // remove outer spaces from arrays
        $json = str_replace('"', "'", $json); // use single quotes

        return $json;
    }
