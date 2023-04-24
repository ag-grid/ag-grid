---
title: "Redux Integration - Part 2"
frameworks: ["react"]
---

This section takes a deeper look at integrating AG Grid with a Redux store by implementing a
feature rich File Browser that uses Tree Data.


Following on from [Redux Integration Part 1](/redux-integration-pt1/) we will implement a
Redux File Browser to demonstrate how the feature rich AG Grid can be combined with a Redux
store to achieve elegant and powerful grid implementations.

<image-caption src="redux-integration-pt2/resources/redux-file-browser.png" alt="Redux File Browser"></image-caption>

## Creating our Redux File Store

Like in Part 1, our Redux File Store is created using the `createStore` factory method
from the redux module, and just a single reducer is required:

```jsx
// store.jsx

import { createStore } from 'redux';
import fileReducer from './reducers/fileReducer.jsx';

const initialState = {
    files: [
        { id: 1, filePath: ['Documents'] },
        { id: 2, filePath: ['Documents', 'txt'] },
        // more files ...
    ]
};

export default createStore(fileReducer, initialState);
```

Our file browser will allow users to create, move and delete files and folders.
The logic for handling these operations is defined in the `fileReducer` shown below:

```jsx
// reducers/fileReducer.jsx

export function fileReducer(state = {}, action) {
    const payload = action.payload;
    switch (action.type) {
        case types.NEW_FILE:
            return {
                files: [
                ...state.files,
                newFile(state.files, payload.filePath)
            ]
        };
        case types.MOVE_FILES:
            return {
                files: moveFiles(state.files, payload.pathToMove, payload.targetPath)
        };
        case types.DELETE_FILES:
            return {
                files: deleteFiles(state.files, payload.pathToRemove)
            };
        default:
            return state;
    }
}
```

[[note]]
| The helper methods used in the reducer are omitted for brevity but can be examined in the code
| tab provided in the example at the end of this section.

Rather than create action objects directly we shall use the following _Action Creators_ as shown below:

```jsx
// actions/fileActions.jsx

export const actions = {
    newFile(filePath) {
        return {
            type: types.NEW_FILE,
            payload: {filePath}
        };
    },
    moveFiles(pathToMove, targetPath) {
        return {
            type: types.MOVE_FILES,
            payload: {pathToMove, targetPath}
        };
    },
    deleteFiles(pathToRemove) {
        return {
            type: types.DELETE_FILES,
            payload: {pathToRemove}
        };
    }
};
```

## Adding the Provider Component

Now that we have created our Redux store we need to make it available to our React `FileBrowser`
component. This is achieved through the `Provider` component from the react-redux project.


In the entry point of our application we wrap the `FileBrowser` component in the `Provider`
component as shown below:

```jsx
// index.jsx

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import store from './store.jsx';
import FileBrowser from './FileBrowser.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <FileView/>
    </Provider>);
```

The `Provider` accepts the store as property and makes it available via props to all child components.

## Binding React and Redux

In order for our File Browser to be updated when the store changes we need to bind it.

This is achieved via the `connect` function provided by the react-redux project.

```jsx
import React, { Component } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';

class FileBrowser extends Component {
    render() {

        /******* Warning, not a real implementation of render(), eg no html! */
        /******* The proper render method is given later. */

        // an immutable copy of the file state is accessed using:
        this.props.files;

        // the following actions can be dispatched to the store:
        this.props.actions.newFile(filePath);
        this.props.actions.deleteFiles(filePath);
        this.props.actions.moveFiles(movingFilePath, targetPath);
    }
}

// map files to this.props from the store state
const mapStateToProps = (state) => ({files: state.files});

// bind our actions to this.props
const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators(actions, dispatch)});

// connect our component to the redux store
export default connect(
    mapStateToProps,
    mapDispatchToProps
    null,
    { forwardRef: true } // must be supplied for react/redux when using AgGridReact
)(FileBrowser);
```

In the code above we pass two functions to `connect` to map the required state
(mapStateToProps) and actions (mapDispatchToProps). When binding our actions we
are using the `bindActionCreators` utility which wraps our action creators into a `dispatch` call.

Now that our stateless `FileBrowser` component is connected to our Redux store, whenever the file
state in the store changes, our component will re-render with the latest file state available
in `this.props.files`.

## Adding the Data Table

Now that the Redux store is now connected to our stateless React component, all that remains
is to implement the view, which just consists of the AG Grid Data Table in our File Browser.

Before discussing the grid features in our file browser, here are all of the grid options we are using:

```jsx
// FileBrowser.jsx

render() {
    return (
        <div className="ag-theme-alpine">
            <AgGridReact
                {/* provide column definitions */}
                columnDefs={this.colDefs}
                {/* specify auto group column definition */}
                autoGroupColumnDef={this.autoGroupColumnDef}
                {/* row data provided via props from the file store */}
                rowData={this.props.files}
                {/* enable tree data */}
                treeData={true}
                {/* return tree hierarchy from supplied data */}
                getDataPath={data => data.filePath}
                {/* expand tree by default */}
                groupDefaultExpanded={-1}
                {/* fit grid columns */}
                onGridReady={params => params.api.sizeColumnsToFit()}
                {/* provide context menu callback */}
                getContextMenuItems={this.getContextMenuItems}
                {/* provide row drag end callback */}
                onRowDragEnd={this.onRowDragEnd}
                {/* return id required for tree data and immutable data */}
                getRowId={params => params.data.id}
                {/* specify our FileCellRenderer component */}
                components={this.components}>
            </AgGridReact>
        </div>
    )
}
```

## Tree Data

As the data is implicitly hierarchical, with a parent / child relationship between folders
and files, we will use the grids Tree Data feature by setting `treeData={true}`.

The file structure in the file browser is captured in the state as an array of files, where
each array entry contains it's hierarchy in the `filePath` attribute.

```jsx
files: [
    {  id: 1, filePath: ['Documents'] },
    { id: 2, filePath: ['Documents', 'txt'] },
    { id: 3, filePath: ['Documents', 'txt', 'notes.txt'] },
    { id: 4, filePath: ['Documents', 'pdf'] },
    // more files ...
]
```

This is supplied to the grid via the callback: `getDataPath={data => data.filePath}`.

For more details see our documentation on [Tree Data](/tree-data/). The mechanism for connecting
Redux to AG Grid applies equally to when the Tree Data feature is not used.

## Row Data Updates

The initial file state along with all subsequent state updates will be provided to the grid
component via `rowData={this.props.files}` from our Redux file store.

This means the grid does not change the state of the files internally but instead receives the
new state from the Redux store!

## Context Menu Actions

As shown above, `getContextMenuItems={this.getContextMenuItems}` supplies a function to the
grid to retrieve the context menu items. Here is the implementation:

```js
getContextMenuItems = (params) => {
    if (!params.node) return [];
    let filePath = params.node.data ? params.node.data.filePath : [];

    let deleteItem = {
        name: "Delete",
        action: () => this.props.actions.deleteFiles(filePath)
    };

    let newItem = {
        name: "New",
        action: () => this.props.actions.newFile(filePath)
    };

    return params.node.data.file ? [deleteItem] : [newItem, deleteItem];
};
```

Notice that we are simply just dispatching actions to the Redux store here.
For example, when the new file menu item is selected: `action: () => this.props.actions.newFile(filePath)`.

It is important to note that nothing will happen inside the grid when a menu item is selected
until the Redux store triggers a re-render of the grid component with the updated state.

For more details see our documentation on [Context Menu](/context-menu/).

## Row Drag Action

Just like the context menu above, we supply a callback function to handle dragging rows
via: `onRowDragEnd={this.onRowDragEnd}`. Here is the implementation:

```js
onRowDragEnd = (event) => {
    if(event.overNode.data.file) return;

    let movingFilePath = event.node.data.filePath;
    let targetPath = event.overNode.data.filePath;

    this.props.actions.moveFiles(movingFilePath, targetPath);
};
```

Once again, dragging rows doesn't directly impact the state of the grid. Instead an action is
dispatched to the Redux store using: `this.props.actions.moveFiles(movingFilePath, targetPath)`.

For more details see our documentation on [Row Dragging](/row-dragging/).

## Immutable Data

One consequence of using Redux is that when part of the state is updated in the store, the entire
state is replaced with a new version. The grid uses Row IDs to ensure only the rows that have been updated will be re-rendered inside the grid.

The file browser enables this feature using: `getRowId={params => params.data.id}`.

## Custom File Cell Renderer

To make our file browser more realistic we will provide a custom Cell Renderer for our files
and folders. This is implemented as a react component as follows:

```jsx
// FileCellRenderer.jsx

import React, { Component } from 'react';

export default class FileCellRenderer extends Component {
    render() {
        return (
            <div>
                <i className={this.getFileIcon(this.props.value)}/>
                <span className="filename">{this.props.value}</span>
            </div>
        );
    }
    getFileIcon = (filename) => {
        return filename.endsWith('.mp3') || filename.endsWith('.wav') ? 'far fa-file-audio' :
            filename.endsWith('.xls') ? 'far fa-file-excel' :
                filename.endsWith('.txt') ? 'far fa-file' :
                    filename.endsWith('.pdf') ? 'far fa-file-pdf' : 'far fa-folder';
    }
}
```

The Cell Renderer is supplied to the grid through: `components={this.components}`. Where `components` is just an object referencing the imported component:

```js
import FileCellRenderer from './FileCellRenderer.jsx';

components = {
    fileCellRenderer: FileCellRenderer
};
```

The key "fileCellRenderer" is passed by name to the `innerRenderer` used in the Auto Group Column:


```js
autoGroupColumnDef = {
    headerName: "Files",
    rowDrag: true,
    sort: 'asc',
    width: 250,
    cellRendererParams: {
        suppressCount: true,
        innerRenderer: "fileCellRenderer"
    }
};
```

For more details see our documentation on [Custom Cell Renderer Components](/component-cell-renderer/).

## Demo - Redux File Browser

Now we are ready to enjoy the fruits of our labour! The completed Redux File Browser
with source code is shown below. In this example you can:

- Right Click on a folder for options to delete the folder or add a new file.
- Right Click on a file for the option to delete the file.
- Click and Drag on the move icon to move files and folders.

<grid-example title='Redux File Browser' name='redux-file-browser' type='react' options=' { "enterprise": true,  "showImportsDropdown": false, "extras": ["fontawesome"] }'></grid-example>

## Conclusion

In this section we extended the Redux file store introduced in Part 1, to support the
additional functionality required by the File Browser, while still maintaining a nice
separation of concerns allowing our view components to remain stateless and focused
on presentational detail.

We also explored numerous powerful grid features that support complex grid implementations
with the minimal of effort, while proving to be extremely flexible. These features included:

- Tree Data
- Custom Context Menu
- Row Dragging
- Immutable Data
- Custom Cell Renderer Components
