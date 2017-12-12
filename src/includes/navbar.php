<nav>
    <h1><a id="logo" href="#" title="The Best HTML 5 Grid in the World">ag-Grid</a></h1>

    <button id="navbar-toggle" 
        type="button" 
        data-toggle="collapse" data-target="#main-nav" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation">
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
                <li class="<?php if ($navKey == "blog") { ?>active<?php }?>">
                    <a href="/media/media.php">Blog</a>
                </li>

                <li class="<?php if ($navKey == "support") { ?>active<?php }?>">
                    <a href="/support.php">Support</a>
                </li>

                <li class="<?php if ($navKey == "about") { ?>active<?php }?>">
                    <a href="/about.php">About</a>
                </li>

                <li class="<?php if ($navKey == "licenseAndPricing") { ?> active<?php }?>">
                    <a href="/license-pricing.php">Pricing</a>
                </li>
                <?php if (!defined('HOMEPAGE')) { ?>
                <li id="trial" class="<?php if ($navKey == "trial") { ?> active<?php }?>">
                    <a href="/start-trial.php">Free Trial</a>
                </li>
                <?php }?>
            </ul>
        <?php } else { ?> 
            <ul>
                <li>
                    <a href="<?php print($rootFolder) ?>"> ag-Grid Archive Documentation <?php print($version) ?></a>
                </li>
            </ul>
        <?php } ?> 
    </div>
</nav>
