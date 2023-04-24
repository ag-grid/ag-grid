import React, { Component } from "react"

export default class CustomElements extends Component {
  render() {
    return (
      <div className="custom-element">
        <button>Age: {this.props.data.age ? this.props.data.age : '?'}</button>
        <input value={this.props.data.country ? this.props.data.country : ''} />
        <a href={`https://www.google.com/search?q=${this.props.data.sport}`} target="_blank">{this.props.data.sport}</a>
      </div>
    )
  }
}
