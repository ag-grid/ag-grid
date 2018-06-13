<?php

$pageTitle = "ag-Grid Blog: Building a React Datagrid using ag-Grid";
$pageDescription = "We're delighted to announce that you can now use React seamlessly with ag-Grid so you can add feature rich datagrid to your React application. This post takes you through it step by step..";
$pageKeyboards = "react ag-grid javascript grid";

include('../includes/mediaHeader.php');
?>

            <h1>Building a React Datagrid using ag-Grid - a Perfect Match</h1>

<div class="row">
    <div class="col-md-8">

        <p>
            ag-Grid is an enterprise JavaScript data grid with zero library dependencies,
            including no dependency for its rendering. You can build an application
            using just JavaScript and ag-Grid alone. The 'ag' stands for framework AGnostic.
        </p>

        <div style="text-align: center">
            <img src="../images/reactAndAgGrid.png" style="width: 300px; padding: 20px;"/>
        </div>

        <p>
            Now ag-Grid is providing
            a React component and React rendering.
            ag-Grid is fully integrated with React and treats React as a first class component
            - meaning if you are using React, ag-Grid is NOT using any other
            framework to get the job done.
        </p>

        <p>
            React Components follow standard DOM interaction patterns using properties,
            events (callbacks) and an optional API for interacting with the components.
            React also uses immutability to assist state management. ag-Grid uses
            the same principles. ag-Grid's core
            interface maps directly onto what is required by React making ag-Grid
            and React match perfectly.
        </p>

        <p>

        </p>
        <p>
            <div style="text-align: center">
            <span style="color: darkgrey">Fig 1 - Sample ag-Grid and React - see <a href="../best-react-data-grid/">full example here</a></span>
            <br/>
            <img src="reactAndAgGrid.png" style="width: 500px;"/>
            </div>
        </p>

        <p>
            ag-Grid then goes one step further, it embraces React for rendering.
            That means you can use React for custom cell
            rendering, if you choose, inside the grid. You provide ag-Grid with the React component
            and it knows what to do to seamlessly integrate. No other grid on the market is
            both agnostic and still allows you to use React for rendering.
        </p>

        <p>
            ag-Grid's future is bright. Its ability to integrate with the different
            frameworks makes it strongly positioned to be the enterprise level
            data grid everyone was waiting for. You won't need to throw away your
            grid next time you want to move to a different framework.
        </p>

        <div style="margin-top: 20px;">
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-in-2016/" data-text="Stepping it Up, ag-Grid Focuses on Agnostic in 2016" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

    </div>
<?php include '../blog-authors/niall.php' ?>
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
