
Angular Grid
==============

[![Join the chat at https://gitter.im/ceolter/angular-grid](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ceolter/angular-grid?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Angular Grid is another Grid for HTML 5 AngularJS development. Angular Grid was created
out of frustration, following a long and endless search for a grid that was very fast,
allowed pinned columns, had excel like advanced filtering and was native to AngularJS.

Features
--------------

- Advanced Filtering (quick filter, excel like filter, custom filters)
- Row Virtualisation (thousands of rows)
- Column Pinning, Resizing & Sorting
- Grouping with Aggregation
- Custom Cell Editors & Renderers
- Styleable via CSS
- Very fast

Who Should Use
--------------

The grid was designed to handle very large data sets and give a professional 'excel like' feel over the data.
This was such that it can be used in financial reporting applications.

However you don't need to be writing financial applications to benefit. Setting up a simple grid, for small
data sets, with a bunch of features, is very easy.

Check out the examples and the documentation to see if it is a good fit for you.

[www.angulargrid.com](http://www.angulargrid.com)

Releases
--------------

Releases are located in website/dist

Changes in 1.2
--------------

Row records now stored in 'node' objects, previously records were stored directly in a list (with the exception of
group rows). Each node object has attribute 'data' with the rows data. In addition, the following attributes also exist:

    parent: (reference to the parent node, if it exists)
    group: set to 'true' if this node is a group node (ie has children)
      -> children: the groups children
      -> field: the field grouped by (for information purposes only, if doing your own grouping, not needed)
      -> key: the group key (what text to display beside the group when rendering)
      -> expanded: whether the group is expanded or not
      -> allChildrenCount: how many children (including grand children) this group has. number is displayed
                           in brackets beside the group, set to -1 if doing own group and don't want this displayed
      -> level: group level, 0 is top most level. use this to add padding to your cell, if displaying something
                in the group column

For selection, the grid now works off nodes, so a map of 'selectedNodes' as well as list of 'selectedRows' is kept
(the map of selected nodes is the primary, each time this changes, the grid updates selectedRows, the user can choose which one to work off).

All the callbacks, where 'params' is passed, now 'node' is also passed inside the param object. This allows the callback
to inspect the hierarchy of nodes (as each node has parent and children references) as well as identifying if the node
is a group or leave node (ie group = true for group nodes).

Where child scope is created for the row, the data for the row is now on the scope as 'data' and not 'rowData' as previous.
