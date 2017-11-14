<?php

$pageTitle = "What's New in ag-Grid v14.2.0";
$pageDescription = "Overview of version 14.2.0.";
$pageKeyboards = "ag-Grid javascript datagrid 14.2.0";

include('../includes/mediaHeader.php');
?>

<div class="container-fluid">

<!-- <link rel="stylesheet" href="../documentation-main/documentation.css"> -->
<h1 style='font-size: 70px;'>What's New in ag-Grid v14.2.0</h1>
<p>Sophia Lazarova | 14th November 2017</p>

    <img src="cover-img.jpg" width='94%'/>
    <div style="margin-top: 20px;" class="col-md-8">
    
        <h3><strong>ag-Grid 14.2.0 is live and kicking! We are excited to share the goodies and the perks coming with the new release.</strong></h3>
        
        <p>Our new release comes packed with exciting, new features providing even more flexibility and freedom. We are proud to introduce you our improved themes and master-detail along with few bug fixes. Let's dive!  </p>
        
        <h2>One Step Closer to Perfection</h2>
        
        <p>Version 14.2.0 comes with set of five improved and polished themes:</p>
        
        <p><img src="themes.jpg" alt="themes" width='80%'/></p>
        
        <ul>
        <li>Fresh (<em>ag-theme-fresh</em>)</li>
        
        <li>Dark (<em>ag-theme-dark</em>)</li>
        
        <li>Blue (<em>ag-theme-blue</em>)</li>
        
        <li>Material (<em>ag-theme-material</em>)</li>
        
        <li>Bootstrap (<em>ag-theme-bootstrap</em>)</li>
        </ul>
        
        <p>The new themes use a different architecture which provides means for easier customization. The improved implementation also introduces customization with <strong>Sass variables</strong>. 
        And that's not all, the new set has a number of visual improvements which contribute to the professional look of the grid.</p>
        
        <p>You can find more details <a href="https://www.ag-grid.com/javascript-grid-styling/#gsc.tab=0" title="Themes">in our documentation</a>.</p>
        
        <h2>Master-Detail</h2>
        
        <p><img src="master-detail.png" alt="master-detail" width='80%'/></p>
        
        <p>No more full-width rows and flower nodes hacks to achieve the <strong>master-detail</strong> effect. Version 14.2.0 arrives with <strong>master-detail</strong> as a feature, coming out of the box and available for customization with simple property changes.</p>
        
        <p>Find implementation details and samples in the dedicated <a href="https://www.ag-grid.com/javascript-grid-master-detail/#gsc.tab=0" title="Master Detail">documentation page</a>.</p>
        
        <h2>Fixed Bugs and Improvements</h2>
        
        <p>For full list of all bug fixes and enhancements coming with this version check the <a href="https://www.ag-grid.com/change-log/changeLogIndex.php#gsc.tab=0" title="change-log">change-log</a> published on our website.</p>
        
        <h2>Give it a Try and Share</h2>
        
        <p>Try out our new version and feel free to share your thoughts in the comments below.</p>
        
        <p>You can download <strong>ag-Grid</strong> by:</p>
        
        <ul>
        <li><strong>npm install ag-grid</strong></li>
        
        <li><strong>bower install ag-grid</strong></li>
        </ul>

    </div>

    

    <div class="col-md-3" style="font-size: 14px; background-color: #efefef; padding: 15px;margin-top: 40px;margin-left:15px;">
        <p>
            <img src="/images/team/sophia.jpg" width="100%"/>
        </p>
        <p style="font-weight: bold;">
            Sophia Lazarova
        </p>
        <p>
            Sophia recently switched her carreer path from being a developer to becoming member of the ag-Grid team as a Developer Advocate.
            She is interested in various areas of the programming but her tech passion is the mobile world and the mobile technologies.
            In her "not a techie time" you can find her buying plane tickets and planning her next adventures.
        </p>

        <div>
            <br/>
            <a href="https://twitter.com/sophialazarova" class="twitter-follow-button" data-show-count="false" data-size="large">@seanlandsman</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

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

<footer class="license">
    © ag-Grid Ltd. 2015-2017
</footer>

<?php
include('../includes/mediaFooter.php');
?>
