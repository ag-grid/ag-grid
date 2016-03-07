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
                        <img src="/images/facebook_32.png" alt="Share on Facebook" title="Share on Facebook"/>
                    </a>

                    <a class='share-link' href="https://twitter.com/home?status=http://www.ag-Grid.com,%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers%20%23aggrid%20">
                        <img src="/images/twitter_32.png" alt="Share on Twitter" title="Share on Twitter"/>
                    </a>

                    <a class='share-link' href="https://plus.google.com/share?url=www.ag-grid.com">
                        <img src="/images/googleplus_32.png" alt="Share on Google Plus" title="Share on Google Plus"/>
                    </a>

                    <a class='share-link' href="https://www.linkedin.com/shareArticle?mini=true&url=www.ag-grid.com&title=Angular%20Grid&summary=%20Enterprise%20Javascript%20Datagrid%20for%20serious%20enterprise%20developers&source=">
                        <img src="/images/linkedin_32.png" alt="Share on LinkedIn" title="Share on LinkedIn"/>
                    </a>

                </div>
    </div>


</nav>