<?php

$pageTitle = "ag-Grid Blog: JavaScript Animation with Translate vs Absolute Positioning";
$pageDescription = "Compares examples using translate and absolute positioning for fast animations.";
$pageKeyboards = "javascript animation translate vs absolute";
$socialUrl = "https://www.ag-grid.com/ag-grid-translate-vs-absolute-javascript-animations/";
$socialImage = "https://www.ag-grid.com/ag-grid-translate-vs-absolute-javascript-animations/img.svg";

include('../includes/mediaHeader.php');
?>

<div>

    <!-- <link rel="stylesheet" href="../documentation-main/documentation.css"> -->
    <h1>Translate vs Absolute for JavaScript Animations</h1>
    <p class="blog-author">Niall Crosby | 29th January 2018</p>

    <div>
        <a href="https://twitter.com/share" class="twitter-share-button"
            data-url="https://www.ag-grid.com/ag-grid-translate-vs-absolute-javascript-animations/"
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
            1) Using CSS <code>position: absolute</code> and <code>top</code>/<code>left</code> attributes;
            2) Using CSS <code>transform(translateX,translateY)</code> attributes.
            This article explains what both are and demonstrates how using <code>transform</code>
            animations perform better by utilising the GPU.
        </p>

        <h2>The Approaches Explained</h2>

        <p>
            Using <code>position: absolute</code> and <code>top</code>/<code>left</code> is the traditional
            way of positioning and was designed with web page layout in mind. If you animate transitions
            using this mechanism they do NOT use the GPU if available.
        </p>

        <p>
            Using <code>transform(translateX,translateY)</code> is a more modern way
            of doing things and was designed with utilising the GPU if it is available. The
            <code>transform / translate</code> maps with
            <a href="https://en.wikipedia.org/wiki/2D_computer_graphics">2D Graphics</a>
            operations, thus if doing animations, it can be done with your computers GPU (graphics
            hardware). If the GPU is used, it will give a much (MUCH) smoother animation
            experience.
        </p>

        <h2>Example Using Absolute Positioning</h2>

        <p>
            Below shows an example data grid (which can be though of as a simple representation of
            <a href="http://www.ag-grid.com/">ag-Grid</a>). Hitting the 'Shuffle Rows' button will
            reverse the order of the rows akin to row sorting in a data grid. The rows are positioned
            using <code>position: absolute</code> and <code>top</code>.
            Notice how smooth the animation is (or is not) which we will compare with the next example.
        </p>

        <?= example('Example Absolute', 'example-absolute', 'vanilla') ?>

        <h3>Example Using Transform</h3>

        <p>
            This example is identical to the previous example with one difference - the rows
            are positioned using <code>transform(translateX)</code>. If your computer has a GPU
            for doing 2D operations (all modern computers do) then you will notice a huge increase
            in the animation experience.
        </p>

        <?= example('Example Transform', 'example-transform', 'vanilla') ?>

        <h3>Conclusion</h3>

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
                            data-url="https://www.ag-grid.com/ag-grid-translate-vs-absolute-javascript-animations/"
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
