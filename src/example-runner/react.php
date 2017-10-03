<?php
include 'utils.php';
$example = getExampleInfo('react');
$generated = isset($_GET['generated']);
if ($generated) { 
    echo "<!DOCTYPE html>\n";
};
?>
<html>
<head>
    <title>ag-Grid React Example</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style> html, body, #root { margin: 0; padding: 0; height: 100%; } </style>
<?php renderExampleExtras($_GET) ?>
<?php renderStyles($example['styles']); ?>
</head>
<body>
    <div id="root">Loading ag-Grid React example&hellip;</div>
    
    <script>
        var appLocation = '<?= $example['appLocation'] ?>';
        var boilerplatePath = '<?= $example['boilerplatePath'] ?>';
        var systemJsMap = <?= json_encode($systemJsMap) ?>
    </script>

    <script src="https://unpkg.com/systemjs@0.19.39/dist/system.src.js"></script>
    <script src="<?=$example['boilerplatePath']?>systemjs.config.js"></script>

<?php if ($generated && !$example['preview']) { ?>
    <script src="<?=$example['boilerplatePath']?>../systemjs-fetch-override.js"></script>
    <script src="../dist/vanilla-to-react.js"></script>
    <script>

    var gridSettings = <?=json_encode($example['gridSettings']) ?>;

    var filesToMock = [
        {
            name: 'index.jsx',
            url: '<?=$example["scripts"][0] ?>',
            transform: function(source) { 
                return vanillaToReact(source, gridSettings);
            }
        },
    ];

    registerMockedFiles(filesToMock, function() {
        System.import('<?=$example['appLocation']?>index.jsx').catch(function(err){ console.error(err); });
    });
    </script>
<?php } else { ?>
    <script>
      System.import('<?=$example['appLocation']?>index.jsx').catch( function(err) { console.error(err); })
    </script>
<?php } ?>
</body>
</html>
