<?php

$pageTitle = "Blog: Squeezing the Browser - JavaScript Performance Hacks Inside ag-Grid";
$pageDescription = "Explanation on how ag-Grid renders so fast.";
$pageKeyboards = "big data javascript browser";

include('../includes/mediaHeader.php');
?>

<style>
    .codeComment {
        color: darkgreen;
    }
</style>

<div class="row">
    <div class="col-md-12" style="padding-top: 20px; padding-bottom: 20px;">
        <h1>Squeezing the Browser - JavaScript Performance Hacks Inside ag-Grid</h1>
    </div>
</div>

<div class="row">
    <div class="col-md-9">

        <h3>Make It Faster</h3>

        <p>
            <a href="https://www.ag-grid.com/">ag-Grid</a>
            is a JavaScript data grid for displaying large amounts of data inside the browser
            in a style similar to Excel.
            ag-Grid is fast, even in Internet Explorer and with large volumes of data.
            This blog presents performance patterns, or performance 'hacks', used in ag-Grid that puts
            the grid on steroids. How we squeezed performance out of the browser is interesting to
            anyone wanting to tune their own applications, but in particular a) users of ag-Grid so they can
            best work with ag-Grid and b) competitors of ag-Grid - it's lonely at the top,
            it would be more fun if some competitors challenged us a little!
        </p>

        <h3>Hack 1 - Row Virtualisation</h3>

        <p>
            Row virtualisation means only rendering rows that are visible on the screen. For example, if the
            grid has 10,000 rows but only 40 can fit inside the screen, the grid will only render 40 rows (each
            row represented by a DIV element). As the user scrolls up and down, the grid will create new
            DIV elements for the newly visible rows.
        </p>

        <p>
            If the grid was to render 10,000 rows, it would probably crash the browser as to many DOM elements
            are getting created.
            Row virtualisation allows the display of a very large number of rows by only rendering what is
            currently visible to the user.
        </p>

        <p>
            #### replace this with animated gif ####
            To see row virtualisation in action go to an ag-Grid demo and open the browser developer
            tools and observe the rows in the dom changing as you scroll up and down inside the grid.
        </p>

        <h3>Hack 2 - Column Virtualisation</h3>

        <p>
            Column virtualisation does for columns what row virtualisation does for rows. In other words,
            column virtualisation only renders the columns that are currently visible and the grid will render
            more columns as the user scrolls horizontally.
        </p>

        <p>
            Column virtualisation allows the grid to display large numbers of columns without degrading the
            performance of the grid.
        </p>

        <h3>Hack 3 - Exploit Event Propagation</h3>

        <h4>Problem - To Much Event Listener Registration</h4>

        <p>
            The grid needs to have mouse and keyboard listeners on
            all the cells so that a) the grid can fire events such as 'cellClicked' and b) so that the grid
            can perform grid operations such as selection, range selection, keyboard navigation etc.
            In all there are 8 events that the grid requires at the cell level which are
            <i>click, dblclick, mousedown, contextmenu, mouseover,
                mouseout, mouseenter</i> and <i>mouseleave</i>.
        </p>

        <p>
            Adding event listeners to the DOM takes a small performance hit.
            A grid would naturally add thousands of such listeners
            as even a simple grid of 20 visible columns and 50 visible rows means 20 (columns) x 50 (rows)
            x 8 (events) = 8,000 event listeners. When
            the user scrolls, due to row and column virtualisation, these listeners are getting constantly added and
            removed which adds a lag to scrolling.
        </p>

        <h4>Solution - Event Propagation</h4>

        <p>
            6 of these 8 events propagate (the exceptions are <i>mouseenter</i> and <i>mouseleave</i> which do
            not propagate). So instead of adding listeners to each cell, the grid instead adds each listener once to the container
            that contains the cells. That way the listeners are added once as the grid initialises and not to
            each individual cell.
        </p>

        <p>
            The challenge is then working out which cell caused the event.
        </p>

        <snippet>
// parentContainer will contain all the cells
var parentContainer = document.createElement('div');

// cells are regular DOM div objects
var eCell = document.createElement('div');
// attach our own properties to the DOM object.
// once we are not using DOM properties, there is no performance hit.
eCell.__col = colId;
eCell.__row = rowId;
// add the cell to the container, no listeners
parentContainer.appendChild(eCell);

// listen for clicks on the parent container only
parentContainer.addEventListener('click', myEventListener);

function myEventListener(event) {
    // go through all elements of the event, starting from the element that caused the event
    // and continue up to the parent container. we should find the cell element along the way.
    var domElement = event.target;
    var col, row;
    while (domElement!=parentContainer) {
        // see if the dom element has col and row info
        if (domElement.__col && domElement.__row) {
            // if yes, we have found the cell, and know which row and col it is
            col = domElement.__col;
            row = domElement.__row;
            break;
        }
        domElement = domElement.parentElement;
    }
}</snippet>

        <p>
            Readers will notice we are attaching arbitrary attributes (<code>__col</code> and <code>__row</code>) onto the DOM element
            and might be wondering is this safe? I hope so, as ag-Grid is used for air traffic control over Australia
            as far as I know. In other words, ag-Grid has done this for a long time now and nobody has reported any issues.
        </p>

        <p>
            This hack is also used by React . . . . . . #### reference needed
        </p>

        <h3>Hack 4 - Throw Away DOM</h3>

        <p>
            Good programming sense tells you to de-construct everything you construct. This means any DOM item
            you add to the browser you should remove in clean down code. This is standard clean programming, especially
            when composing complex DOM structures.
        </p>

        <p>
            This hack goes as follows: If you are removing an item from the DOM (eg a grid cell), but you know the
            parent of that item is also going to be removed (eg a grid row) then there is no need to remove the
            child items.
        </p>

        <p>
            So in ag-Grid, as rows are created, we use composition to build the complex structure into the DOM.
            However when removing the rows, we do not remove the cells individually form the DOM, instead we
            chuck the entire row in one quick DOM hit.
        </p>

        <h3>Hack # innerHTML where possible</h3>

        <p>
            What is the fastest way to populate lots of cells and rows into the browser? Should you use
            JavaScript to create each element and again JavaScript to update the attributes of each element
            and use <code>appendChild()</code> to plug all the elements together? Or should you work off
            document fragments? Or should you create all the document in one big piece of HTML and then
            insert it into the dom using <code>.innerHTML()</code>?
        </p>

        <p>
            We have done many tests. The answer is to use <code>.innerHTML()</code>.
        </p>

        <p>
            So ag-Grid leverages the speed of <code>.innerHTML()</code> by creating the HTML in one big string
            and then inserting it into the DOM (we use <code>element.insertAdjacentHTML()</code> so we don't
            overwrite current children).
        </p>

        <snippet>
// build up the row's HTML in a string
var htmlParts = [];
htmlParts.push('&lt;div class="ag-row"&gt;');
cells.forEach( function(cell) {
    htmlParts.push('&lt;div class="ag-cell"&gt;');
    htmlParts.push(cell.getValue());
    htmlParts.push('&lt;/div&gt;');
});
htmlParts.push('&lt;/div&gt;');

// append the string into the DOM, one DOM hit for the entire row
var rowHtml = htmlParts.join('');
eContainer.insertAdjacentHTML(rowHtml);</snippet>

        <p>
            This works great when there are no components used (ag-Grid native components, Angular components,
            React components etc). So the grid makes the choice - for all cells that do not use components, the grid
            will inject the whole row in one HTML string which is the quickest way to render HTML.
            When a component is used, the grid will then go back and inject the components into the HTML
            after teh row ins created.
        </p>

        <p>
            + Components are excellent for applications, their building blocks nature help construct
            applications into more simple parts.
        </p>

        <h3>Hack # Animation Frames</h3>

        <h3>Hack # Avoid Row Order</h3>

        <p>
            + Ensure row oder slows things down
        </p>

        <h3>Other Tried Hacks</h3>

        <p>Document Fragments</p>

        + Using a virtual DOM or dirty checking own't help this operation, at the end of the day they
        will all call XXX on the DOM, they will just spend longer thinking about it.

        <p>
            + Here is the receipe for a grid. Why are we telling the world? Won't our competitors steal the ideas?
            We are telling the world so that our users understand what's beneath the hood of ag-Grid, so they
            can appreciate when to avoid components inside the grid and understand the tradeoffs when making
            the decisions to use components. Yes our competitors can take these ideas and try to implement
            them into their own grids, they can all battle it out for second place, we have no fear.
        </p>

        <h3>Tweaking Performance</h3>

        <p>rowBuffer</p>

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
                           data-url="https://www.ag-grid.com/ag-grid-big-data-small-browser/"
                           data-text="JavaScript Big Data in a Small Browser #javascript #angularjs #react" data-via="ceolter"
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
    <div class="col-md-3">

        <img src="../images/ag-Grid2-200.png" style="display: inline-block; padding-bottom: 20px;"/>

        <div>
            <a href="https://twitter.com/share" class="twitter-share-button" data-url="https://www.ag-grid.com/ag-grid-angular-connect-2016/"
               data-text="We're Gonna Need a Bigger Boat - ag-Grid Sponsors Angular Connect 2016" data-via="ceolter" data-size="large">Tweet</a>
            <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
        </div>

        <div style="font-size: 14px; background-color: #dddddd; padding: 15px;">

            <p>
                <img src="/niall.png"/>
            </p>
            <p>
                About Me
            </p>
            <p>
                I have been writing software all my life! Starting with Assembly, C++ and MFC,
                moving onto full stack Java / JSP / GWT and now focusing on full stack
                Java / Javascript.
            </p>
            <p>
                Founder, Technical Lead and CEO of ag-Grid LTD.
            </p>

            <div>
                <br/>
                <a href="http://uk.linkedin.com/in/niallcrosby"><img src="/images/linked-in.png"/></a>
                <br/>
                <br/>
                <a href="https://twitter.com/ceolter" class="twitter-follow-button" data-show-count="false" data-size="large">@ceolter</a>
                <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
            </div>

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
