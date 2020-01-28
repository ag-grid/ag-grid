<?php

$pageTitle = "ag-Grid Blog: From Hater to Fan – How I fell in Love with Ag-Grid";
$pageDescription = "Review of Angular Datagrid - a User's perspective. We've asked one of our users to talk through his experience, it wasn't all positive at the start but he was converted.";
$pageKeyboards = "Review angularjs grid";

include('../includes/mediaHeader.php');
?>

        <h1>From Hater to Fan – How I fell in Love with ag-Grid</h1>
        <p class="blog-author">Amit Moryossef | 15th February 2017</p>
<div class="row" ng-app="documentation">
    <div class="col-md-8">

      <p class="lead">This blog features a guest writer - Amit Moryossef - who describes his experiences in using ag-Grid.</p>

        <h2>A little bit of history:</h2>

        <p>In the fall of 2015, I started working for a company who just started using AngularJS 1.x, to continue the development of a CRM (Customer Relationship Management) system.</p>

        <p>As with every management system, we needed to choose a grid to show our data and my predecessor had already used two grids inside the app - ag-Grid (v2.7) and Ng-Table (v0.8.3) – and I passionately hated the former. In retrospect, I realize I only hated it because of my predecessor’s lack of knowledge of AngularJS 1.x and of Ag-Grid. And so was born The Grid Project.</p>

        <p>The Grid Project had a single goal: To make a grid to replace all my grids and to make it awesome. As with most developers who like something and want to work with it for their own usage, I forked Ng-Table, and extended that grid with many features I needed, at that time. Not thinking about the future, not even considering it as a big project, but boy I was wrong. I created this bug filled monster that instead of solving The Grid Project, just added lots of monkey-patches to my code base. I was young and stupid.</p>

        <p>So the goal changed. I needed to look for the best grid for everyone – that has options for every user and use case - to replace with all my grids. I reviewed multiple grid projects for AngularJS 1.x, none as active as ag-Grid, and when I casually followed a link chain, I landed on the ag-Grid example page. My predecessor was doing it all wrong! I promptly checked the source code and found out that ag-Grid has a column definition field with everything that I really needed. This comes along with sorting, filtering, pinning and -most importantly – grouping, aggregation and the ability to have as many rows as I want. I am a really proud developer, so it was hard to accept that I was wrong, but when I finally accepted it, my life became so much easier, thanks to ag-Grid.</p>

        <h2>My journey:</h2>

        <p>I just couldn’t stop using it. I used this grid for so many things. I decided that after my failed attempt forking the prior grid, I would not do the same for this one, and instead I created an angular directive that managed the extra stuff I needed for the grid.</p>

        <p>I added user preferences for column sizes, columns order, pinning, grouping and sorting. These were remembered in browser storage. I added views, so you could work on the same grid several times but with a different customized look for every one of them, and one time I went as far as dumping the client’s database to the user (around 150K rows and 150 properties) and created a customized reports generator. Every kind of administrator on the system could now just create reports with the data relevant to them, and save the configuration for future uses, and it saved me around 30 minutes a day to create some made up report for some division in the company. Success.</p>

        <p>Later, I added my own data virtualization (before it was refactored on ag-Grid) and enjoyed some cool things the grid’s API has to offer. When that was done, development of that CRM was swift. Every new page had at least one table, with adding/editing/deleting for rows, which I just controlled programmatically with the switch of a Boolean. Life was awesome and I can’t thank this grid enough.</p>

        <h2>The problems along the way:</h2>

        <p>In the beginning of my usage of this grid, I mostly relied on the main example’s source code. For anything that was not there and I didn’t know what to do, I used the forum for my questions and GitHub for my issues.</p>

        <p>Not long after, I realized that there is documentation so I read it - several times - to the point where I started answering other people’s problems. I also began opening my own issues but now they had real merit.</p>

        <p>As of today, I have opened 26 issues with the grid (23 closed) and 6 issues with the enterprise version (all closed). I found that these were professionally handled by the ag-Grid team.</p>

        <h2>Outcome:</h2>

        <p>So I fell in love with this grid because it is awesome and because it was there for me at the right time. I knew I messed up before, I stopped and realized I needed to change things. Now I couldn’t be happier with it.</p>

        <p>I am often asked by web development beginners that I know “Do you know data-tables?” or “Do you know smart-table?”. Even “Do you know “INSERT_GRID_NAME_HERE? It’s superior to anything else!”. Now, educated and experienced with data grids for JavaScript in general, and AngularJS 1.x in particular, I just laugh and teach them about ag-Grid. ag-Grid gives the foundations to make everything you want to make, and that is a winner for me.</p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button"
               data-url="https://www.ag-grid.com/review-of-angularjs-grids/"
               data-text="From Hater to Fan – How I fell in Love with ag-Grid" data-via="ceolter"
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

    </div>
</div>


<hr/>

<div id="disqus_thread"></div>
<script type="text/javascript">
    /* * * CONFIGURATION VARIABLES * * */
    var disqus_shortname = 'aggrid';

    /* * * DON'T EDIT BELOW THIS LINE * * */
    (function () {
        var dsq = document.createElement('script');
        dsq.type = 'text/javascript';
        dsq.async = true;
        dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
    })();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript" rel="nofollow">comments
        powered by Disqus.</a></noscript>
<hr/>


<?php
include('../includes/mediaFooter.php');
?>
