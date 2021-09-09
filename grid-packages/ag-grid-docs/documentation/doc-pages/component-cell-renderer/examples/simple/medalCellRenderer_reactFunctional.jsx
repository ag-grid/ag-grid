import React from 'react';

export default props => <span>{new Array(props.value).fill('#').join('')}</span>;
