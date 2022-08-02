import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class MoodEditor extends Component {
    constructor(props) {
        super(props);

        this.onHappyClick = this.onHappyClick.bind(this);
        this.onSadClick = this.onSadClick.bind(this);

        this.state = {
            happy: false
        };
    }

    componentWillMount() {
        this.setHappy(this.props.value === 'Happy');
    }

    componentDidMount() {
        this.refs.container.addEventListener('keydown', this.checkAndToggleMoodIfLeftRight);
        this.focus();
    }

    componentWillUnmount() {
        this.refs.container.removeEventListener('keydown', this.checkAndToggleMoodIfLeftRight);
    }

    checkAndToggleMoodIfLeftRight = (event) => {
        if (['ArrowLeft', 'ArrowRight'].indexOf(event.key) > -1) { // left and right
            this.toggleMood();
            event.stopPropagation();
        }
    };

    componentDidUpdate() {
        this.focus();
    }

    focus() {
        window.setTimeout(() => {
            let container = ReactDOM.findDOMNode(this.refs.container);
            if (container) {
                container.focus();
            }
        }, 10);
    }

    getValue() {
        return this.state.happy ? 'Happy' : 'Sad';
    }

    setHappy(happy) {
        this.setState({
            happy
        });
    }

    onHappyClick() {
        this.setState({
            happy: true
        },
            () => this.props.stopEditing()
        );
    }

    onSadClick() {
        this.setState({
            happy: false
        },
            () => this.props.stopEditing()
        );
    }

    toggleMood() {
        this.setHappy(!this.state.happy);
    }

    render() {
        let happyStyle = this.state.happy ? 'selected' : 'default';
        let sadStyle = !this.state.happy ? 'selected' : 'default';

        return (
            <div ref="container"
                className="mood"
                tabIndex={1} // important - without this the keypresses wont be caught
            >
                <img src="https://www.ag-grid.com/example-assets/smileys/happy.png" onClick={this.onHappyClick} className={happyStyle} />
                <img src="https://www.ag-grid.com/example-assets/smileys/sad.png" onClick={this.onSadClick} className={sadStyle} />
            </div>
        );
    }
}
