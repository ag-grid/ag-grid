<?php
$navKey = "demo";
require "example-runner/utils.php";
include_once 'includes/html-helpers.php';
?>
<!DOCTYPE html>
<html class="stretch-html">
<head lang="en">
<?php
meta_and_links("Demo of ag-Grid: Datagrid with 63 features and great performance", "react angular angularjs data grid example", "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is our fully interactive demo showcasing all of our features and our performance with large datasets.", false);
?>
<link rel="stylesheet" href="./dist/homepage.css">

<style></style>

</head>

<body>
<div id="example-wrapper">
<header id="nav" class="compact">
<?php 
    $version = 'latest';
    include './includes/navbar.php';
 ?>
</header>


<div id="example-toolbar">
    <div>
        <div>
            <span>Data Size:</span>
            <select onchange="onDataSizeChanged(this.value)" id="data-size"
                    style="color: #333;">
                <option value=".1x22">100 Rows, 22 Cols</option>
                <option value="1x22">1,000 Rows, 22 Cols</option>
                <option value="10x100">10,000 Rows, 100 Cols</option>
                <option value="100x22">100,000 Rows, 22 Cols</option>
            </select>

            <span id="message" style="margin-left: 10px;">
                <i class="fa fa-spinner fa-pulse fa-fw margin-bottom"></i>
            </span>
        </div>
        <div>
            <span class="hide-when-small">Theme:</span>

            <select onchange="onThemeChanged(this.value)" style="width: 90px; color: #333;"
                    class="hide-when-small">
                <option value="">-none-</option>
                <option value="ag-theme-balham" selected>Balham</option>
                <option value="ag-theme-balham-dark">Balham (dark)</option>
                <option value="ag-theme-material">Material</option>
            </select>
        </div>

        <div id="features-overlay" style="flex: 0;  margin-left: auto;">
            <a style=" white-space: nowrap;" href="#" @click.prevent="toggleTutorial">Walk me through the features</a>
            <router-view></router-view>
        </div>

        <div style="flex: 0; align-self: flex-end; white-space: nowrap;">
            <a href="#" id="videoLink" data-toggle="modal" data-target="#videoModal">Take video tour</a>
        </div>
    </div>
</div>

<div id="search-toolbar">
    <div class="row">
        <label for="global-filter" style="margin-right: 1rem; transform:translatey(5px);">Filter:</label>
        <input 
           placeholder="Type text from any column..." type="text"
           oninput="onFilterChanged(this.value)"
           ondblclick="filterDoubleClicked(event)"
           class="hide-when-small"
           id="global-filter"
           style="flex: 1"
        />
    </div>
</div>

<span id="messageText"></span>

<!-- The table div -->
<div id="grid-wrapper" style="padding: 1rem;">
    <div id="myGrid" style="height: 100%; overflow: hidden;" class="ag-theme-balham"></div>
</div>
</div> <!-- example wrapper -->

<!-- The Video Modal -->
<div class="modal fade" role="document" id="videoModal" tabindex="-1" aria-labelledby="videoModal" aria-hidden="true">
<div class="modal-dialog modal-lg">
<div class="modal-content">
  <div class="modal-header">
    <h2 class="modal-title">ag-Grid Tour</h2>
    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="modal-body">
                <iframe width="100%" id="tsuhoLiSWmU" height="315" src="https://www.youtube.com/embed/tsuhoLiSWmU?version=3&enablejsapi=1" frameborder="0"
                        allowfullscreen></iframe>
  </div>
</div>
</div>
</div>

<?= globalAgGridScript(true) ?>

<script src="example.js"></script>

<script>
    function closeVideo(id) {
        // stop the video (otherwise would continue to play int he background)
        let youTubeVideo = document.getElementById(id);
        youTubeVideo.src = youTubeVideo.src;
    }
</script>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>

<script src="dist/homepage.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue"></script>
<script src="https://unpkg.com/vue-router/dist/vue-router.js"></script>
<script src="tutorial.js"></script>



</body>
</html>
