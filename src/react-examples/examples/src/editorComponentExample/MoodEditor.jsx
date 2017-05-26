import React, {Component} from "react";
import ReactDOM from "react-dom";

export default class MoodEditor extends Component {
    constructor(props) {
        super(props);

        this.onHappyClick = this.onHappyClick.bind(this);
        this.onSadClick = this.onSadClick.bind(this);

        this.state = {
            happy: false
        }
    }

    componentWillMount() {
        this.setHappy(this.props.value === "Happy");
    }

    componentDidMount() {
        this.focus();
    }

    componentDidUpdate() {
        this.focus();
    }

    focus() {
        setTimeout(() => {
            let container = ReactDOM.findDOMNode(this.refs.container);
            if (container) {
                container.focus();
            }
        })
    }

    getValue() {
        return this.state.happy ? "Happy" : "Sad";
    }

    isPopup() {
        return true;
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
            () => this.props.api.stopEditing()
        );
    }

    onSadClick() {
        this.setState({
                happy: false
            },
            () => this.props.api.stopEditing()
        );
    }

    toggleMood() {
        this.setHappy(!this.state.happy);
    }

    render() {
        let mood = {
            borderRadius: 15,
            border: "1px solid grey",
            background: "#e6e6e6",
            padding: 15,
            textAlign: "center",
            display: "inline-block",
            // outline: "none"
        };

        let unselected = {
            paddingLleft: 10,
            paddingRight: 10,
            border: "1px solid transparent",
            padding: 4
        };

        let selected = {
            paddingLeft: 10,
            paddingRight: 10,
            border: "1px solid lightgreen",
            padding: 4
        };

        let happyStyle = this.state.value === 'Happy' ? selected : unselected;
        let sadStyle = this.state.value !== 'Happy' ? selected : unselected;

        return (
            <div ref="container"
                 style={mood}>
                <img src="images/smiley.png" onClick={this.onHappyClick} style={happyStyle}/>
                <img src="images/smiley-sad.png" onClick={this.onSadClick} style={sadStyle}/>
            </div>
        );
    }
}