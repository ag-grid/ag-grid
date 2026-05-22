import React from 'react';

const FileDropOverlay = () => {
    return (
        <div className="file-drop-overlay">
            <span className="file-drop-icon">📄</span>
            <span>Drop a CSV file here to load data</span>
            <span className="file-drop-hint">or click "Load Sample CSV" above</span>
        </div>
    );
};

export default FileDropOverlay;
