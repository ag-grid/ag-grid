import React, { Component } from 'react';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { AgGridReact } from "@ag-grid-community/react";
import { actions } from './actions/fileActions.jsx'

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule, MenuModule]);

class FileView extends Component {
  colDefs = [
    { field: "file" },
    { field: "folder", rowGroup: true, hide: true },
    { field: "dateModified" },
    { field: "size" }
  ];

  autoGroupColumnDef = {
    headerName: "Folder",
    sort: 'asc',
    cellRendererParams: {
      suppressCount: true
    }
  };

  render() {
    return (
      <div id='myGrid' style={{ flex: 1 }} className="ag-theme-alpine">
        <AgGridReact
          columnDefs={this.colDefs}
          rowData={this.props.files}
          getRowId={params => params.data.id}
          autoGroupColumnDef={this.autoGroupColumnDef}
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
