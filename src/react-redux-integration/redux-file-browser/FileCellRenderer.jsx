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
    return filename.endsWith('.mp3') || filename.endsWith('.wav') ? 'fa fa-file-audio-o' :
      filename.endsWith('.xls') ? 'fa fa-file-excel-o' :
        filename.endsWith('.txt') ? 'fa fa fa-file-o' :
          filename.endsWith('.pdf') ? 'fa fa-file-pdf-o' : 'fa fa-folder';
  }
}