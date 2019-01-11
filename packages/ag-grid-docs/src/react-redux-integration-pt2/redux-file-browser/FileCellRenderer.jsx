import React, {Component} from 'react';

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