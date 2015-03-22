
Angular Grid
==============

[![Join the chat at https://gitter.im/ceolter/angular-grid](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/ceolter/angular-grid?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)



Angular Grid is a powerful and flexible data grid for AngularJS. It was created out of frustration, following an endless search for a grid that was fast, feature rich, robust and designed with AngularJS in mind.

Angular Grid was built for use in financial reporting applications, where data sets are large with heavy demands on filtering, grouping, aggregating and presentation.

But great power does not require great responsibility, setting up a simple grid, for small data sets, with a bunch of features, is very easy.

Handling Large Data Sets
==============

The Hybrid AngularJS & DOM Engine creates a powerful combination of AngularJS where required and native Javascript at all other times, giving the best performance. A grid written solely in AngularJS will be inherently slower.

Row Virtualisation provides a window on top of the data, rendering only DOM objects visible within the viewable area. This makes displaying hundreds of thousands of rows within the browser a reality, allowing the user to filter and group to the data of interest.

Features
--------------

- Column Pinning
- Column Resizing
- Data Sorting
- Quick Search
- Advanced Filtering
- Custom Rendering & Cell Styling
- Data Editing
- CSS Themes
- Header Grouping
- Row Grouping & Aggregation
- Click & Checkbox Selection
- API
- Printable

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
