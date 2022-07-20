/*
* Indicates whether we'll use graphql for node retrieval or do it ourselves via the filesystem
*
* If this is set to false the following files need to be uncommented
* grid-packages/ag-grid-docs/documentation/src/components/use-json-file-nodes.js
* grid-packages/ag-grid-docs/documentation/src/components/example-runner/use-example-file-nodes.js
*
* and the 2nd graphql query in grid-packages/ag-grid-docs/documentation/gatsby-node.js#createDocPages commented out
*
*/
module.exports = true;
