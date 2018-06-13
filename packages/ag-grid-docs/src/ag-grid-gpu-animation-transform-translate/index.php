<?php

$pageTitle = "JavaScript GPU Animation with Transform and Translate";
$pageDescription = "This post from the ag-Grid Blog discusses techniques for GPU animation in JavaScript applications. It compares examples using translate and absolute positioning for fast animations.";
$pageKeyboards = "javascript animation transform translate gpu";
$socialUrl = "https://www.ag-grid.com/ag-grid-gpu-animation-transform-translate/";
$socialImage = "https://www.ag-grid.com/ag-grid-gpu-animation-transform-translate/TranslateVsAbsolute.png";

include('../includes/mediaHeader.php');
?>

<div>

    <!-- <link rel="stylesheet" href="../documentation-main/documentation.css"> -->
    <h1>JavaScript GPU Animation with Transform and Translate</h1>
    <p class="blog-author">Niall Crosby | 29th January 2018</p>

    <div>
        <a href="https://twitter.com/share" class="twitter-share-button"
            data-url="https://www.ag-grid.com/ag-grid-gpu-animation-transform-translate/"
            data-text="JavaScript Animation with Translate vs Absolute Positioning"
            data-via="ceolter"
            data-size="large">Tweet</a>
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

<!--    <img src="TranslateVsAbsolute.png" class="large-cover-img img-fluid">-->

<div class="row">
    <div class="col-md-8">

        <p class="lead">
            There are two ways to absolute position DOM elements on the screen:
            1) Using CSS <code>position: absolute</code> and <code>style.top</code>/<code>style.left</code> attributes;
            2) Using CSS <code>position: absolute</code> and <code>style.transform(translateX,translateY)</code> attributes.
            This article explains what both are and demonstrates how using <code>transform</code>
            animations perform better by utilising the GPU.
        </p>

        <h2>Using Top / Left Attribute</h2>

        <p>
            Using <code>position: absolute</code> and <code>style.top</code>/<code>style.left</code> is the traditional
            way of positioning and was designed with web page layout in mind. If you animate transitions
            using this mechanism they do NOT use the GPU if available.
        </p>

        <p>
            The following code snippet shows what setting this up looks like for animating
            the vertical position of a DOM element using <code>style.top</code>.
        </p>

<snippet>// CSS
.row {
    // absolute positioning needed for setting top
    position: absolute;
    // put half a second animation for when top changes
    transition: top 0.5s;
}

    // JavaScript, set style.top programmatically
var eRow = document.querySelector('#myElement');
eRow.style.top = '500px';
</snippet>

        <p>
            Below shows an example data grid (which can be though of as a simple representation of
            <a href="http://www.ag-grid.com/">ag-Grid</a>). Hitting the 'Shuffle Rows' button will
            reverse the order of the rows akin to row sorting in a data grid. The rows are positioned
            using <code>position: absolute</code> and <code>style.top</code>.
            Notice how smooth the animation is (or is not) which we will compare with the next example.
        </p>

        <?= example('Example Absolute', 'example-absolute', 'vanilla') ?>

        <h2>Using Transform</h2>

        <p>
            Using <code>position: absolute</code> and <code>style.transform(translateX,translateY)</code>
            is a more modern way of doing things and was designed with utilising the GPU if it is available.
            The <code>transform / translate</code> maps with
            <a href="https://en.wikipedia.org/wiki/2D_computer_graphics">2D Graphics</a>
            operations, thus if doing animations, it can be done with your computers GPU (graphics
            hardware). If the GPU is used, it will give a much (MUCH) smoother animation
            experience.
        </p>

        <p>
            The following code snippet shows what setting this up looks like for animating
            the vertical position of a DOM element using <code>style.transform</code>.
        </p>

<snippet>// CSS
.row {
    // absolute positioning needed for transform
    position: absolute;
    // put half a second animation for when top changes
    transition: transform 0.5s;
}

// JavaScript, set style.transform programmatically
var eRow = document.querySelector('#myElement');
eRow.style.transform = 'translateY(500px)';
</snippet>

        <p>
            This example is identical to the previous example with one difference - the rows
            are positioned using <code>style.transform(translateX)</code>. If your computer has a GPU
            for doing 2D operations (all modern computers do) then you will notice a huge increase
            in the animation experience.
        </p>

        <?= example('Example Transform', 'example-transform', 'vanilla') ?>

        <h2>Usage in ag-Grid</h2>

        <p>
            For a real world example of this check out the
            <a href="../example.php">ag-Grid main demo</a>. ag-Grid uses
            this technique for animating the rows after a) the rows are sorted; b) the rows
            are filtered and c) a row group is opened (as rows are moved down to expand the group).
            This is particularly helpful with either very large grids or when using ag-Grid on
            lower powered devices such as tablets.
        </p>

        <h2>Conclusion</h2>

        <p>
            If you need to animate the position of DOM elements, then using transforms instead of
            absolute positioning will give far better results as it will harness the power of your
            computers GPU.
        </p>

        <div style="background-color: #eee; padding: 10px; display: inline-block;">

            <div style="margin-bottom: 5px;">If you liked this article then please share</div>

            <table style="background-color: #eee;">
                <tr>
                    <td>
                        <script type="text/javascript" src="//www.redditstatic.com/button/button1.js"></script>
                    </td>
                    <td>
                        &nbsp;&nbsp;&nbsp;
                    </td>
                    <td>
                        <a href="https://twitter.com/share" class="twitter-share-button"
                            data-url="https://www.ag-grid.com/ag-grid-gpu-animation-transform-translate/"
                            data-text="JavaScript Animation with Translate vs Absolute Positioning"
                            data-via="ceolter"
                            data-size="large">Tweet</a>
                        <script>!function (d, s, id) {
                                var js, fjs = d.getElementsByTagName(s)[0], p = /^http:/.test(d.location) ? 'http' : 'https';
                                if (!d.getElementById(id)) {
                                    js = d.createElement(s);
                                    js.id = id;
                                    js.src = p + '://platform.twitter.com/widgets.js';
                                    fjs.parentNode.insertBefore(js, fjs);
                                }
                            }(document, 'script', 'twitter-wjs');</script>
                    </td>
                </tr>
            </table>
        </div>
    </div>

<?php 
    include '../blog-authors/niall.php';
?>

</div>
    

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

<?php
include('../includes/mediaFooter.php');
?>
