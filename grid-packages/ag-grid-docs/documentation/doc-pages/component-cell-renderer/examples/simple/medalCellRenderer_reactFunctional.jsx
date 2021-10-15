import React from 'react';

export default props => <span>{new Array(parseInt(props.value, 10)).fill('#').join('')}</span>;
