[[only-react]]
|
|Below is a simple example of a status bar component as a Hook:
|
|```jsx
|import React from 'react';
|
|export default props => {
|    const onClick = () => {
|        alert('Selected Row Count: ' + props.api.getSelectedRows().length)
|    }
|
|    const style = {
|        padding: 5,
|        margin: 5
|    }
|
|    return <input style={style} type="button" onClick={onClick} value="Click Me For Selected Row Count"/>;
|};
|```
|
|And here is the same example as a Class-based Component:
|
|```jsx
|export default class ClickableStatusBarComponent extends Component {
|    onClick = () =>  {
|        alert('Selected Row Count: ' + this.props.api.getSelectedRows().length)
|    }
|
|    render() {
|        const style = {
|            padding: 5,
|            margin: 5
|        }
|        return <input style={style} type="button" onClick={this.onClick} value="Click Me For Selected Row Count"/>;
|    }
|};
|```
