<?php

$pageTitle = "ag-Grid Blog: 8 Performance Hacks for JavaScript";
$pageDescription = "Niall Crosby, CEO and Founder of ag-Grid explains the performance hacks and techniques used in ag-Grid to make it render really fast.";
$pageKeyboards = "javascript performance";
$socialUrl = "https://www.ag-grid.com/ag-grid-performance-hacks/";
$socialImage = "https://www.ag-grid.com/ag-grid-performance-hacks/images/PerformanceHacks.png";

include('../includes/mediaHeader.php');
?>

<style>
    .codeComment {
        color: darkgreen;
    }
</style>

        <h1>8 Performance Hacks for JavaScript</h1>
        <p class="blog-author">Niall Crosby | 8th September 2017</p>

<div class="row">
    <div class="col-md-8">

        <h2>Make It Faster</h2>

        <p>
            <a href="https://www.ag-grid.com/">ag-Grid</a>
            is a JavaScript data grid for displaying large amounts of data in the browser
            in a style similar to Excel spreadsheets.
            ag-Grid is fast, even in Internet Explorer with large volumes of data.
            This blog presents performance patterns, or performance 'hacks', that we used to put our grid on steroids. 
        </p>
        <p>
            We describe how to squeeze performance out of the browser which can be applied to
            anyone wanting to tune their own applications. It will be of particular interest to users of ag-Grid to 
            improve understanding of how to work with the grid. We also think that it will be of interest to anyone creating a grid. 
            We relish the idea of healthy competition so we are happy to contribute to the wider community knowledge.
        </p>

        <h2>Hack 1 - Row Virtualisation</h2>

        <p>
            Row virtualisation means that we only render rows that are visible on the screen. For example, if the
            grid has 10,000 rows but only 40 can fit inside the screen, the grid will only render 40 rows (each
            row represented by a DIV element). As the user scrolls up and down, the grid will create new
            DIV elements for the newly visible rows on the fly.
        </p>

        <p>
            If the grid was to render 10,000 rows, it would probably crash the browser as too many DOM elements
            are getting created.
            Row virtualisation allows the display of a very large number of rows by only rendering what is
            currently visible to the user.
        </p>

        <p>
            The image below shows row virtualisation - notice how the DOM only has 5 or 6 rows rendered,
            matching the number of rows the user actually sees.
        </p>

        <img src="./images/rowVirtualisation.gif" style="width: 100%; border:1px solid #aaa;" alt="Row Virtualisation"/>


        <h2>Hack 2 - Column Virtualisation</h2>

        <p>
            Column virtualisation does for columns what row virtualisation does for rows. In other words,
            column virtualisation only renders the columns that are currently visible and the grid will render
            more columns as the user scrolls horizontally.
        </p>

        <p>
            Column virtualisation allows the grid to display large numbers of columns without degrading the
            performance of the grid.
        </p>

        <h2>Hack 3 - Exploit Event Propagation</h2>

        <h3>Problem - Event Listener Registration</h3>

        <p>
            The grid needs to have mouse and keyboard listeners on
            all the cells so that the grid can fire events such as 'cellClicked' and so that the grid
            can perform grid operations such as selection, range selection, keyboard navigation etc.
            In all there are 8 events that the grid requires at the cell level which are
            <i>click, dblclick, mousedown, contextmenu, mouseover,
                mouseout, mouseenter</i> and <i>mouseleave</i>.
        </p>

        <p>
            Adding event listeners to the DOM results in a small performance hit.
            A grid would naturally add thousands of such listeners
            as even 20 visible columns and 50 visible rows means 20 (columns) x 50 (rows)
            x 8 (events) = 8,000 event listeners. As the user scrolls our row and column virtualisation kicks in and these listeners are getting constantly added and
            removed which adds a lag to scrolling.
        </p>

        <h3>Solution - Event Propagation</h3>

        <p>
            6 of these 8 events propagate (the exceptions are <i>mouseenter</i> and <i>mouseleave</i>). So instead of adding listeners to each cell, we add 
            each listener once to the container that contains the cells. That way the listeners are added once when the grid initialises and not to
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
            You might have noticed that we are attaching arbitrary attributes (<code>__col</code> and <code>__row</code>) onto the DOM element
            and might be wondering is this safe? I hope so, as ag-Grid is used for air traffic control over Australia
            as far as I know. In other words, ag-Grid has done this for a long time and has been tested in the field.
        </p>

        <note>
            This is a similar pattern used by React using React's Synthetic Events.
            React uses event delegation and listens for events at the
            root of the application. React keeps track of which rendered nodes have listeners.
            The synthetic event system implements its own bubbling and calls the appropriate handlers.
        </note>

        <h2>Hack 4 - Throw Away DOM</h2>

        <p>
            Good programming sense tells you to de-construct everything you construct. This means any DOM item
            you add to the browser you should remove in your clean down code. In the context of your framework, 
            it means removing components from their parents when the component is disposed.
        </p>

        <p>
            This hack goes as follows: if you are removing an item from the DOM (e.g. a grid cell) but you know the
            parent of that item is also going to be removed (e.g. a grid row) then there is no need to remove the
            child items individually.
        </p>

        <p>
            So in ag-Grid, as rows are created, we use composition to build the complex structure into the DOM.
            However when removing the rows, we do not remove the cells individually from the DOM, instead we
            remove the entire row in one quick DOM hit.
        </p>

        <h2>Hack 5 - innerHTML where possible</h2>

        <p>
            What is the fastest way to populate lots of cells and rows into the browser? Should you use
            JavaScript (i.e. <code>document.createElement()</code>) to create each element, update the attributes of each element
            and use <code>appendChild()</code> to plug all the elements together? Or should you work off
            document fragments? Alternatively should you create all the document in a large piece of HTML and then
            insert it into the dom by setting the property <code>.innerHTML</code>?
        </p>

        <p>
            We have done many tests. The answer is to use <code>.innerHTML</code>.
        </p>

        <p>
            So ag-Grid leverages the speed of <code>.innerHTML</code> by creating the HTML in one big string
            and then inserting it into the DOM using the method <code>element.insertAdjacentHTML()</code>.
            The method <code>element.insertAdjacentHTML()</code> is similar but slightly less well known
            equivalent of the property <code>.innerHTML</code>. The difference is that
            <code>insertAdjacentHTML()</code> appends to existing HTML where as <code>.innerHTML()</code>
            replacing the current content. Both work just as fast.
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
            This works well when there are no custom cell renderers. So for all cells that do not use cell renderers, the grid
            will inject the whole row in one HTML string which is the quickest way to render HTML.
            When a component is used, the grid will then go back and inject the components into the HTML
            after the row is created.
        </p>

        <p>
            Cell renderers are a type of component. The component concept is great for applications. They
            are the building blocks of the composite design pattern used for building large applications,
            where smaller pieces (components) fit together to create bigger pieces. However, in ag-Grid,
            we want the fastest grid possible, so it's best to avoid the use of cell renderer components
            to leverage the power of <code>innerHTML</code> for the fastest rendering of rows.
        </p>

        <p>
            If you are a user of ag-Grid, you might be wondering how cell renderers impact performance. The answer depends on your platform, 
            using Chrome or a small non-complex grid, they should not pose a problem. If you are displaying large grids using
            Internet Explorer, it is worth checking the impact your cell renderers are adding.
        </p>

        <h2>Hack 6 - Debouncing Scroll Events</h2>

        <p>
            When you scroll in ag-Grid, the grid is doing row and column virtualisation, which means the DOM
            is getting trashed. This trashing is time consuming and if processed within the event listener
            will make the scroll experience 'rough'.
        </p>
        <p>
            To get around this, the grid uses debouncing of scroll events with animation frames. This is
            a common trick to achieve smooth scrolling and is explained very well in this blog
            <a href="https://www.html5rocks.com/en/tutorials/speed/animations/">Leaner, Meaner, Faster Animations
            with RequestAnimationFrame</a>. As this technique is well explained in posts such as above,
            I won't repeat it here. Suffice to say, we found this delivers a good performance boost.
        </p>

        <h2>Hack 7 - Animation Frames</h2>

        <p>
            Even with all the above performance tunings, our users still asked us to "make it faster, it's
            not good enough in Internet Explorer, the scrolling is awful, it takes too long". Some users
            experienced lag times of two to three seconds in Internet Explorer for rows to draw after a scroll.
        </p>

        <p>
            So the next performance hack was to break the rendering of the rows into different tasks using animation frames.
            When the user scrolls vertically to show different rows, the following tasks are set up in a task queue:
         </p> 
            <ul class="content">
                <li>1 task, if pinning then scroll the pinned panels.</li>
                <li>n tasks to insert each rows container (results in drawing the row background colour).</li>
                <li>n tasks to insert the cells using string building and <code>innerHTML</code>.</li>
                <li>n tasks to insert the cells using cell renderers where applicable.</li>
                <li>n tasks to add <i>mouseenter</i> and <i>mouseleave</i> listeners to all rows (for adding and removing hover class).</li>
                <li>n tasks to remove the old rows (do not deconstruct cells, just rip the rows out).</li>
            </ul>
        <p>
            So if you scroll to show 10 new rows, you will have 50+ tasks. Each scroll, row creation, cell
            creation etc. will be an individual task.
        </p>
        <p>
            The grid then uses animation frames (or timeouts if the browser does not support animation frames)
            to execute the tasks using a priority order. The order ensures things such as:
</p>
            <ul class="content">
                <li>Scrolling will get done first, best efforts are made to keep pinned sections in line.</li>
                <li>Row containers are second, the first thing the user will see is the outline of the rows.</li>
                <li>Cells are drawn in stages, as quickly as the browser will allow while giving visual feedback to the user.</li>
                <li>Removing of old rows is left till last, as that has no visual impact.</li>
                <li>If a new scroll event comes in, then this gets priority again over older tasks of lower priority,
                    keeping all pinned areas in sync as a priority.</li>
                <li>Tasks that are old are cancelled i.e. the user has scrolled past by the the time the row is to be rendered.</li>
            </ul>
<p>
            Having this many tasks should result in a lot of animation frames. To avoid this, the grid does not put each individual
            task into an animation frame. This would be overkill as then the create, destroy and schedule of
            animations frames would add their own overhead. Instead the grid requests one animation frame
            and executes as many tasks as it can within 60ms. We picked this timeframe following tests for the best
            user experience. If the grid does not exhaust the task queue, it requests another animation frame
            and tries again, and keeps trying until the task queue is emptied.
        </p>

        <p>
            Fast browsers such as Chrome can get everything done in one animation frame and produces zero flicker.
            Slower browsers such as Internet Explorer can take 10+ animation frames to process the task queue 
            for a standard scroll. The user experiences smooth scrolling with iterative feedback as the grid is rendered in stages,
            which is better than blocking the UI and painting everything in one go.
        </p>

        <p>
            As we move through these improvements, you will notice we are using animation frames to add
            <i>mouseenter</i> and <i>mouseleave</i>. This is different to the other events where we
            use event propagation to listen for all other events at the parent level. <i>mouseenter</i> and <i>mouseleave</i>
            do not propagate, so instead we add these in an animation frame after the rows are rendered. This has minimal
            impact to the user. They are not waiting for these events to be added before they see the row on the
            screen.
        </p>

        <p>
            The grid uses similar task priority queuing for horizontal scrolling. When the user scrolls to show
            more columns, the header gets scrolled first and the cells are updated next. This is all done using the
            same task queue and animation frames.
        </p>

        <h2>Hack 8 - Avoid Row Order</h2>

        <p>
            By default, the DOM created by the grid will have the rows appear in the order they were created. This
            can get out of sync with the rows on the screen as the user scrolls, sorts and filters. The row virtualisation trashing
            adds and removes rows as the user scrolls.
        </p>

        <p>
            Screen readers and other tools for accessibility require the row order to be the same in the DOM as
            on the screen. Having the row order consistent with the screen causes a performance hit, as it stops
            the grid from adding rows in bulk.
        </p>

        <p>
            So there is a trade-off. By default, the grid does not order the rows. If the user wants the row order, 
            they can use the property <code>ensureDomOrder=true</code>. The grid works a bit slower but is compatible with screen readers.
        </p>

        <h2>Summary</h2>

        <p>
            All of the performance hacks above are the result of years of learning. They are tried and tested approaches for squeezing performance
            out of the browser. If you have more ideas to make things faster, or have any improvements suggestions on this blog,
            then please comment below. Even better, if this all seems easy to you and you could do better, get in touch as we are always looking to hire
            the right people.
        </p>

        <p>
            One lasting note - these are performance hacks that worked for us in ag-Grid. You should understand them
            and consider them. They may not be suitable to your application (an application
            has different concerns to a data grid).
        </p>

        <h2>And Share!!!</h2>

        <p>
            Sharing is caring! So please take the time to share this article, or up-vote on Reddit (link below).
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
                           data-url="https://www.ag-grid.com/ag-grid-performance-hacks/"
                           data-text="Squeezing the Browser - JavaScript Performance Hacks in ag-Grid #javascript" data-via="ceolter"
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
    
        <?php include '../blog-authors/niall.php'; ?>

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
