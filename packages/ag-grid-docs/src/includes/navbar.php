<nav class="nav<?php if (defined('HOMEPAGE')) { ?> home<?php }?>">
    <a id="logo" href="/" title="The Best HTML 5 Grid in the World">ag-Grid</a>
    <div class="collapse navbar-collapse" id="main-nav">
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
                <li>
                    <a href="https://blog.ag-grid.com/" target="_blank">Blog</a>
                </li>

<!--
                <li class="<?php if ($navKey == "support") { ?>active<?php }?>">
                    <a href="/support.php">Support</a>
                </li>
-->

                <li class="<?php if ($navKey == "about") { ?>active<?php }?>">
                    <a href="/about.php">About</a>
                </li>

                <li class="<?php if ($navKey == "licenseAndPricing") { ?>active<?php }?>">
                    <a href="/license-pricing.php">Pricing</a>
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
    <button id="navbar-toggle" 
        type="button" 
        aria-label="Toggle navigation">
        <span>&nbsp;</span>
    </button>
</nav>

<script>
    var navButton = document.getElementById('navbar-toggle'),
        mainNav = document.getElementById('main-nav');

    navButton.addEventListener('click', showHideMenu);
    window.addEventListener('resize', destroyMenu);

    function showHideMenu() {
        if (navButton.classList.contains('expanded')) {
            destroyMenu();
            return;
        }

        var menu = createMenu();
        document.body.appendChild(menu);
        
        menu.style.right = document.documentElement.offsetWidth - (navButton.offsetLeft + navButton.clientWidth) + 'px';
    }

    function createMenu() {
        navButton.classList.toggle('expanded', true);
        var menu = document.createElement('div');
        menu.classList.add('ag-main-floatingMenu');

        var ul = document.createElement('ul');
        menu.appendChild(ul);

        var allItems = mainNav.querySelectorAll('li');

        for (var i = 0; i < allItems.length; i++) {
            if (!allItems[i].offsetParent) {
                ul.appendChild(allItems[i].cloneNode(true));
            }
        }

        return menu;
    }

    function destroyMenu() {
        navButton.classList.toggle('expanded', false);
        var menu = document.querySelector('.ag-main-floatingMenu');

        if (menu) {
            menu.parentElement.removeChild(menu);
        }
    }
</script>