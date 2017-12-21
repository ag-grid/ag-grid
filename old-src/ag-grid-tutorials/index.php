<?php
$key = "Intermediate Tutorial";
$pageTitle = "ag-Grid Intermediate Tutorials and Examples";
$pageDescription = "This page has step by step videos on building up ag-Grid. Follow the videos to learn how the examples are build.";
$pageKeyboards = "ag-Grid tutorials";
$pageGroup = "misc";
include '../documentation-main/documentation_header.php';
?>

<div>

    <h2>Intermediate</h2>

    <note>
        These tutorials were created in an older version of ag-Grid. The general principles are all still true,
        however you will find items such as how to do grouping and aggregation have changed in never versions
        of ag-Grid. The features are all still supported (and now better), just configured slightly differently.
        To see how to do things with the latest release, see the documentation. It's easy keep the documentation
        up to date with each release, but not easy to keep videos up to date.
    </note>

    <p>
        This is an intermediate tutorial on how to use the grid. If you are just starting, you might
        find this a bit too difficult to follow. This tutorial introduces expressions, value getters,
        context and cell class rules.
    </p>

    <p>
        The tutorial uses the grid without any dependencies. The concepts can be used with AngularJS 1.x or any
        other framework, you just need to follow the 'getting started' section for the relevant framework.
    </p>

    <p>
        The result of this tutorial will be the grid in the example <a href="../example-expressions-and-context/">
            Expressions and Context
        </a>.
    </p>

    <p>The source code for each step is given below each video.</p>

    <h3>Step 1 - Basic Grid</h3>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/OEy2CL4jQvU" frameborder="0" allowfullscreen></iframe>
    <?= example('Basic Grid', 'start') ?>

    <h3>Step 2 - Loading Data</h3>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/BR-ARyQZm4E" frameborder="0" allowfullscreen></iframe>
    <?= example('Loading Data', 'load-data') ?>

    <h3>Step 3 - Value Getters</h3>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/hZGHoo3RPGI" frameborder="0" allowfullscreen></iframe>
    <?= example('Value Getters', 'value-getters') ?>

    <h3>Step 4 - Cell Class Rules</h3>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/MRDG741Wz0k" frameborder="0" allowfullscreen></iframe>
    <?= example('Cell Class Rules', 'cell-class-rules') ?>

    <h3>Step 5 - Cell Renderer</h3>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/6Ha1pEuYb6w" frameborder="0" allowfullscreen></iframe>

    <?= example('Cell Renderer', 'cell-renderer') ?>

    <h3>Step 6 - Expressions</h3>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/qPKG7KRNbnk" frameborder="0" allowfullscreen></iframe>

    <?= example('Expressions', 'expressions') ?>
</div>

<hr/>

<div id="disqus_thread"></div>
<script type="text/javascript">
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'aggrid';

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function() {
        var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments powered by Disqus.</a></noscript>
<hr/>

<footer class="license">
    � Niall Crosby 2015
</footer>

<?php include '../documentation-main/documentation_footer.php';?>
