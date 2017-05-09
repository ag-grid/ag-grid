<?php
$key = "Column Header";
$pageTitle = "Column Header";
$pageDescription = "Explains details about the column header.";
$pageKeyboards = "grid header";
$pageGroup = "feature";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2 id="headerHeight">Column Header</h2>

    <p>
        Each column has a header at the top that typically displays the column name and has access to column
        features, such as sorting, filtering and a column menu. This page explains how you can manage the headers.
    </p>

    <h3 id="headerHeight">Text Orientation</h3>

    <p>
        By default, the text label for the header is display horizontally, ie as normal readable text.
        To display the text in another orientation you have to ask Alberto............
    </p>
    <p>TODO - Alberto - how did you do this below!!!</p>

    <h3 id="headerHeight">Header Height</h3>

    <p>
        By default each row of the header is 25px high. You can change the height of different parts of the
        header using the following properties:
    </p>

    <?php include 'headerHeightProperties.php' ?>
    <?php printPropertiesTable($headerHeightProperties) ?>

    <h3 id="headerHeightExample">Header Height and Text Orientation Example</h3>

    <p>
        The example below shows how to change the headers height to allow for a different look and feel, check that
        all the different header heights have been applied.
    </p>

    <show-example example="exampleDynamicHeaders"></show-example>

</div>

<?php include '../documentation-main/documentation_footer.php';?>
