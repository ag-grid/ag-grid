<header class="Header <?php if ($navKey == "demo") { ?>Header--demo<?php }?> navbar navbar-inverse navbar-logo navbar-hiddenxs">
    <div class="container">
        <div class="row">
            <a class="visible-xs navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse" id="nav-toggle" href="javascript:void(0);">
                <div class="patty"></div>
            </a>
            <div class="navbar-header col-md-2 col-sm-3 col-xs-6">
                <a class="Header-logo" href="/">
                    <span class="Header-logo--alt">ag</span>-Grid
                </a>
            </div>
            <div class="Header-share col-md-3 col-sm-4 col-xs-6">
               <span class="pull-left">
                   <iframe src="https://ghbtns.com/github-btn.html?user=ceolter&repo=ag-grid&type=star&count=true"
                            frameborder="0" scrolling="0" width="120px" height="20px"
                            style="position: relative; top: 3px;" class="hide-when-small">
                    </iframe>
                </span>          
            </div>
            <div class="navbar-collapse collapse pull-right col-md-5 col-sm-6 col-xs-12">
            <ul class="nav navbar-nav navbar-right">
                    <li class="<?php if ($navKey == "demo") { ?>active<?php }?>">
                        <a href="/example.php">Demo</a>
                    </li>
                    <li class="<?php if ($navKey == "documentation") { ?>active<?php }?>">
                        <a href="/documentation-main/documentation.php">Documentation</a>
                    </li>

                    <li class="<?php if ($navKey == "support") { ?>active<?php }?>">
                        <a href="/support.php">Support</a>
                    </li>

                    <li class="dropdown <?php if ($navKey == "about") { ?>active<?php }?>">
                        <a data-toggle="dropdown" class="dropdown-toggle" href="/about.php">About <b class="caret hidden-xs"></b></a>
                        <ul class="dropdown-menu hidden-xs">
                            <li>
                                <a href="/about.php">About ag-Grid</a>
                            </li>
                            <li>
                                <a href="/about.php#team">Meet The Team</a>
                            </li>
                             <li>
                                <a href="/media.php">Media</a>
                            </li>
                            <li>
                                <a href="/testimonials.php">Testimonials</a>
                            </li>
                        </ul>
                    </li>

                    <li class="Header-cta <?php if ($navKey == "licenseAndPricing") { ?> active<?php }?>">
                        <a href="/license-pricing.php"><span class="glyphicon glyphicon-shopping-cart"></span>
                            Pricing</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</header>