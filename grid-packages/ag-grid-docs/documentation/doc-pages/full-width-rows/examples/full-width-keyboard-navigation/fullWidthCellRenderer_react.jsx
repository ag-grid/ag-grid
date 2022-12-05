import React, { Component } from "react"

export default class FullWidthCellRenderer extends Component {
  render() {
    const { code, name, language } = this.props.data
    return (
      <div className="full-width-panel">
        <button>
          <img
            border="0"
            width="15"
            height="10"
            src={`https://www.ag-grid.com/example-assets/flags/${code}.png`}
          />
        </button>
        <input value={name} />
        <a href={`https://www.google.com/search?q=${language}`} target="_blank">
          {language}
        </a>
      </div>
    )
  }
}
