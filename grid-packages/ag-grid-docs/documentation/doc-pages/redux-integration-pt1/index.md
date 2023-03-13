---
title: "Redux Integration - Part 1"
frameworks: ["react"]
---

This section introduces how React components using the AG Grid Data Grid can take advantage of a Redux store to
simplify state management.

We will use the concrete example of a file view component to demonstrate how to move local
component state to a Redux store. Updates to the files state will be retrieved from the Redux store,
while UI events to add and delete files will be dispatched to the Redux store for processing.

<image-caption src="redux-integration-pt1/resources/redux-file-view.png" alt="Redux Integration File View"></image-caption>

As shown above, files are grouped by folder, and files can be added or deleted via context menu options.

[[note]]
| This section assumes the reader is familiar with React and ES6 Javascript features.

## Do I need Redux?

Redux excels in applications with complex state interactions. If you are passing unrelated data through
several layers of components or data is shared and synchronized between different parts your application,
you could benefit from Redux.

When using Redux, you move state from your components into a single immutable store, where state is
replaced rather than mutated. This combined with its unidirectional data flow can make it easier to
test and reason about state changes in your application.

## Redux Architecture

Redux has a single store which contains all application state. It has one Root Reducer which is
responsible for transforming the application state and is typically created by combining several
smaller reducers.


<img src="resources/redux-store.png" alt="Redux Store" />

Actions describe the operation the reducer should perform on the state. They may also contain
an optional payload containing data used by the reducer to transform the state. For example
an action to create a new file might look like this:

```js
{
    type: ‘NEW_FILE’,
    payload: {
        folder: 'pdf'
    }
}
```

Actions are dispatched to the store from UI components as illustrated below:

<img src="resources/redux-data-flow.png" alt="Redux Data Flow" />

The reducer that is associated with the action type will then transform the state which is saved
in the store. Reducers are pure functions which receive the current application state along with
the action to be performed on that state to produce some new state.

<span style="font-weight: bold; margin-left: 20%; font-size: 1.2rem;">(currentState, action) => newState</span>

UI components can subscribe to the store for specific parts of the state in order to be notified
when there are changes to the store. This allows components to retrieve the latest state to refresh the view.

## Creating our Redux File Store

To create our Redux File Store we will use the `createStore` factory method from the redux module.
In our example we just require a single reducer which is supplied along with the initial state as shown below:

```jsx
// store.jsx

import { createStore } from 'redux';
import fileReducer from './reducers/fileReducer.jsx';

const initialState = {
    files: [
        { id: 1, file: 'notes.txt', folder: 'txt' },
        { id: 2, file: 'book.pdf', folder: 'pdf' },
        { id: 3, file: 'cv.pdf', folder: 'pdf' },
        // more files ...
    ]
};

export default createStore(fileReducer, initialState);
```

Note that in larger applications there will typically be several reducers which are combined
to create a single root reducer. This is done using the `combineReducers` function also from Redux.

Our File View will allow users to add and delete files. The logic for handling these operations
will be defined in the `fileReducer` shown below:

```jsx
// reducers/fileReducer.jsx

export default function fileReducer(state = {}, action) {
    const payload = action.payload;
    switch (action.type) {
        case types.NEW_FILE:
            return {
                files: [
                    ...state.files,
                    newFile(state.files, payload.folder)
                ]
            };
        case types.DELETE_FILE:
            return {
                files: deleteFile(state.files, payload.id)
            };
        default:
            return state;
    }
}
```

The `fileReducer` handles each action type with a case clause within a switch statement. It's important
to understand that the reducer doesn't modify the state directly but instead returns a new version for
the store to persist. As a result there must not be any side effects contained within the reducer.

[[note]]
| The helper methods used in the reducer are omitted for brevity but can be examined in the code
| tab provided in the example at the end of this section.

Rather than create action objects directly, a more elegant approach is to create helper functions referred to as

Action Creators as shown below:

```js
// actions/fileActions.jsx

export const actions = {
    newFile(folder) {
        return {
            type: types.NEW_FILE,
            payload: {folder}
        };
    },
    deleteFiles(id) {
        return {
            type: types.DELETE_FILES,
            payload: {id}
        };
    }
};
```

## Adding the Provider Component

Now that we have created our Redux store, we need to make it available to our React `FileView`
component. This is achieved through the `Provider` component from the react-redux project.


In the entry point of our application we wrap the `FileView` component in the `Provider`
component as shown below:

```jsx
// index.jsx

import React from 'react';
import { createRoot } from 'react-dom';
import { Provider } from 'react-redux';

import store from './store.jsx';
import FileView from './FileView.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <FileView/>
    </Provider>);
```

The `Provider` accepts the store as property and makes it available via props to all child components.

## Binding React and Redux

In order for our File View to be updated when the store changes we need to bind it.

This is achieved via the `connect` function provided by the react-redux project.

```jsx
import React, { Component } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';

class FileView extends Component {
    render() {
        /******* Warning, not a real implementation of render(), eg no html! */
        /******* The proper render method is given later. */

        // an immutable copy of the file state is accessed using:
        this.props.files;

        // the following actions can be dispatched to the store:
        this.props.actions.newFile(filePath);
        this.props.actions.deleteFiles(filePath);
    }
}

// map files to this.props from the store state
const mapStateToProps = (state) => ({
    files: state.files
});

// bind our actions to this.props
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(actions, dispatch)
});

// connect our component to the redux store
export default connect(
    mapStateToProps,
    mapDispatchToProps
    null,
    { forwardRef: true } // must be supplied for react/redux when using AgGridReact
)(FileView);
```

In the code above we pass two functions to `connect` to map the required state (mapStateToProps) and
actions (mapDispatchToProps). When binding our actions we are using the `bindActionCreators` utility
which wraps our action creators into a `dispatch` call.

Now that our stateless `FileView` component is connected to our Redux store, whenever the file state
in the store changes, our component will re-render with the latest file state available in `this.props.files`.


[[note]]
| Bindings exist for most major javascript frameworks so Redux is not limited to React applications.

## Adding the Data Table

Now that the Redux store is now connected to our stateless React component, all that remains is
to implement the view, which just consists of the AG Grid Data Table in our File View.

Before discussing the grid features in our File View, here are all of the grid options we are using:

```jsx
// FileView.jsx

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
                {/* expand groups by default */}
                groupDefaultExpanded={-1}
                {/* provide context menu callback */}
                getContextMenuItems={this.getContextMenuItems}
                {/* return key required for immutable data */}
                getRowId={params => params.data.id}>
            </AgGridReact>
        </div>
    )
}
```

## Row Grouping

To keep our File View example simple, we'll let the grid manage row grouping. This is achieved
via the following configuration:

```js
colDefs = [
    { field: "file" },
    { field: "folder", rowGroup: true, hide: true },
    { field: "dateModified" },
    { field: "size" }
];

autoGroupColumnDef = {
    headerName: "Files",
    sort: 'asc',
    cellRendererParams: {
        suppressCount: true
    }
};
```

Here we are grouping files by folder with `rowGroup: true` on the folder column definition. We
also override some of the defaults on our auto group column through the `autoGroupColumnDef` property.

For more details see our documentation on [Row Grouping](/grouping/).

## Row Data Updates

The initial file state along with all subsequent state updates will be provided to the grid
component via `rowData={this.props.files}` from our Redux file store.

This means the grid does not change the state of the files internally but instead receives
the new state from the Redux store!

## Context Menu Actions

As shown above, `getContextMenuItems={this.getContextMenuItems}` supplies a function to the
grid to retrieve the context menu items. Here is the implementation:

```js
getContextMenuItems = (params) => {
    const folderActions = [{
        name: "New File",
        action: () => this.props.actions.newFile(params.node.key)
    }];

    const fileActions = [{
        name: "Delete File",
        action: () => this.props.actions.deleteFile(params.node.data.id)
    }];

    return params.node.group ? folderActions : fileActions;
};
```

Notice that we are simply dispatching actions to the Redux store here. For example, when the
new file menu item is selected: `action: () => this.props.actions.newFile(folder)`.


It is important to note that nothing will happen inside the grid when a menu item is selected
until the Redux store triggers a re-render of the grid component with the updated state.

For more details see our documentation on [Context Menu](/context-menu/).

## Immutable Data

One consequence of using Redux is that when part of the state is updated in the store, the
entire state is replaced with a new version. The grid uses Row IDs to work specifically with immutable stores such as Redux to ensure only the rows
that have been updated will be re-rendered inside the grid.

The File View enables this feature using `getRowId={params => params.data.id}`.

## Demo - Redux File View

Now we are ready to enjoy the fruits of our labour! The completed Redux File View with source code
is shown below. In this example you can:

- **Folder 'Right Click':** reveals option to add a new file under the selected folder.
- **File 'Right Click':** reveals option to delete the selected file.
- **'Reload Component' button:** unmounts and then re-mounts the File View component. Notice that state is preserved via our Redux file store!

<grid-example title='Redux File View' name='redux-file-view' type='react' options=' { "enterprise": true, "showImportsDropdown": false, "extras": ["fontawesome"] }'></grid-example>

## Conclusion

While implementing the Redux File View, we have demonstrated how we can move local
state out of our components, along with all the associated state operations, to a
Redux state container. This led to a nice separation of concerns, allowing our
view component to focus on presentation detail.

In this example we just touched on a few grid features to keep the example simple. These features included:

- Row Grouping
- Immutable Data
- Custom Context Menu

Next up in [Redux Integration Part 2](/redux-integration-pt2/) we take things further and
implement a feature rich File Browser which builds upon this File View example.

