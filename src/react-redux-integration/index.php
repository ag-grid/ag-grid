<?php
$pageTitle = "React Redux Integration";
$pageDescription = "ag-Grid can be used as a data grid inside your React application. This page details how to get started.";
$pageKeyboards = "React Redux Grid";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>
    <h1>
        Redux Integration
    </h1>

    <p class="lead">
       This section explores how a React component that uses the ag-Grid Data Table can take advantage of a Redux store
       to simplify state management.
    </p>

    <p>
        We will use the concrete example of a file browser component to demonstrate how to move local component state to
        a Redux store. Updates to the files state will be retrieved from the Redux store, while UI events to add, move and
        delete files will be dispatched to the Redux store for processing.
    </p>

    <p>
        <img style="margin-left: 10%" src="redux-file-browser.png" width="80%" height="4%"/>
    </p>

    <note>
        This section assumes the reader is familiar with React and ES6 Javascript features.
    </note>

    <h2>Do I need Redux?</h2>

    <p>Redux excels in applications with complex state interactions. If you are passing unrelated data through several
       layers of components or data is shared and synchronized between different parts your application, you could
       benefit from Redux.</p>

    <p>When using Redux, you move state from your components into a single immutable store, where state is replaced rather
       than mutated. This combined with a unidirectional data flow can make it easier to test and reason about state
       changes in your application.</p>

    <h2>Redux Architecture</h2>

    <p>Redux has a single store which contains all application state. It has one Root Reducer which is responsible for
       transforming the application state and is typically created by combining several smaller reducers.</p>

    <img style="margin-left: 15%" src="redux-store.png"/>

    <p>Actions describe the operation the reducer should perform on the state. They may also contain an optional payload
       containing data used by the reducer to transform the state. For example an action to create a new file might
       look like this:
    </p>

<snippet language="js">
{
    type: ‘NEW_FILE’,
    payload: {
        filePath: [‘documents’, ‘pdf’, ‘cv.pdf’]
    }
}</snippet>

<p>Actions are dispatched to the store from UI components as illustrated below:</p>

<img style="margin-left: 2%" src="redux-data-flow.png" width="100%" />

<p>The reducer that is associated with the action type will then transform the state which is saved in the store.
    Reducers are pure functions which receive the current application state along with the action to be performed on
    that state to produce some new state.
</p>

<p style="margin-left: 20%; font-size: 20px"><b> (currentState, action) => newState </b></p>

<p>UI components can subscribe to the store for specific parts of the state in order to be notified when there are
    changes to the store. This allows components to retrieve the latest state to refresh the view.
</p>

<h2>Creating our Redux File Store</h2>

<p>
    To create our Redux File Store we will use the <code>createStore</code> factory method from the redux module.
    In our example we just require a single reducer which is supplied along with the initial state as shown below:
</p>

<snippet language="jsx">
// store.jsx

import {createStore} from 'redux';
import {reducer} from './ducks/files.jsx';

const initialState = {
    files: [
        {id: 1, filePath: ['Documents']},
        {id: 2, filePath: ['Documents', 'txt']},
        // more files ...
    ]
};

export default createStore(reducer, initialState);
</snippet>

<p>Note that in larger applications there will typically be several reducers which are combined to create a single
    root reducer. This is done using the <code>combineReducers</code> function also from Redux.</p>

<p>Our file browser will allow users to create, move and delete files and folders. The logic for handling these
    operations will be defined in the <code>fileReducer</code> shown below:
</p>

<snippet language="jsx">
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
</snippet>

<p>The <code>fileReducer</code> handles each action type with a case clause within a switch statement. It's important
    to understand that the reducer doesn't modify the state directly but instead returns a new version for the store
    to persist. As a result there must not be any side effects contained within the reducer.
</p>

<note>The helper methods used in the reducer are omitted for brevity but can be examined in the code tab provided
    in the example at the end of this blog post.
</note>

<p>
    Rather than create action objects directly, a more elegant approach is to create helper functions referred to as
    Action Creators as shown below:
</p>


<snippet>
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
</snippet>

<h2>Adding the Provider Component</h2>

<p>Now that we have created our Redux store we need to make it available to our React <code>FileBrowser</code>
    component. This is achieved through the <code>Provider</code> component from the react-redux project.
</p>

<p>In the entry point of our application we wrap out file browser component in the <code>Provider</code> component
    as shown below:
</p>

<snippet>
// index.jsx

import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import store from './store.jsx';
import FileBrowser from './FileBrowser.jsx';

render(
    &lt;Provider store={store}>
        &lt;FileBrowser/>
    &lt;/Provider>,
    document.getElementById('root')
);
</snippet>

<p>
    The <code>Provider</code> accepts the store as property and makes it available via props to all child components.
</p>

<h2>Binding React and Redux</h2>

<p>In order for our File Browser to be updated when the store changes we need to bind it.</p>

<p>This is achieved via the <code>connect</code> function provided by the react-redux project.</p>

<snippet>
import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

class FileBrowser extends Component {
    render() {
        // Warning: Not a real implementation of render()!!!

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
export default connect(mapStateToProps, mapDispatchToProps)(FileBrowser);
</snippet>

<p>
    In the code above we pass two function to <code>connect</code> to map the required state (mapStateToProps) and
    actions (mapDispatchToProps). When binding our actions we are using the <code>bindActionCreators</code> utility
    which wraps our action creators into a <code>dispatch</code> call.
</p>

<p>
    Now that our stateless <code>FileBrowser</code> component is connected to our Redux store, whenever the file
    state in the store changes, our component will re-render with the latest file state available in <code>this.props.files</code>.
</p>

<note>Bindings exist for most major javascript frameworks so Redux is not limited to React applications.</note>

<h2>Adding the Data Table</h2>

<p>
    Now that the Redux store is now connected to our stateless React component, all that remains is to implement the
    view, which just consists of the ag-Grid Data Table in our File Browser.
</p>

<p>
    TODO
</p>

<snippet language="jsx">
    // FileBrowser.jsx

    import React, {Component} from 'react';
    import {connect} from "react-redux";
    import {bindActionCreators} from 'redux';
    import {AgGridReact} from "ag-grid-react";
    import "ag-grid-enterprise";
    import {actions} from "./ducks/files.jsx";
    import FileCellRenderer from './FileCellRenderer.jsx';

    class FileBrowser extends Component {
    colDefs = [{field: "dateModified"}, {field: "size"}];

    autoGroupColumnDef = {
    headerName: "Files",
    rowDrag: true,
    cellRendererParams: {
    innerRenderer: "fileCellRenderer"
    }
    };

    frameworkComponents = {
    fileCellRenderer: FileCellRenderer
    };

    render() {
    return (
    &lt;div>
    &lt;div className="ag-theme-fresh">
    &lt;AgGridReact
    columnDefs={this.colDefs}
    rowData={this.props.files}
    frameworkComponents={this.frameworkComponents}
    treeData={true}
    groupDefaultExpanded={-1}
    getDataPath={data => data.filePath}
    autoGroupColumnDef={this.autoGroupColumnDef}
    onGridReady={params => params.api.sizeColumnsToFit()}
    getContextMenuItems={this.getContextMenuItems}
    deltaRowDataMode={true}
    getRowNodeId={data => data.id}
    onRowDragEnd={this.onRowDragEnd}>
    &lt;/AgGridReact>
    &lt;/div>
    &lt;/div>
    )
    }

    onRowDragEnd = (event) => {
    if(event.overNode.data.file) return;

    let movingFilePath = event.node.data.filePath;
    let targetPath = event.overNode.data.filePath;

    this.props.actions.moveFiles(movingFilePath, targetPath);
    };

    getContextMenuItems = (params) => {
    if (!params.node) return [];
    let filePath = params.node.data ? params.node.data.filePath : [];

    const actions = this.props.actions;
    let deleteItem = {name: "Delete", action: () => actions.deleteFiles(filePath)};
    let newItem = {name: "New", action: () => actions.newFile(filePath)};

    return params.node.data.file ? [deleteItem] : [newItem, deleteItem];
    };
    }

    const mapStateToProps = (state) => ({files: state.files});
    const mapDispatchToProps = (dispatch) => ({actions: bindActionCreators(actions, dispatch)});

    export default connect(mapStateToProps, mapDispatchToProps)(FileBrowser);
</snippet>


    <?= example('Redux File Browser', 'redux-file-browser', 'react', array("enterprise" => 1, "extras" => array( "fontawesome" ))) ?>

    <?php include '../documentation-main/documentation_footer.php'; ?>
