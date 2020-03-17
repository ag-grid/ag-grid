<nav class="nav<?php if (defined('HOMEPAGE')) { ?> home<?php }?>">
    <a id="logo" href="/" title="The Best Javascript Grid in the World">
        <div></div>
        ag-Grid
    </a>
    <button id="navbar-toggle" 
        type="button"
        data-toggle="collapse"
        data-target="#main-nav"
        aria-label="Toggle navigation">
        <span>&nbsp;</span>
    </button>
    <div class="collapse navbar-collapse" id="main-nav">
        <?php if ($version == 'latest') { ?>
            <ul>
                <li class="<?php if ($navKey == "demo") { ?>active<?php }?>">
                    <a href="/example.php">Demo</a>
                </li>
                <li class="<?php if ($navKey == "documentation") { ?>active<?php }?>">
                    <a href="/documentation-main/documentation.php">Documentation</a>
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
                    <a href="<?php print($rootFolder) ?>"> ag-Grid Archive Documentation <?php print($version) ?> <?php print($latest_hash) ?> <?php print($latest_hash_timestamp) ?></a>
                </li>
            </ul>
        <?php } ?> 
    </div>
</nav>
