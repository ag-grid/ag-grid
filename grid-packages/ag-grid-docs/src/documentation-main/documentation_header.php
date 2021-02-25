<?php
include_once "../php-utils/videoHelper.php";
include_once '../example-runner/example-runners.php';
include_once '../includes/html-helpers.php';
include_once '../php-utils/apiDocumentation.php';
include_once '../php-utils/snippets.php';
$DONT_USE_FONT_AWESOME = true;
$version = 'latest';
$latest_hash = '';
$latest_hash_timestamp = '';
$rootFolder = strcmp($version, 'latest') == 0 ? '/' : '/archive/' . $version . '/';

function enterprise_feature($name)
{

    /*    echo('<div class="enterprise-note">');
        echo('<div class="trial-enterprise-note">');
        echo("$name is an enterprise feature. Want to get started? ");
        echo("You don't need to contact us to start evaluating AG Grid Enterprise. ");
        echo("A license is only required  when you start developing for production. ");
        echo('</div>');
        echo('</div>');*/

}

?>
<!DOCTYPE html>

<html lang="en">
<head>
    <?php
    meta_and_links($pageTitle, $pageKeywords, $pageDescription, false);
    ?>
    
    <!-- Google Tag Manager -->
    <script>(function (w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({
                'gtm.start': new Date().getTime(),
                event: 'gtm.js'
            });
            var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', 'GTM-T7JG534');</script>
    <!-- End Google Tag Manager -->
    
    <link rel="stylesheet" href="../dist/docs.css">
    <link rel="stylesheet" href="../documentation-main/documentation.css">
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var containers = document.querySelectorAll('.docs-homepage-section-preview');

            for (var i = 0; i < containers.length; i++) {
                var ct = containers[i];
                addContainerListeners(ct);

                var subLevels = ct.querySelectorAll('.docs-homepage-level1-item');

                for (var j = 0; j < subLevels.length; j++) {
                    var displayedItems = subLevels[j].querySelectorAll('li > span:not(.hide-collapsed)');
                    if (displayedItems.length) {
                        var lastComma = displayedItems[displayedItems.length - 1].querySelector('.item-split');
                        if (lastComma) {
                            lastComma.style.display = 'none';
                        }
                    }
                }
            }
        });

        function addContainerListeners(ct) {
            var card = ct.querySelector('.card');
            if (!card) { return; }
            ct.addEventListener('click', function(e) { toggleOpen(e, ct) });
            card.addEventListener('mouseleave', function(e) { toggleOpen(e, ct, false)});
        }

        function toggleOpen(e, container, state) {
            if (e.target.tagName === 'A' || document.body.clientWidth > 715) {
                return;
            }

            var card = container.querySelector('.card');
            if (typeof state === 'boolean') {
                container.classList[state ? 'add' : 'remove']('open');
            } else {
                container.classList.toggle('open');
            }

        }
    </script>
</head>

<body ng-app="documentation">

<!-- Google Tag Manager (noscript) -->
<noscript>
    <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-T7JG534" height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
<!-- End Google Tag Manager (noscript) -->

<header id="nav" class="compact">
    <?php
    $navKey = "documentation";
    include '../includes/navbar.php';
    ?>
</header>
<div class="page-content">
    <div id="documentation" class="new">
        <?php if(defined('hideSideMenu')) { ?>
            <div class="top-toolbar">
                <div class="search-wrapper">
                    <input type="text" class="search-input" placeholder="Search Docs"/>
                </div>
            </div>
        <?php } ?>
        <div>
            <aside id="side-nav" style="display: <?php echo defined('hideSideMenu') ? 'none' : 'block' ?>">
                <button id="side-nav-toggle" type="button" data-toggle="collapse" data-target="#side-nav-container"
                        aria-controls="side-nav-container" aria-expanded="false" aria-label="Toggle navigation">
                    <span>&nbsp;</span></button>

                <?php if(!defined('hideSideMenu')) { ?>
                    <div class="search-wrapper">
                        <input type="text" class="search-input" placeholder="Search Docs"/>
                    </div>
                <?php } ?>

                <div id="side-nav-container" class="collapse">
                    <?php include 'documentation_menu.php'; ?>
                    <?php include 'documentation_sidebar.php'; ?>
                </div>
            </aside>

            <section id="content" class="<?php echo defined('skipInPageNav') ? 'skip-in-page-nav' : '' ?>">
