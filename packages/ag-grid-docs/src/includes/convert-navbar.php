<nav>
    <a id="logo" href="/" title="The Best HTML 5 Grid in the World">ag-Grid</a>

    <button id="navbar-toggle" 
        type="button" 
        data-toggle="collapse" data-target="#main-nav" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation">
        <span>&nbsp;</span>
    </button>
    <div class="collapse navbar-collapse" id="main-nav">
        <?php if ($version == 'latest') { ?>
            <ul>


                <?php if (!defined('HOMEPAGE')) { ?>
                <li id="trial" class="<?php if ($navKey == "trial") { ?> active<?php }?>">
                    <a href="/start-trial.php">Start Your 2-Month Free Trial</a>
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
