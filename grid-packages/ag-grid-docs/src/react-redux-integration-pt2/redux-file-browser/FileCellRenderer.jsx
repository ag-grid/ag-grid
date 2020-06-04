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
    const extension = filename.substr(-4);
    const isAudio = extension === '.mp3' || extension === '.wav';

    return isAudio ? 'far fa-file-audio' :
      extension === '.xls' ? 'far fa-file-excel' :
        extension === '.txt' ? 'far fa-file' :
          extension === '.pdf' ? 'far fa-file-pdf' : 'far fa-folder';
  }
}