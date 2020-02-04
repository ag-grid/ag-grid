<?php
$pageTitle = "ag-Grid Show Change Cell Renderers";
$pageDescription = "The show change cell renderers either show delta changes between previous and last, or show the old value fading out.";
$pageKeyboards = "javascript grid changes";
$pageGroup = "row_models";
include '../documentation-main/documentation_header.php';
?>


    <h1 id="animate-renderer">Change Cell Renderers</h1>

    <p class="lead">
        The grid provides two cell renderers for animating changes to data. They are:
    </p>

    <ul class="content">
        <li>
            <code>agAnimateShowChangeCellRenderer:</code> The previous value is temporarily shown beside the old value
            with a directional arrow showing increase or decrease in value. The old value is then faded out.
        </li>
        <li>
            <code>agAnimateSlideCellRenderer:</code> The previous value shown in a faded fashion and slides, giving a ghosting effect
            as the old value fades adn slides away.
        </li>
    </ul>

    <p> The example below shows both types of animation cell renders in action. To test, try the following:
    </p>
    <ul class="content">
        <li>
            Columns A, B and C are editable.
        </li>
        <li>
            Columns D and E are updated via clicking the button.
        </li>
        <li>
            Changes to any of the first 5 columns results in animations in the Total and Average column.
        </li>
        <li>
            Changes to D and E also result in animations.
        </li>
    </ul>

<?= grid_example('Animation Renderers', 'animation-renderers', 'generated', array("processVue" => true)) ?>

    <note>
        We hope you like the animation cell renderers. However you can also take inspiration from them,
        and create your own animations in your own cell renderers. Check out our source code on Github on
        how we implemented these cell renderers for inspiration.
    </note>

    <note>
        Most of the ag-Grid users love the <code>animateShowChange</code> cell renderer for showing changes in values.
        Not many people like the animateSlide one. So if you are trying to impress someone, probably best
        show them the <code>animateShowChange</code> :)
    </note>


<?php include '../documentation-main/documentation_footer.php';?>
