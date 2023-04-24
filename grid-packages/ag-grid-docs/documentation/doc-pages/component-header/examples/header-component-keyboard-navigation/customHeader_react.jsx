import React, { Component } from "react"

export default class CustomElements extends Component {
  render() {
    return (
      <div className="custom-header">
        <span>{this.props.displayName}</span>
        <button>Click me</button>
        <input value="120"/>
        <a href="https://ag-grid.com" target="_blank">Link</a>
      </div>
    )
  }
}
