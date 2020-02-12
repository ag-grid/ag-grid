<?php
require_once 'example-runner.php';
$example = getExampleInfo('chart', 'angular');
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Angular 2 example</title>
    <script>document.write('<base href="' + document.location + '" />');</script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <style media="only screen">
      html, body {
        height: 100%;
        width: 100%;
        margin: 0;
        box-sizing: border-box;
        -webkit-overflow-scrolling: touch;
      }
      html {
        position: absolute;
        top: 0;
        left: 0;
        padding: 0;
        overflow: auto;
      }
      body {
        padding: 1rem;
        overflow: auto;
      }
    </style>

    <!-- Polyfills -->
    <script src="https://unpkg.com/core-js@2.6.5/client/shim.min.js"></script>
    <script src="https://unpkg.com/zone.js@0.8.17/dist/zone.js"></script>
    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>

    <script>
        var appLocation = '<?= $example["appLocation"] ?>';
        var boilerplatePath = '<?= $example["boilerplatePath"] ?>';
        var systemJsMap = <?= json_encode($chartSystemJsMap, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?>;
<?php
        if (!empty($chartSystemJsCommunityPaths)) {
?>
        var systemJsPaths = <?= json_encode($chartSystemJsCommunityPaths, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?>;
<?php
        }
?>
    </script>

    <script src="<?= $example["boilerplatePath"] ?>systemjs.config.js"></script>
    <?= getNonGeneratedScriptTags($example['scripts']); ?>
    <script>
        System.import('<?=$example['boilerplatePath']?>main.ts').catch(function(err) { console.error(err); });
    </script>
  </head>
  <body>
    <my-app>Loading Angular example&hellip;</my-app>
  </body>
</html>
