import React, {Component} from 'react';
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {AgGridReact} from "@ag-community/grid-react";
import {actions} from './actions/fileActions.jsx'

import {AllModules} from "@ag-enterprise/grid-all-modules";

import "@ag-community/grid-all-modules/dist/styles/ag-grid.css";
import "@ag-community/grid-all-modules/dist/styles/ag-theme-balham.css";

class FileView extends Component {
  colDefs = [
    {field: "file"},
    {field: "folder", rowGroup: true, hide: true},
    {field: "dateModified"},
    {field: "size"}
  ];

  autoGroupColumnDef = {
    headerName: "Folder",
    sort: 'asc',
    cellRendererParams: {
      suppressCount: true
    }
  };

  modules = AllModules;

  render() {
    return (
      <div id='myGrid' style={{height: 450}} className="ag-theme-balham">
        <AgGridReact
          columnDefs={this.colDefs}
          rowData={this.props.files}
          deltaRowDataMode={true}
          getRowNodeId={data => data.id}
          autoGroupColumnDef={this.autoGroupColumnDef}
          modules={this.modules}
          groupDefaultExpanded={-1}
          onFirstDataRendered={params => params.api.sizeColumnsToFit()}
          getContextMenuItems={this.getContextMenuItems}>
        </AgGridReact>
      </div>
    )
  }

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
}

const mapStateToProps = (state) => ({
  files: state.files
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(FileView);
