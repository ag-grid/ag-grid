import React, { Component } from 'react';
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { AgGridReact } from "@ag-grid-community/react";
import { actions } from './actions/fileActions.jsx'

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';

import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import FileCellRenderer from './FileCellRenderer.jsx';

import { ModuleRegistry } from '@ag-grid-community/core';
// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, RowGroupingModule, MenuModule]);

class FileBrowser extends Component {

  colDefs = [{ field: "dateModified" }, { field: "size" }];

  autoGroupColumnDef = {
    headerName: "Files",
    rowDrag: true,
    sort: 'asc',
    width: 250,
    cellRendererParams: {
      suppressCount: true,
      innerRenderer: FileCellRenderer
    }
  };

  render() {
    return (
      <div style={{ height: '100%' }} className="ag-theme-alpine">
        <AgGridReact
          columnDefs={this.colDefs}
          rowData={this.props.files}
          treeData={true}
          groupDefaultExpanded={-1}
          getDataPath={data => data.filePath}
          autoGroupColumnDef={this.autoGroupColumnDef}
          onGridReady={params => params.api.sizeColumnsToFit()}
          getContextMenuItems={this.getContextMenuItems}
          getRowId={params => params.data.id}
          onRowDragEnd={this.onRowDragEnd}
        >
        </AgGridReact>
      </div>
    )
  }

  onRowDragEnd = (event) => {
    if (event.overNode.data.file) return;

    let movingFilePath = event.node.data.filePath;
    let targetPath = event.overNode.data.filePath;

    this.props.actions.moveFiles(movingFilePath, targetPath);
  };

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
}

FileBrowser.contextTypes = {
  store: PropTypes.object                         // must be supplied when using redux with AgGridReact
};

const mapStateToProps = (state) => ({ files: state.files });
const mapDispatchToProps = (dispatch) => ({ actions: bindActionCreators(actions, dispatch) });

export default connect(mapStateToProps, mapDispatchToProps)(FileBrowser);
