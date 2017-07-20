<div class="dropdown frameworkBox">
    <div class="frameworkContainer">
        <h4 class="frameworkHeading">Framework</h4>
        <button class="btn btn-default frameworkDropdownButton dropdown-toggle<?php if (isFrameworkAll()) { ?> frameworkAllButton<?php } ?>"
                type="button" onclick="this.classList.toggle('active');" data-toggle="dropdown">
            <?php if (isFrameworkAll()) { ?>
                All Frameworks
            <?php } elseif (isFrameworkAngular2()) { ?>
                <img src="/images/angular2_small.png" alt="Angular"/>
                Angular
            <?php } elseif (isFrameworkAngular1()) { ?>
                <img src="/images/angularjs_small.png" alt="Angular 1"/>
                Angular JS
            <?php } elseif (isFrameworkAurelia()) { ?>
                <img src="/images/aurelia_small.png" alt="Aurelia"/>
                Aurelia
            <?php } elseif (isFrameworkReact()) { ?>
                <img src="/images/svg/react.alt.svg" width="22" alt="React"/>
                React
            <?php } elseif (isFrameworkVue()) { ?>
                <img src="/images/vue_small.png" alt="Vue"/>
                Vue JS
            <?php } elseif (isFrameworkJavaScript()) { ?>
                <img src="/images/javascript_small.png" alt="JavaScript"/>
                JavaScript
            <?php } elseif (isFrameworkWebComponents()) { ?>
                <img src="/images/webComponents_small.png" alt="Web Components"/>
                <span class="web-components">Web Components</span>
            <?php } ?>

            <span class="caret"></span></button>
        <ul class="dropdown-menu" role="menu" aria-labelledby="menu1">
            <li class="frameworkDropdownText">Documentation not relevant to your framework choice will be filtered
                out.
            </li>
            <li class="divider"></li>
            <li><a class="frameworkDropdown-link" data-id="javascript" href="#"><img src="/images/javascript_small.png"
                                                                                     alt="JavaScript"/> Just JavaScript
                    (no framework)</a></li>
            <li><a class="frameworkDropdown-link" data-id="react" href="#"><img src="/images/svg/react.alt.svg"
                                                                                width="22" alt="React"/> React</a></li>
            <li><a class="frameworkDropdown-link" data-id="angular" href="#"><img src="/images/angularjs_small.png"
                                                                                  alt="Angular 1"/> Angular (Angular 2
                    and later)</a></li>
            <li><a class="frameworkDropdown-link" data-id="angularjs" href="#"><img src="/images/angularjs_small.png"
                                                                                    alt="Angular 1"/> Angular JS
                    (Angular 1)</a></li>
            <li><a class="frameworkDropdown-link" data-id="aurelia" href="#"><img src="/images/aurelia_small.png"
                                                                                  alt="Aurelia"/> Aurelia</a></li>
            <li><a class="frameworkDropdown-link" data-id="vue" href="#"><img src="/images/vue_small.png" width="22"
                                                                              alt="Vue"/> Vue JS</a></li>
            <li><a class="frameworkDropdown-link" data-id="webcomponents" href="#"><img
                            src="../images/webComponents_small.png" alt="Web Components"/> Web Components</a></li>
            <li><a class="frameworkDropdown-link all-frameworks" data-id="all" href="#">All Frameworks (show
                    everything)</a></li>
        </ul>
    </div>
</div>

<a href="#" class="expandAll text-right">
    <?php if ($expandAll === 'true') { ?>
        Close All <i class="fa fa-arrow-down" aria-hidden="true"></i>
    <?php } else { ?>
        Expand All <i class="fa fa-arrow-right" aria-hidden="true"></i>
    <?php } ?>
</a>

<div class="docsMenu-header <?php if ($pageGroup == "basics" || $expandAll == "true") { ?> active<?php } ?>"
     data-id="getting_started">
    <h4>
        <img src="../images/svg/docs/getting_started.svg"/>
        &nbsp;
        Getting Started
    </h4>
    <i class="fa fa-arrow-right" aria-hidden="true"></i>
</div>
<div class="docsMenu-content">

    <?php
    menuItem(0, 'Getting Started', 'Overview', 'javascript-grid-getting-started/');

    if (isFrameworkJavaScript()) {
        menuItem(1, 'Overview JavaScript', 'Javascript', 'best-javascript-data-grid/');
        menuItem(2, 'Getting Started Javascript', 'Getting Started', 'javascript-getting-started');
        menuItem(2, 'More Detail Javascript', 'More Details', 'javascript-more-details/');
    }
    if (isFrameworkReact()) {
        menuItem(1, 'Overview React', 'ReactJS', 'best-react-data-grid/');
        menuItem(2, 'Getting Started React', 'Getting Started', 'react-getting-started/');
        menuItem(2, 'More Detail React', 'More Details', 'react-more-details/');
    }
    if (isFrameworkAngular2()) {
        menuItem(1, 'Overview Angular', 'Angular 2.x/4.x', 'best-angular-2-data-grid/');
        menuItem(2, 'Getting Started Angular', 'Getting Started', 'angular-getting-started/');
        menuItem(2, 'More Detail Angular', 'More Details', 'angular-more-details/');
        menuItemCollapsibleParent(2, 'Angular Building', 'Building', 'angular-building/', 'angularParent');
        menuItemCollapsibleChild(3, 'Angular CLI', 'Angular CLI', 'ag-grid-angular-angularcli/', 'angularParent', 'angularChild', 'start');
        menuItemCollapsibleChild(3, 'Angular Webpack', 'Webpack', 'ag-grid-angular-webpack/', 'angularParent', 'angularChild');
        menuItemCollapsibleChild(3, 'Angular Webpack 2', 'Webpack 2', 'ag-grid-angular-webpack-2/', 'angularParent', 'angularChild');
        menuItemCollapsibleChild(3, 'Angular ngtools Webpack', '@ngtools', 'ag-grid-angular-ngtools-webpack/', 'angularParent', 'angularChild');
        menuItemCollapsibleChild(3, 'Angular SystemJS', 'SystemJS', 'ag-grid-angular-systemjs/', 'angularParent', 'angularChild', 'end');
    }
    if (isFrameworkAngular1()) {
        menuItem(1, 'Getting Started ng1', 'AngularJS 1.x', 'best-angularjs-data-grid/');
    }

    if (isFrameworkVue()) {
        menuItem(1, 'Getting Started VueJS', 'VueJS', 'best-vuejs-data-grid/');
    }

    if (isFrameworkAurelia()) {
        menuItem(1, 'Getting Started Aurelia', 'Aurelia', 'best-aurelia-data-grid/');
    }

    if (isFrameworkWebComponents()) {
        menuItem(1, 'Getting Started Web Components', 'Web Components', 'best-web-component-data-grid/');
    }

    if (isFrameworkAll()) {
        menuItem(1, 'Getting Started TypeScript & Webpack 2', 'TypeScript', 'ag-grid-typescript-webpack-2/');
    }
    ?>

</div>

<div class="docsMenu-header <?php if ($pageGroup == "interfacing" || $expandAll == "true") { ?> active<?php } ?>"
     data-id="interfacing">
    <h4>
        <img src="../images/svg/docs/interfacing.svg"/>
        &nbsp;
        Interfacing
    </h4>
    <i class="fa fa-arrow-right" aria-hidden="true"></i>
</div>

<div class="docsMenu-content">
    <?php
    menuItem(0, 'Interfacing Overview', 'Overview', 'javascript-grid-interfacing-overview/');
    menuItem(0, 'Properties', 'Properties', 'javascript-grid-properties/');
    menuItem(0, 'Column Properties', 'Columns', 'javascript-grid-column-properties/');
    menuItem(0, 'Events', 'Events', 'javascript-grid-events/');
    menuItem(0, 'Callbacks', 'Callbacks', 'javascript-grid-callbacks/');
    menuItem(0, 'Grid API', 'Grid API', 'javascript-grid-api/');
    menuItem(0, 'Column API', 'Column API', 'javascript-grid-column-api/');
    ?>
</div>

<div class="docsMenu-header docsMenu-header_feature<?php if ($pageGroup == "feature" || $expandAll == "true") { ?> active<?php } ?>"
     data-id="features">
    <h4>
        <img src="../images/svg/docs/features.svg"/>
        &nbsp;
        Features
    </h4>
    <i class="fa fa-arrow-right" aria-hidden="true"></i>
</div>

<div class="docsMenu-content">
    <?php
    menuItem(0, 'Features', 'Overview', 'javascript-grid-features/');
    menuItem(0, 'Width & Height', 'Grid Size', 'javascript-grid-width-and-height/');
    menuItem(0, 'ColumnDefs', 'Column Definitions', 'javascript-grid-column-definitions/');
    menuItem(0, 'Grouping Columns', 'Column Groups', 'javascript-grid-grouping-headers/');
    menuItem(0, 'Column Header', 'Column Headers', 'javascript-grid-column-header/');
    menuItem(0, 'Resizing', 'Column Resizing', 'javascript-grid-resizing/');
    menuItem(0, 'Column Filter', 'Column Filter', 'javascript-grid-filtering/');

    menuItem(1, 'Text Filter', 'Text Filter', 'javascript-grid-filter-text/');
    menuItem(1, 'Number Filter', 'Number Filter', 'javascript-grid-filter-number/');
    menuItem(1, 'Date Filter', 'Date Filter', 'javascript-grid-filter-date/');
    menuItemWithIcon('enterprise.png', 1, 'Set Filtering', 'Set Filter', 'javascript-grid-filter-set/');
    menuItem(1, 'Custom Filter', 'Custom Filter', 'javascript-grid-filter-custom/');

    menuItem(0, 'Quick Filter', 'Quick Filter', 'javascript-grid-filter-quick/');
    menuItem(0, 'External Filter', 'External Filter', 'javascript-grid-filter-external/');

    menuItem(0, 'Sorting', 'Row Sorting', 'javascript-grid-sorting/');
    menuItem(0, 'Selection', 'Row Selection', 'javascript-grid-selection/');
    menuItemWithIcon('enterprise.png', 0, 'Range Selection', 'Range Selection', 'javascript-grid-range-selection/');
    menuItem(0, 'Column Spanning', 'Column Spanning', 'javascript-grid-column-spanning/');
    menuItem(0, 'Pinning', 'Column Pinning', 'javascript-grid-pinning/');
    menuItem(0, 'Row Pinning', 'Row Pinning', 'javascript-grid-row-pinning/');
    menuItem(0, 'Row Height', 'Row Height', 'javascript-grid-row-height/');
    menuItem(0, 'Cell Styling', 'Cell Styling', 'javascript-grid-cell-styling/');
    menuItem(0, 'Cell Rendering', 'Cell Rendering', 'javascript-grid-cell-rendering/');
    menuItem(0, 'Cell Editing', 'Cell Editing', 'javascript-grid-cell-editing/');
    menuItem(0, 'Keyboard Navigation', 'Keyboard Navigation', 'javascript-grid-keyboard-navigation/');
    menuItem(0, 'Touch', 'Touch Support', 'javascript-grid-touch/');
    menuItem(0, 'Animation', 'Animation', 'javascript-grid-animation/');
    menuItem(0, 'AccessingData', 'Accessing Data', 'javascript-grid-accessing-data/');

    menuItem(0, 'Getters and Formatters', 'Getters & Formatters', 'javascript-grid-value-getters/');
    menuItem(0, 'Setters and Parsers', 'Setters and Parsers', 'javascript-grid-value-setters/');
    menuItem(0, 'Cell Expressions', 'Expressions', 'javascript-grid-cell-expressions/');
    menuItem(0, 'Value Cache', 'Value Cache', 'javascript-grid-value-cache/');
    menuItem(0, 'Pagination', 'Pagination', 'javascript-grid-pagination/');
    menuItem(0, 'Tree Data', 'Tree Data', 'javascript-grid-tree/');
    menuItem(0, 'DataUpdate', 'Updating Data', 'javascript-grid-data-update/');
    menuItem(0, 'Refresh', 'View Refresh', 'javascript-grid-refresh/');
    menuItem(0, 'Change Detection', 'Change Detection', 'javascript-grid-change-detection/');
    menuItem(0, 'Internationalisation', 'Internationalisation', 'javascript-grid-internationalisation/');
    menuItemWithIcon('lab.png', 0, 'Accessibility', 'Accessibility', 'javascript-grid-accessibility/');
    menuItem(0, 'Full Width Rows', 'Full Width Rows', 'javascript-grid-full-width-rows/');
    menuItem(0, 'Master Detail', 'Master Detail', 'javascript-grid-master-detail/');
    menuItem(0, 'Aligned Grids', 'Aligned Grids', 'javascript-grid-aligned-grids/');
    menuItem(0, 'Data Export', 'CSV Export', 'javascript-grid-export/');
    menuItemWithIcon('enterprise.png', 0, 'Excel Export', 'Excel Export', 'javascript-grid-excel/');
    menuItem(0, 'RTL', 'RTL', 'javascript-grid-rtl/');
    menuItem(0, 'Icons', 'Custom Icons', 'javascript-grid-icons/');
    menuItem(0, 'Overlays', 'Overlays', 'javascript-grid-overlays/');
    menuItem(0, 'For Print', 'Layout For Print', 'javascript-grid-for-print/');

    menuItemWithIcon('enterprise.png', 0, 'Data Functions', 'Data Functions', 'javascript-grid-data-functions/');
    menuItemWithIcon('enterprise.png', 1, 'Grouping', 'Grouping Rows', 'javascript-grid-grouping/');
    menuItemWithIcon('enterprise.png', 1, 'Aggregation', 'Aggregation', 'javascript-grid-aggregation/');
    menuItemWithIcon('enterprise.png', 1, 'Pivoting', 'Pivoting', 'javascript-grid-pivoting/');

    menuItemWithIcon('enterprise.png', 0, 'Tool Panel', 'Tool Panel', 'javascript-grid-tool-panel/');
    menuItemWithIcon('enterprise.png', 0, 'Clipboard', 'Clipboard', 'javascript-grid-clipboard/');
    menuItemWithIcon('enterprise.png', 0, 'Column Menu', 'Column Menu', 'javascript-grid-column-menu/');
    menuItemWithIcon('enterprise.png', 0, 'Context Menu', 'Context Menu', 'javascript-grid-context-menu/');
    menuItemWithIcon('enterprise.png', 0, 'Status Bar', 'Status Bar', 'javascript-grid-status-bar/');
    menuItemWithIcon('enterprise.png', 0, 'License Key', 'License Key', 'javascript-grid-set-license/');

    menuItem(0, 'Context', 'Context', 'javascript-grid-context/');

    ?>
</div>

<div class="docsMenu-header<?php if ($pageGroup == "row_models" || $expandAll == "true") { ?> active<?php } ?>"
     data-id="row_models">
    <h4>
        <img src="../images/svg/docs/row_models.svg"/>
        &nbsp;
        Row Models
    </h4>
    <i class="fa fa-arrow-right" aria-hidden="true"></i>
</div>

<div class="docsMenu-content">
    <?php
    menuItem(0, 'Row Models', 'Overview', 'javascript-grid-row-models/');
    menuItem(0, 'Row Node', 'Row Node', 'javascript-grid-row-node/');
    menuItem(0, 'In Memory', 'In Memory', 'javascript-grid-in-memory/');
    menuItem(0, 'Infinite Scrolling', 'Infinite Scrolling', 'javascript-grid-infinite-scrolling/');
    menuItemWithIcon('enterprise.png', 0, 'Viewport', 'Viewport', 'javascript-grid-viewport/');
    menuItemWithIcon('enterprise.png', 0, 'Enterprise', 'Enterprise', 'javascript-grid-enterprise-model/');
    ?>
</div>

<div class="docsMenu-header docsMenu-header_feature<?php if ($pageGroup == "themes" || $expandAll == "true") { ?> active<?php } ?>"
     data-id="themes">
    <h4>
        <img src="../images/svg/docs/themes.svg"/>
        &nbsp;
        Themes
    </h4>
    <i class="fa fa-arrow-right" aria-hidden="true"></i>
</div>

<div class="docsMenu-content">

    <?php
    menuItem(0, 'Styling', 'Overview', 'javascript-grid-styling/');
    menuItem(0, 'Fresh Theme', 'Fresh Theme', 'javascript-grid-themes/fresh-theme.php');
    menuItem(0, 'Blue Theme', 'Blue Theme', 'javascript-grid-themes/blue-theme.php');
    menuItem(0, 'Dark Theme', 'Dark Theme', 'javascript-grid-themes/dark-theme.php');
    menuItem(0, 'Material Theme', 'Material Theme', 'javascript-grid-themes/material-theme.php');
    menuItem(0, 'Bootstrap Theme', 'Bootstrap Theme', 'javascript-grid-themes/bootstrap-theme.php');
    ?>

</div>

<div class="docsMenu-header<?php if ($pageGroup == "components" || $expandAll == "true") { ?> active<?php } ?>"
     data-id="components">
    <h4>
        <img src="../images/svg/docs/components.svg"/>
        &nbsp;
        Components
    </h4>
    <i class="fa fa-arrow-right" aria-hidden="true"></i>
</div>

<div class="docsMenu-content">
    <?php
    menuItem(0, 'Components', 'Overview', 'javascript-grid-components/');
    menuItem(0, 'Cell Rendering Components', 'Cell Renderer', 'javascript-grid-cell-rendering-components/');
    menuItem(0, 'Cell Editor', 'Cell Editor', 'javascript-grid-cell-editor/');
    menuItem(0, 'Filter Component', 'Filter Component', 'javascript-grid-filter-component/');
    menuItem(0, 'Floating Filter Component', 'Floating Filter Component', 'javascript-grid-floating-filter-component/');
    menuItem(0, 'Header Rendering', 'Header Component', 'javascript-grid-header-rendering/');
    menuItem(0, 'Date Component', 'Date Component', 'javascript-grid-date-component/');
    ?>
</div>

<div class="docsMenu-header<?php if ($pageGroup == "examples" || $expandAll == "true") { ?> active<?php } ?>"
     data-id="examples">
    <h4>
        <img src="../images/svg/docs/examples.svg"/>
        &nbsp;
        Examples
    </h4>
    <i class="fa fa-arrow-right" aria-hidden="true"></i>
</div>

<div class="docsMenu-examples">
    <?php

    menuItem(0, 'ag-Grid Examples', 'ag-Grid Examples', 'javascript-grid-examples/');
    if (isFrameworkReact() || isFrameworkAll()) {
        menuItemWithIcon('react_small.png', 1, 'React Examples', 'React Examples', 'example-react/', true);
        menuItem(2, 'React Rich Grid', 'Rich Grid', 'example-react-rich-grid/');
        menuItem(2, 'React Dynamic', 'Cell Renderers', 'example-react-dynamic/');
        menuItem(2, 'React Editor', 'Editor Component', 'example-react-editor/');
        menuItem(2, 'React Filter', 'Filter Component', 'example-react-filter/');
        menuItem(2, 'React Floating Row', 'Floating Rows', 'example-react-floating-row/');
        menuItem(2, 'React Full Width', 'Full Width Rows', 'example-react-full-width-rows/');
        menuItem(2, 'React Group Row', 'Group Rows', 'example-react-grouped-row/');
        menuItem(2, 'React MasterDetail', 'Master/Detail', 'example-react-master-detail/');
        menuItem(2, 'React Redux', 'Redux Examples', 'example-react-redux/');
    }
    if (isFrameworkAngular2() || isFrameworkAll()) {
        menuItemWithIcon('angular2_small.png', 1, 'Angular Examples', 'Angular Examples', 'example-angular/', true);
        menuItem(2, 'Angular Rich Grid', 'Rich Grid', 'example-angular-rich-grid/');
        menuItem(2, 'Angular Markup', 'Grid via Markup', 'example-angular-rich-grid-markup/');
        menuItem(2, 'Angular Dynamic', 'Cell Renderers', 'example-angular-dynamic/');
        menuItem(2, 'Angular Editor', 'Editor Component', 'example-angular-editor/');
        menuItem(2, 'Angular Filter', 'Filter Component', 'example-angular-filter/');
        menuItem(2, 'Angular Floating Filter', 'Floating Filter', 'javascript-grid-floating-filter-component/#ng2Angular');
        menuItem(2, 'Angular Floating Row', 'Floating Rows', 'example-angular-floating-row/');
        menuItem(2, 'Angular Full Width', 'Full Width Rows', 'example-angular-full-width-rows/');
        menuItem(2, 'Angular Group Row', 'Group Rows', 'example-angular-grouped-row/');
        menuItem(2, 'Angular MasterDetail', 'Master/Detail', 'example-angular-master-detail/');
        menuItem(2, 'Angular RxJS', 'RxJS', 'example-angular-rxjs/');
        menuItem(2, 'Angular Third Party', 'Third Party', 'example-angular-third-party/');
    }
    menuItem(1, 'Styled Report', 'Styled Report', 'example-account-report/');
    menuItem(1, 'File Browser', 'File Browser', 'example-file-browser/');
    menuItem(1, 'Expressions and Context', 'Expressions', 'example-expressions-and-context/');
    menuItem(1, 'Gallery', 'Gallery', 'example-gallery/');
    ?>
</div>

<div class="docsMenu-header<?php if ($pageGroup == "thirdparty" || $expandAll == "true") { ?> active<?php } ?>"
     data-id="thirdparty">
    <h4>
        <img src="../images/svg/docs/abc.svg"/>
        &nbsp;
        Third Party
    </h4>
    <i class="fa fa-arrow-right" aria-hidden="true"></i>
</div>

<div class="docsMenu-content">
    <?php

    menuItem(0, 'ag-Grid Third Party Examples', 'Overview', 'javascript-grid-third-party/');
    menuItem(1, 'ag-Grid OpenFin', 'OpenFin', 'javascript-grid-openfin/');
    menuItem(2, 'ag-Grid OpenFin Dashboard', 'Trader Dashboard', 'javascript-grid-openfin-dashboard/');
    menuItem(1, 'ag-Grid Graphing', 'Graphing', 'javascript-grid-graphing/');
    ?>
</div>

<?php if ($version == 'latest') { ?>
    <div class="docsMenu-header<?php if ($pageGroup == "misc" || $expandAll == "true") { ?> active<?php } ?>"
         data-id="misc">
        <h4>Misc</h4>
        <i class="fa fa-arrow-right" aria-hidden="true"></i>
    </div>

    <div class="docsMenu-content">
        <?php
        menuItem(0, 'Change Log', 'Change Log', 'change-log/changeLogIndex.php');
        menuItem(0, 'Roadmap', 'Roadmap', 'javascript-grid-roadmap');
        menuItem(0, 'Intermediate Tutorial', 'Tutorials', 'ag-grid-tutorials/');
        menuItem(0, 'Responsiveness', 'Responsive Design', 'javascript-grid-responsiveness/');
        menuItem(0, 'Testing', 'Testing', 'javascript-grid-testing/');
        menuItem(0, 'RxJS', 'RxJS', 'javascript-grid-rxjs/');
        ?>
        <a class="sidebarLink" href="/archive/">Archive Docs</a>
    </div>
<?php } ?>

<div style="border: 1px solid #eee; margin-top: 30px; margin-bottom: 50px;">
</div>

<div style="border: 1px solid #e8e8e8; border-radius: 3px; padding: 10px;">
    <table>
        <tr>
            <td>
                <img src="../images/github100.png" style="width: 50px"/>
            </td>
            <td>
                <iframe src="https://ghbtns.com/github-btn.html?user=ceolter&repo=ag-grid&type=star&count=true"
                        frameborder="0" scrolling="0" width="120px" height="20px"
                        style="position: relative; top: 3px;" class="hide-when-medium">
                </iframe>
            </td>
        </tr>
    </table>
    <div style="padding-top: 6px;">
        <a href="https://github.com/ceolter/ag-grid">Github</a>
        stars make projects look great. Please help, donate a star, it's free.
    </div>
</div>


<div style="border: 1px solid #e8e8e8; border-radius: 3px; padding: 10px; margin-top: 10px;">

    <a href="../ag-grid-partners-with-webpack/">
        <img src="../images/ag_grid_and_webpack_small.png"/>
    </a>


    <div>
        Read about <a href="../ag-grid-partners-with-webpack/">ag-Grid's Partnership
            with webpack</a>.
    </div>

</div>


<div style="border: 1px solid #e8e8e8; border-radius: 3px; padding: 10px; margin-top: 10px;">

    <div style="float: left; margin-right: 12px; margin-top: 5px;">
        <img src="../images/email.png"/>
    </div>
    <div>
        Get informed on releases and other ag-Grid news only - never spam.
    </div>

    <!-- Begin MailChimp Signup Form -->
    <link href="//cdn-images.mailchimp.com/embedcode/classic-081711.css" rel="stylesheet" type="text/css">
    <style type="text/css">
        #mc_embed_signup {
            clear: left;
            font: 14px Helvetica, Arial, sans-serif;
        }

        /* Add your own MailChimp form style overrides in your site stylesheet or in this style block.
           We recommend moving this block and the preceding CSS link to the HEAD of your HTML file. */
    </style>

    <div id="mc_embed_signup">
        <form action="//angulargrid.us11.list-manage.com/subscribe/post?u=9b44b788c97fa5b498fbbc9b5&amp;id=8b9aa91988"
              method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate"
              target="_blank" novalidate
              style="padding: 0px">
            <div id="mc_embed_signup_scroll">
                <input style="width: 140px; margin-top: 4px;" placeholder="Email Address..." type="email" value=""
                       name="EMAIL"
                       class="required email" id="mce-EMAIL">
                <input style="width: 140px; margin-top: 4px;" placeholder="First Name" type="text" value="" name="FNAME"
                       class=""
                       id="mce-FNAME">
                <input style="width: 140px; margin-top: 4px;" placeholder="Last Name" type="text" value="" name="LNAME"
                       class=""
                       id="mce-LNAME">
                <input type="submit" value="Subscribe" name="subscribe" id="mc-embedded-subscribe" class="button"
                       style="padding-left: 10px; padding-right: 10px; margin: 0px; ; margin-top: 4px; height: 20px; line-height: 20px;">
                <div id="mce-responses" class="clear">
                    <div class="response" id="mce-error-response" style="display:none"></div>
                    <div class="response" id="mce-success-response" style="display:none"></div>
                </div>
                <!-- real people should not fill this in and expect good things - do not remove this or risk form bot signups-->
                <div style="position: absolute; left: -5000px;"><input type="text"
                                                                       name="b_9b44b788c97fa5b498fbbc9b5_8b9aa91988"
                                                                       tabindex="-1" value=""></div>
            </div>
        </form>
    </div>

</div>

<div style="border: 1px solid #e8e8e8; border-radius: 3px; padding: 10px; margin-top: 10px;">
    Follow on Twitter

    <a href="http://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="medium"></a>
    <a href="http://twitter.com/seanlandsman" class="twitter-follow-button" data-show-count="false"
       data-size="medium"></a>

    <script>!function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
            if (!d.getElementById(id)) {
                js = d.createElement(s);
                js.id = id;
                js.src = p + '://platform.twitter.com/widgets.js';
                fjs.parentNode.insertBefore(js, fjs);
            }
        }(document, 'script', 'twitter-wjs');</script>

</div>
