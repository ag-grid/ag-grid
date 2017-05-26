import React, {Component} from "react";

export default class MoodRenderer extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.setMood(this.props.value)
    }

    refresh(params) {
        this.setMood(params.value);
    }

    setMood(mood) {
        this.setState({
            imgForMood: mood === 'Happy' ? 'images/smiley.png' : 'images/smiley-sad.png'
        })
    };

    render() {
        return (
            <img width="20px" src={this.state.imgForMood}/>
        );
    }
}
