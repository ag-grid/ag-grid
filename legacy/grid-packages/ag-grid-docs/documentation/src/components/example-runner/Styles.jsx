import React from 'react';

const Styles = ({ files }) => files.map(file => <link key={file} rel="stylesheet" href={file} />);

export default Styles;