<header class="Header navbar navbar-inverse navbar-logo navbar-hiddenxs">
    <div class="container">
        <div class="row">
            <a class="visible-xs navbar-toggle" id="nav-toggle" href="javascript:void(0);">
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
                    <li class="<?php if ($navKey == "media") { ?>active<?php }?>">
                        <a href="/media.php">Media</a>
                    </li>
                    <li class="<?php if ($navKey == "support") { ?>active<?php }?>">
                        <a href="/support.php">Support</a>
                    </li>
                    <li class="Header-cta <?php if ($navKey == "licenseAndPricing") { ?> active<?php }?>">
                        <a href="/licenseAndPricing.php"><span class="glyphicon glyphicon-shopping-cart"></span>
                            Pricing</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</header>


<!-- 
<nav class="my-navbar">
    <div class="container">
        <div class="row">
            <div class="col-md-12 top-header big-text">

                <script>
                    function showMenu(event) {
                        document.querySelector('#menu').style.display = 'inline-block';
                        event.stopPropagation();
                        return true;
                    }
                    document.addEventListener('click', function() {
                        document.querySelector('#menu').style.display = 'none';
                    });
                </script>

                <span id="menu" class="menu">

                    <span class="menuButton-wrapper">
                        <a class="top-button"
                           href="/">Home</a>
                    </span>

                    <br/>
                    <span class="menuButton-wrapper">
                        <a class="top-button"
                           href="/example.php">Demo</a>
                    </span>
                    <br/>
                    <span class="menuButton-wrapper">
                        <a class="top-button"
                           href="/documentation-main/documentation.php">Documentation</a>
                    </span>
                    <br/>
                    <span class="menuButton-wrapper">
                        <a class="top-button"
                           href="/media.php">Media</a>
                    </span>
                    <br/>
                    <span class="menuButton-wrapper">
                        <a class="top-button"
                           href="/licenseAndPricing.php">License & Pricing</a>
                    </span>
                    <br/>
                    <span class="menuButton-wrapper">
                        <a class="top-button"
                           href="/support.php">Support</a>
                    </span>
                </span>

                <span class="hide-when-medium menuButton" id="menuButton" onclick="showMenu(event)">
                    <svg width="16" height="16" style="color: #eee;">
                        <rect y="0" width="16" height="2" stroke="#eee" fill="#eee"></rect>
                        <rect y="7" width="16" height="2" stroke="#eee" fill="#eee"></rect>
                        <rect y="14" width="16" height="2" stroke="#eee" fill="#eee"></rect>
                    </svg>
                </span>

                <span class="show-when-medium">

                    <span class="top-button-wrapper">
                        <a class="top-button" href="/">
                            <span style="font-family: Impact, Charcoal, sans-serif; background-color: #eee; padding-left: 4px; padding-right: 4px; border-radius: 2px;">
                                <span style="color: darkred; ">ag</span><span style="color: #404040">-Grid</span>
                            </span>
                        </a>
                    </span>
                    <span class="top-button-wrapper">
                        <a class="top-button<?php if ($navKey == "demo") { ?>-selected<?php }?>"
                           href="/example.php">Demo</a>
                    </span>
                    <span class="top-button-wrapper">
                        <a class="top-button<?php if ($navKey == "documentation") { ?>-selected<?php }?>"
                           href="/documentation-main/documentation.php">Documentation</a>
                    </span>
                    <span class="top-button-wrapper">
                        <a class="top-button<?php if ($navKey == "media") { ?>-selected<?php }?>"
                           href="/media.php">Media</a>
                    </span>
                    <span class="top-button-wrapper">
                        <a class="top-button<?php if ($navKey == "licenseAndPricing") { ?>-selected<?php }?>"
                           href="/licenseAndPricing.php">License & Pricing</a>
                    </span>
                    <span class="top-button-wrapper">
                        <a class="top-button<?php if ($navKey == "support") { ?>-selected<?php }?>"
                           href="/support.php">Support</a>
                    </span>

                </span>

                <div style="float: right">

                    <iframe src="https://ghbtns.com/github-btn.html?user=ceolter&repo=ag-grid&type=star&count=true"
                            frameborder="0" scrolling="0" width="120px" height="20px"
                            style="position: relative; top: 3px;" class="hide-when-small">
                    </iframe>

                    <a class='share-link' href="https://www.facebook.com/sharer/sharer.php?u=www.ag-grid.com">
                        <img inline src="/images/facebook_32.png" alt="Share on Facebook" title="Share on Facebook"/>
                    </a>

                    <a class='share-link' href="https://twitter.com/home?status=http://www.ag-Grid.com,%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers%20%23aggrid%20">
                        <img inline src="/images/twitter_32.png" alt="Share on Twitter" title="Share on Twitter"/>
                    </a>

                    <a class='share-link' href="https://plus.google.com/share?url=www.ag-grid.com">
                        <img inline src="/images/googleplus_32.png" alt="Share on Google Plus" title="Share on Google Plus"/>
                    </a>

                    <a class='share-link' href="https://www.linkedin.com/shareArticle?mini=true&url=www.ag-grid.com&title=Angular%20Grid&summary=%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers&source=">
                        <img inline src="/images/linkedin_32.png" alt="Share on LinkedIn" title="Share on LinkedIn"/>
                    </a>

                </div>
    </div>

</nav>
-->


