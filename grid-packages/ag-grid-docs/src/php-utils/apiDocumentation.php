<?php

    function getJsonFromFile($path) {
        return json_decode(file_get_contents($path));
    }

    function createPropertyTable($title, $properties, $config = [], $prefix = null, $names = []) {
        $toProcess = [];
        $newPrefix = isset($prefix) ? "$prefix.$title" : $title;

        if (!$config['skipHeader']) {
            $meta = $properties->meta;
            $displayName = $meta->displayName;

            if (!isset($displayName)) {
                $displayName = $title;
            }

            $headerTag = isset($prefix) ? "h3" : "h2";

            echo "<$headerTag id='$newPrefix'>$displayName</$headerTag>";

            $description = $meta->description;

            if (isset($description)) {
                echo "<p>$description</p>";
            }

            $page = $meta->page;

            if (isset($page)) {
                echo "<p>See <a href='$page->url'>$page->name</a> for more information.</p>";
            }
        }

        echo '<table class="table content reference">';

        foreach ($properties as $name => $definition) {
            if ($name == 'meta' ||
                (!empty($names) && !in_array($name, $names) && !in_array($names[0], $definition->relevantTo))) {
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
                    echo '<br />Options: <code>' . implode('</code>, <code>', array_map(formatJson, $definition->options)) . '</code>';
                }

                if (is_object($definition->type)) {
                    createFunctionCodeSample($definition->type);
                }

                echo "</td>";
            } else if (is_string($definition)) {
                // process simple property string
                echo "</td><td>$definition</td>";
            } else {
                // this must be the parent of a child object
                $targetId = "$newPrefix.$name";
                echo "</td><td>";

                if (isset($definition->meta->description)) {
                    echo $definition->meta->description . " ";
                }

                echo "See <a href='#$targetId'>$name</a> for more details about this configuration object.</td>";
                $toProcess[$name] = $definition;
            }

            if ($definition->relevantTo && empty($names)) {
                echo '<td style="white-space: nowrap;">' . join($definition->relevantTo, ', ') . '</td>';
            }

            echo '</tr>';
        }

        echo '</table>';

        if ($config['showSnippets'] && empty($names)) {
            createObjectCodeSample($title, $properties);
        }

        foreach ($toProcess as $name => $definition) {
            createPropertyTable($name, $definition, $config, $newPrefix);
        }
    }

    function createObjectCodeSample($name, $properties) {
        $lines = [
            'interface I' . ucfirst($name) . ' {',
        ];

        foreach ($properties as $name => $definition) {
            if ($name == 'meta') {
                continue;
            }

            $line = '  ' . $name;

            // process property object
            if (!isset($definition->isRequired) || !$definition->isRequired) {
                $line .= '?';
            }

            $line .= ': ';

            if (isset($definition->options)) {
                $line .= implode(' | ', array_map(formatJson, $definition->options));
            }
            else if (isset($definition->type)) {
                $line .= is_object($definition->type) ? 'Function' : $definition->type;
            }
            else if (isset($definition->default)) {
                $type = gettype($definition->default);

                if ($type === 'integer' || $type === 'double') {
                    $type = 'number';
                }

                if ($type === 'array') {
                    $type = 'any[]';
                }

                $line .= $type;
            }
            else if (isset($definition->description)) {
                $line .= 'any';
            }
            else {
                $line .= 'I' . ucfirst($name);
            }

            $line .= ';';

            if (isset($definition->default)) {
                $line .= ' // default: ' . formatJson($definition->default);
            }

            $lines[] = $line;
        }

        $lines[]= '}';

        echo "<snippet class='language-ts reference__code'>" . implode("\n", $lines) . "</snippet>";
    }

    function createFunctionCodeSample($type) {
        $arguments = isset($type->parameters) ? ['params' => $type->parameters] : $type->arguments;
        $returnType = $type->returnType;
        $returnTypeIsObject = is_object($returnType);
        $argumentDefinitions = [];

        foreach ($arguments as $name => $argumentType) {
            $type = is_object($argumentType) ? 'I' . ucfirst($name) : $argumentType;
            $argumentDefinitions[] = "$name: $type";
        }

        $lines = [
            'function (' . implode(",\n         ", $argumentDefinitions) . '): ' . ($returnTypeIsObject ? 'IReturn' : $returnType) . ';',
            '',
        ];

        foreach ($arguments as $name => $argumentType) {
            if (!is_object($argumentType)) {
                continue;
            }

            $lines[] = 'interface I' . ucfirst($name) . ' {';

            foreach ($argumentType as $name => $type) {
                $lines[] = "    $name: $type;";
            }

            $lines[] = '}';
        }

        if ($returnTypeIsObject) {
            array_push($lines, '', 'interface IReturn {');

            foreach ($returnType as $name => $parameterType) {
                $lines[] = "    $name: $parameterType;";
            }

            $lines[] = '}';
        }

        echo "<snippet class='language-ts reference__code'>" . implode("\n", $lines) . "</snippet>";
    }

    function createDocumentationFromFile($path, $expression = null, $names = [], $config = []) {
        createDocumentationFromFiles([$path], $expression, $names, $config);
    }

    function createDocumentationFromFiles($paths, $expression = null, $names = [], $config = []) {
        if (count($paths) === 0) {
            return;
        }

        $propertiesFromFiles = array_map(function($path) { return getJsonFromFile($path); }, $paths);

        if (isset($expression)) {
            $keys = explode('.', $expression);
            $key = null;

            while (count($keys) > 0) {
                $key = array_shift($keys);

                foreach ($propertiesFromFiles as &$propertiesFromFile) {
                    $propertiesFromFile = $propertiesFromFile->$key;
                }

                unset($propertiesFromFile);
            }

            $properties = mergeObjects($propertiesFromFiles);

            $config['skipHeader'] = true;

            createPropertyTable($key, $properties, $config, $expression, $names);
        } else {
            $properties = mergeObjects($propertiesFromFiles);

            foreach ($properties as $key => $val) {
                createPropertyTable($key, $val, $config);
            }
        }
    }

    function mergeObjects($objects) {
        $result = $objects[0];

        foreach (array_slice($objects, 1) as $object) {
            foreach ($object as $key => $val) {
                $result->$key = $val;
            }
        }

        return $result;
    }

    function formatJson($value) {
        $json = json_encode($value, JSON_PRETTY_PRINT);
        $json = preg_replace_callback("/\[(.*)\]/s",
            function($match) {
                return '[' . preg_replace('/,\s+/', ', ', trim($match[1])) . ']';
            }
        , $json); // remove carriage returns from arrays
        $json = str_replace('"', "'", $json); // use single quotes

        return $json;
    }
