<?php
header("Location: https://medium.com/ag-grid", true, 301);
exit;

$pageTitle = "ag-Grid Blog: Home";
$pageDescription = "Welcome to the ag-Grid Blog where we provide information on our new releases and lots of useful tutorials and guides to our products and the frameworks that we support.";
$pageKeyboards = "blogs ag-grid angular react webpack";
include('../includes/mediaHeader.php');

$authors = array(
'niall' => 'Niall Crosby',
'sean' => 'Sean Landsman',
'sophia' => 'Sophia Lazarova',
'amit' => 'Amit Moryossef',
'john' => 'John Masterson'
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
        <a href="../ag-grid-blog-16-0-0/">Introducing Version 16: Phoenix and Our New Website</a>
        <span>by Sophia Lazarova | 22nd January 2018</span>
    </h1>

    <a href="../ag-grid-blog-16-0-0/"><img style="margin-bottom:30px;" src="../ag-grid-blog-16-0-0/cover.svg" width='100%' class="rounded" /></a>
</div>

<div id="featured-blogs">
    <h2>Featured</h2>

    <div class="row">
    <?php
    featuredBlog(
        'Meet the Best React Grid',
        '../best-react-grid-blog/cover.svg',
        '../best-react-grid-blog/',
        'sophia',
        '27th February 2018'
    );

    featuredBlog(
        'Plunker is now backed by ag-Grid',
        '../images/Plunker_Cover_Smaller.png',
        '../ag-grid-proud-to-support-plunker/',
        'john',
        '17th January 2018'
    );

    featuredBlog(
        'Happy New ag-Grid v15.0.0',
        '../ag-grid-blog-15-0-0/img15-0-0.png',
        '../ag-grid-blog-15-0-0/',
        'sophia',
        '13th December 2017'
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
