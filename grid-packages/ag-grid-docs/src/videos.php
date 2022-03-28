<?php
$navKey = "videos";
require_once 'includes/html-helpers.php';
gtm_data_layer('videos');
?>
<!DOCTYPE html>
<html lang="en">

<head lang="en">
    <?php
    meta_and_links("Our Mission, Our Principles and Our Team at AG Grid", "AG Grid Videos", "AG Grid is a feature-rich datagrid available in Community or Enterprise versions. This is the story of AG Grid and explains our mission, where we came from and who we are.", "videos.php", true);
    ?>
    <link rel="stylesheet" href="dist/homepage.css">
    <script src="dist/homepage.js"></script>
    <style>
        table, th, td {
            border: 1px solid black;
        }
    </style>
</head>

<body>
<?php include_once("./includes/analytics.php"); ?>
<header id="nav" class="compact">
    <?php
    $version = 'latest';
    include './includes/navbar.php';
    ?>
</header>
<div class="page-content">
    <?php
    $filter = isset($_GET["filter"]) ? htmlspecialchars($_GET["filter"]) : NULL;
    ?>
    <span style="margin: 1rem">Filter:<?= isset($filter) ? $filter : 'Not Set' ?></span>
    <table style="border: 1px solid; margin: 1rem">
        <tr>
            <th style="width: 100px" nowrap="true">Published Date</th>
            <th style="width: 80px">ID</th>
            <th style="width: 450px">Title</th>
            <th>Description</th>
            <th>Thumbnail</th>
            <th>Tags</th>
        </tr>
        <?php
        $youtubeData = json_decode(file_get_contents("../documentation/static/videos/youtube.json"), true);
        foreach ($youtubeData as &$videoDetails) {
            ?>
            <tr>
                <td nowrap="true"><?= $videoDetails['publishedAt'] ?></td>
                <td><?= $videoDetails['id'] ?></td>
                <td><?= $videoDetails['title'] ?></td>
                <td><?= $videoDetails['description'] ?></td>
                <td><img src="<?= $videoDetails['thumbnails']['default']['url'] ?>"/></td>
                <td><?= json_encode($videoDetails['tags']) ?></td>
            </tr>

            <?php
        }
        ?>

    </table>
    <?php include_once("./includes/footer.php"); ?>
</div>
</body>

</html>
