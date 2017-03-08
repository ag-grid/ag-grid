<?php
$key = "Getting Started";
$pageTitle = "Getting Started";
$pageDescription = "Getting Started ag-Grid and ag-Grid Enterprise";
$pageKeyboards = "Getting Started ag-Grid Enterprise";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<div>
        <?php if (isFrameworkAll()) { ?>
            <h2>
                <img src="../images/svg/docs/getting_started.svg" width="50" />

                <img style="vertical-align: middle" src="../images/javascript_small.png"/>
                <img style="vertical-align: middle" src="../images/angularjs_small.png"/>
                <img style="vertical-align: middle" src="../images/angular2_small.png"/>
                <img style="vertical-align: middle" src="../images/react_small.png"/>
                <img style="vertical-align: middle" src="../images/vue_small.png"/>
                <img style="vertical-align: middle" src="../images/aurelia_small.png"/>
                <img style="vertical-align: middle" src="../images/webComponents_small.png"/>
                Viewing All Frameworks
            </h2>
            <div>
                You are viewing all frameworks. It is probable you are only
                interested in one framework. Consider selecting a framework from the side menu.
            </div>
        <?php } ?>

        <?php if (isFrameworkJavaScript()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                    <h4><img style="vertical-align: middle" src="/images/javascript.png" height="20px"/> Overview - JavaScript</h4>
                    <i class="fa fa-arrow-right" aria-hidden="true"></i>
                </div>
                <?php } ?>

                <div>
                    <?php include './javascript.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkAngular()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="/images/angular2_small.png" height="20px"/> Overview - Angular</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './angular.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkAngularJS()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="/images/angularjs.png" height="20px"/> Overview - AngularJS 1.x</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './angularjs.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkVue()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="/images/vue_small.png" height="20px"/> Overview - VueJS</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './vue.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkReact()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="/images/react_small.png" height="20px"/> Overview - ReactJS</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './react.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkAurelia()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="/images/aurelia_small.png" height="20px"/> Overview - Aurelia</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './aurelia.php'; ?>
                </div>
            </div>
        <?php } ?>

        <?php if (isFrameworkWebComponents()) { ?>
            <div class="<?= isFrameworkAll() ? 'collapsableDocs' : '' ?>">

                <?php if (isFrameworkAll()) { ?>
                    <div class="collapsableDocs-header" onclick="this.classList.toggle('active');">
                        <h4><img style="vertical-align: middle" src="../images/webComponents.png" height="20px"/> Overview - Web Components</h4>
                        <i class="fa fa-arrow-right" aria-hidden="true"></i>
                    </div>
                <?php } ?>

                <div>
                    <?php include './webcomponents.php'; ?>
                </div>
            </div>
        <?php } ?>

        <h2>Browser Support/Compatibility</h2>

        <p>ag-Grid is compatible with IE 9+, Firefox, Chrome and Safari.</p>
</div>
<?php include '../documentation-main/documentation_footer.php'; ?>
