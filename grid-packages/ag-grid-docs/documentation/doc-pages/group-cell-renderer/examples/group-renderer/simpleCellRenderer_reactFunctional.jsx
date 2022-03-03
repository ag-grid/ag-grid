import React from 'react';

export default (props) => <span style={{backgroundColor: props.node.group ? 'coral' : 'lightgreen', padding: 2}}>{props.value}</span>
