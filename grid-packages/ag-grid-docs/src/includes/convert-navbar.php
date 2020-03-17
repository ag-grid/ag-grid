<nav>
    <a id="logo" href="/" title="The Best HTML 5 Grid in the World">ag-Grid</a>

    <button id="navbar-toggle" 
        type="button" 
        data-toggle="collapse" data-target="#main-nav" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation">
        <span>&nbsp;</span>
    </button>
    <div class="collapse navbar-collapse sticky-top" id="main-nav">
        <?php if ($version == 'latest') { ?>
            <ul>
                                <li class="<?php if ($navKey == "demo") { ?>active<?php }?>">
                    <a href="/example.php">Demo</a>
                </li>
                <li class="<?php if ($navKey == "getting-started") { ?>active<?php }?>">
                    <a href="/javascript-grid-getting-started/">Getting Started</a>
                </li>
                <li class="<?php if ($navKey == "features-overview") { ?>active<?php }?>">
                    <a href="/features-overview/">Features Overview</a>
                </li>
                <li class="<?php if ($navKey == "documentation") { ?>active<?php }?>">
                    <a href="/documentation-main/documentation.php">Documentation</a>
                </li>

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
