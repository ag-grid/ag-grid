import React from 'react';

const Scripts = ({ files }) => files.map(file => <script key={file} src={file} />);

export default Scripts;