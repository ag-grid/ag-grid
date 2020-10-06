<?php

    function getJsonFromFile($path) {
        return json_decode(file_get_contents($path));
    }

    function createPropertyTable($title, $properties, $config = [], $breadcrumbs = [], $names = []) {
        $meta = $properties->meta;
        $displayName = $meta->displayName;

        if (!isset($displayName)) {
            $displayName = $title;
        }

        $breadcrumbs[$title] = $displayName;
        $id = join(array_keys($breadcrumbs), '.');

        if (!$config['isSubset']) {
            $headerLevel = count($breadcrumbs) + 1;
            $headerTag = "h$headerLevel";

            echo "<$headerTag id='reference-$id'>$displayName</$headerTag>";

            createBreadcrumbsLink($breadcrumbs);

            $description = generateCodeTags($meta->description);

            if (isset($description)) {
                echo "<p>$description</p>";
            }

            $page = $meta->page;

            if (isset($page)) {
                echo "<p>See <a href='$page->url'>$page->name</a> for more information.</p>";
            }
        }

        if ($config['showSnippets'] && empty($names)) {
            createObjectCodeSample($breadcrumbs, $properties);
        }

        if (count(array_filter(array_keys(get_object_vars($properties)), function($key) { return $key !== 'meta'; })) < 1) { return; }

        echo '<table class="table content reference">';

        $objectProperties = [];

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

                $description = generateCodeTags($definition->description);

                echo "</td><td>$description";

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
                echo "</td><td>";

                if (isset($definition->meta->description)) {
                    echo generateCodeTags($definition->meta->description);

                    if (strpos($definition->meta->description, '<br')) {
                        echo '<br /><br />';
                    } else {
                        echo ' ';
                    }
                }

                echo "See <a href='#reference-$id.$name'>$name</a> for more details about this configuration object.</td>";
                $objectProperties[$name] = $definition;
            }

            if ($definition->relevantTo && empty($names)) {
                echo '<td style="white-space: nowrap;">' . join($definition->relevantTo, ', ') . '</td>';
            }

            echo '</tr>';
        }

        echo '</table>';

        $config['isSubset'] = false;

        foreach ($objectProperties as $name => $definition) {
            createPropertyTable($name, $definition, $config, $breadcrumbs);
        }
    }

    function createBreadcrumbsLink($breadcrumbs) {
        if (count($breadcrumbs) <= 1) { return; }

        $href = '';
        $links = [];
        $index = 0;

        foreach ($breadcrumbs as $key => $text) {
            $href .= (strlen($href) > 0 ? '.' : 'reference-') . $key;

            if ($index < count($breadcrumbs) - 1) {
                $links[] = "<a href='#$href'" . ($text !== $key ? " title='$text'" : '') . ">$key</a>";
            } else {
                $links[] = $key;
            }

            $index++;
        }

        echo '<div class="reference__breadcrumbs">' . join($links, ' &gt; ') . '</div>';
    }

    function generateCodeTags($content) {
        return preg_replace('/\`(.*?)\`/', "<code>$1</code>", $content);
    }

    function getIndent($indentationLevel) {
        return str_repeat('  ', $indentationLevel);
    }

    function createObjectCodeSample($breadcrumbs, $properties) {
        $lines = [];
        $indentationLevel = 0;

        foreach ($breadcrumbs as $key => $title) {
            $indent = getIndent($indentationLevel);

            if ($indentationLevel > 0) {
                $lines[] = $indent . '...';
            }

            $lines[] = "$indent$key: {";
            $indentationLevel++;
        }

        foreach ($properties as $name => $definition) {
            if ($name == 'meta') {
                continue;
            }

            $line = getIndent($indentationLevel) . $name;

            // process property object
            if (!isset($definition->isRequired) || !$definition->isRequired) {
                $line .= '?';
            }

            $line .= ': ';

            if (isset($definition->meta->type)) {
                $line .= $definition->meta->type;
            }
            else if (isset($definition->type)) {
                $line .= is_object($definition->type) ? 'Function' : $definition->type;
            }
            else if (isset($definition->options)) {
                $line .= implode(' | ', array_map(formatJson, $definition->options));
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

        for (; $indentationLevel > 0; $indentationLevel--) {
            $lines[] = getIndent($indentationLevel - 1) . '}';
        }

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
                $lines[] = "  $name: $type;";
            }

            $lines[] = '}';
        }

        if ($returnTypeIsObject) {
            array_push($lines, '', 'interface IReturn {');

            foreach ($returnType as $name => $parameterType) {
                $lines[] = "  $name: $parameterType;";
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
            $config['isSubset'] = true;

            createPropertyTable($key, $properties, $config, [], $names);
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
        $json = preg_replace_callback('/\[(.*)\]/s',
            function($match) {
                return '[' . preg_replace('/,\s+/', ', ', trim($match[1])) . ']';
            }
        , $json); // remove carriage returns from arrays
        $json = str_replace('"', "'", $json); // use single quotes

        return $json;
    }
