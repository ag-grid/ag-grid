<nav class="nav<?php if (defined('HOMEPAGE')) { ?> home<?php }?>">
    <a id="logo" href="/" title="The Best Javascript Grid in the World">
        <div></div>
        AG Grid
    </a>
    <div class="" id="main-nav" style="display: flex; flex-wrap: wrap; flex-grow: 1;">
        <?php if ($version == 'latest') { ?>
            <ul style="flex-flow: wrap;">
                <li class="<?php if ($navKey == "demo") { ?>active<?php }?>">
                    <a href="/example.php">Demo</a>
                </li>
                <li class="<?php if ($navKey == "documentation") { ?>active<?php }?>">
                    <a href="/documentation/">Documentation</a>
                </li>

                <li class="<?php if ($navKey == "licenseAndPricing") { ?>active<?php }?>">
                <a href="/license-pricing.php">Pricing</a>
            </li>
            <li>
                <a href="https://blog.ag-grid.com/" target="_blank">Blog</a>
            </li>
        </ul>
        <?php } else { ?>
            <ul>
                <li>
                    <a href="<?php print($rootFolder) ?>"> AG Grid Archive Documentation <?php print($version) ?> <?php print($latest_hash) ?> <?php print($latest_hash_timestamp) ?></a>
                </li>
            </ul>
        <?php } ?>
    </div>
</nav>
