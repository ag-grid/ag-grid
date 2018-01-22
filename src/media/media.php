<?php

$pageTitle = "ag-Grid Blog: Home";
$pageDescription = "Welcome to the ag-Grid Blog where we provide information on our new releases and lots of useful tutorials and guides to our products and the frameworks that we support.";
$pageKeyboards = "blogs ag-grid angular react webpack";

include('../includes/mediaHeader.php');

$authors = array(
'niall' => 'Niall Crosby',
'sean' => 'Sean Landsman',
'sophia' => 'Sophia Lazarova',
'amit' => 'Amit Moryossef'
);

function featuredBlog($title, $cardImage, $link, $author, $date) {
    $authors = $GLOBALS['authors'];
    echo <<<HTML
    <div class="col-md-4">
        <div class="card">
          <a href="$link" class="cover" style="background-image: url($cardImage);" title="$title">$title</a>
          <div class="card-body">
            <h3 class="card-title">
                <a href="$link">$title</a>
            </h3>

            <div class="media">
                <img src="/images/team/{$author}.jpg">
                <div class="media-body">
                    <h4>{$authors[$author]} <span>$date</span> </h4>
                </div>
            </div>
          </div>
        </div>
    </div>
HTML;
}

function recentBlog($title, $summary, $image, $link, $author, $date) {
    $authors = $GLOBALS['authors'];
    echo <<<HTML
    <div class="row post-summary">
        <div class="col-md-3">
          <a href="$link" class="cover" style="background-image: url($image)" title="$title">$title</a>
        </div>

        <div class="col-md-9">
            <h3 class="card-title"> <a href="$link">$title</a> </h3>
            <p>$summary</p>
            <div class="media">
                <img src="/images/team/{$author}.jpg">
                <div class="media-body">
                    <h4>{$authors[$author]} <span>$date</span> </h4>
                </div>
            </div>
        </div>
    </div>
HTML;
}
?>

<div id="blogs-homepage">

<div id="headline">
    <h1>
        <a href="../ag-grid-blog-16-0-0/">Meet ag-Grid Phoenix & our new Website</a>
        <span>by Sophia Lazarova | 22 January 2018</span>
    </h1>

    <a href="../ag-grid-blog-16-0-0/"><img style="margin-bottom:30px;" src="../ag-grid-blog-16-0-0/cover.svg" width='100%' class="rounded" /></a>
</div>

<div id="featured-blogs">
    <h2>Featured</h2>

    <div class="row">
    <?php
    featuredBlog(
        'Understand your data: The power of pivot tables',
        '../pivoting-blog/img-pivot.png',
        '../pivoting-blog/',
        'sophia',
        '15 December 2017'
    );

    featuredBlog(
        'Building a CRUD Application with ag-Grid - Part 4',
        '../ag-grid-datagrid-crud-part-1/crud_overview.png',
        '../ag-grid-datagrid-crud-part-4/',
        'sean',
        '5 December 2017'
    );

    featuredBlog(
        'Building a CRUD Application with ag-Grid - Part 3',
        '../ag-grid-datagrid-crud-part-1/crud_overview.png',
        '../ag-grid-datagrid-crud-part-3/',
        'sean',
        '21 November 2017'
    );

    ?>
    </div>
</div>

<div id="recent-blogs">
    <h2>RECENT</h2>
<?php
$blogPosts = json_decode(file_get_contents('blog-posts.json'), true);

    foreach($blogPosts as $post) {
        recentBlog(
            $post['title'],
            $post['summary'],
            $post['img'],
            $post['link'],
            $post['author'],
            $post['date']
        );
    }
?>
</div>
</div>

<?php include_once("../includes/mediaFooter.php"); ?>
