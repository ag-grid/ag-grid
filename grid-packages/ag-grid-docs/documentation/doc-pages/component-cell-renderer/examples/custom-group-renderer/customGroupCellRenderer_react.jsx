import React, { Component } from 'react';

export default class CustomGroupCellRenderer extends Component {
    constructor(props) {
        super();
        this.state = { 
            expanded: props.node.expanded,
        }
    }

    expandListener = (event) => this.setState({ expanded: event.node.expanded });

    componentDidMount() {
        this.props.node.addEventListener('expandedChanged', this.expandListener);
    }
    
    componentWillUnmount() {
        this.props.node.removeEventListener('expandedChanged', this.expandListener);
    }

    render() {
        const node = this.props.node;
        const onClick = () => node.setExpanded(!node.expanded);
        return (
            <div
                style={{
                    paddingLeft: `${node.level * 15}px`,
                }}
            >
                {
                    node.group && (
                        <div
                            style={{
                                cursor: 'pointer',
                                transform: this.state.expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                display: 'inline-block'
                            }}
                            onClick={onClick}
                        >
                            &rarr;
                        </div>
                    )
                }
                &nbsp;
                {this.props.value}
            </div>);
    }
};
