import React from 'react';

const Scripts = ({ files }) => files.map(file => <script key={file} src={file}></script>);

export default Scripts;