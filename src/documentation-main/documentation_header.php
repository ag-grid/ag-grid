<?php
include '../example-runner/utils.php';

$version = 'latest';

$rootFolder;
if (strcmp($version, 'latest') == 0) {
    $rootFolder = '/';
} else {
    $rootFolder = '/archive/' . $version . '/';
}

$cookieKey_expandAll = 'agGridExpandAll';
$expandAll = $_COOKIE[$cookieKey_expandAll];

$oneHundredDaysFromNow = time() + 60*60*24*100;

function menuItem($indent, $localKey, $name, $url, $noIndentStyling = false) {
    menuItemWithIcon(null, $indent, $localKey, $name, $url, $noIndentStyling);
}

function menuItemWithIcon($icon, $indent, $localKey, $name, $url, $noIndentStyling = false) {
    $iconHtml = $icon!==null ? '<img class="enterprise-icon" src="../images/'.$icon.'" width="15px" /> ' : '';
    $padding = ($indent == 1) ? '&nbsp;&nbsp;' : '';
    $padding = ($indent == 2) ? '&nbsp;&nbsp;&nbsp;&nbsp;' : $padding;
    $indentClass = $noIndentStyling ? '' : 'sidebarLink-indent'.$indent;
    if ($GLOBALS[key] == $localKey) {
        print('<span class="sidebarLinkSelected">' . $padding . $iconHtml . $name . '</span>');
    } else {
        print('<a class="sidebarLink '.$indentClass.'" href="' . $GLOBALS[rootFolder] . $url  . '">' . $padding . $iconHtml . $name . '</a>');
    }
}

function menuItemCollapsibleParent($indent, $localKey, $name, $url, $parentId) {
    $padding = ($indent == 1) ? '&nbsp;&nbsp;' : '';
    $padding = ($indent == 2) ? '&nbsp;&nbsp;&nbsp;&nbsp;' : $padding;
    $indentClass = 'sidebarLink-indent'.$indent;

    $checked = $GLOBALS[$parentId];
    if ($GLOBALS[key] == $localKey) {
        $checked = " checked ";
        print('<span class="sidebarLinkSelected nline-block" >' . $padding . $name . '</span>');
    } else {
        print('<a class="sidebarLink '.$indentClass.' nline-block" href="' . $GLOBALS[ rootFolder] . $url  . '">' . $padding . $name . '</a>');
    }
    print('<input collapsible id="'.$parentId.'" type="checkbox" '.$checked.'>');
    print('<label collapsible style="float: right" for="'.$parentId.'"></label>');
}

function menuItemCollapsibleChild($indent, $localKey, $name, $url, $parentId, $childId, $position = 'middle') {
    $padding = ($indent == 1) ? '&nbsp;&nbsp;' : '';
    $padding = ($indent == 2) ? '&nbsp;&nbsp;&nbsp;&nbsp;' : $padding;
    $padding = ($indent == 3) ? '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' : $padding;
    $indentClass = 'sidebarLink-indent'.$indent;

    if($position == 'start') {
        print('<div id="'.$childId.'"><section>');
    }

    if ($GLOBALS[key] == $localKey) {
        print('<span class="sidebarLinkSelected nline-block" >' . $padding . $name . '</span>');
    } else {
        print('<a class="sidebarLink '.$indentClass.' nline-block" href="' . $GLOBALS[ rootFolder ] . $url  . '">' . $padding . $name . '</a>');
    }

    if($position == 'end') {
        print('</section></div>');
    }
}
?>

<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title><?php echo $pageTitle; ?></title>
    <meta name="description" content="<?php echo $pageDescription; ?>">
    <meta name="keywords" content="<?php echo $pageKeyboards; ?>"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link inline rel="stylesheet" href="../dist/bootstrap/css/bootstrap.css">

    <link rel="stylesheet" href="../dist/prism/prism.css">
    <link inline rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="../documentation-main/documentation.css">
    <link href="//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet">

    <link rel="shortcut icon" href="https://www.ag-grid.com/favicon.ico"/>
</head>

<body ng-app="documentation">
<?php include_once '../php-utils/printPropertiesTable.php' ?>
<?php if ($version == 'latest') {
    $navKey = "documentation";
    include '../includes/navbar.php';
} else { ?>
    <nav class="navbar-inverse">
        <div class="container">
            <div class="row">
                <div class="col-md-12 top-header big-text">
                        <span class="top-button-wrapper">
                            <a class="top-button" href="<?php print($rootFolder) ?>"> <i class="fa fa-users"></i> ag-Grid Archive Documentation <?php print($version) ?></a>
                        </span>
                </div>
            </div>

        </div>
    </nav>
<?php } ?>

<div class="header-row">

    <div class="container">

        <div class="row">
            <div class="col-md-12">
                <div style="float: right;">
                    <h2>
                        <a class="btn btn-primary btn-large" href="../start-trial.php">
                            Try ag-Grid Enterprise for Free
                        </a>
                    </h2>
                </div>
                <div id="documentationSearch">
                    <img src="/images/spinner.svg" class="documentationSearch-spinner active" width="24" height="24"/>
                    <div id="documentationSearchBox" style="opacity: 0">
                        <gcse:searchbox enableAutoComplete="true" enableHistory="true" autoCompleteMaxCompletions="5"
                                        autoCompleteMatchType="any"></gcse:searchbox>
                    </div>
                </div>
            </div>
        </div>

    </div>

</div>

<div class="container documentationContainer" style="margin-top: 20px">

    <div class="row">

        <div class="col-sm-3 col-md-2">
            <?php include 'documentation_menu.php'; ?>
        </div>

        <div class="col-sm-9 col-md-10 blog-main">

            <div id="googleSearchResults" style="display: none;">
                <gcse:searchresults></gcse:searchresults>
            </div>
