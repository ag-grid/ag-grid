import React, {Component} from "react";

export default class CellRenderer extends Component {

  render() {
      return (
        <span>
          <button style={{ height: '30px'}} onClick={() => this.onButtonClicked()}>✎</button>
          <span style={{ paddingLeft: '4px'}}>{this.props.value}</span>
        </span>
      );
  }

  onButtonClicked() {
    // start editing this cell. see the docs on the params that this method takes
    this.props.api.startEditingCell({
      rowIndex: this.props.rowIndex,
      colKey: this.props.column.getId(),
    });
  }
}