[[only-react]]
|Below is a simple example of loading cell renderer component as a Hook:
|
|```jsx
|export default props => {
|    return (
|        <div className="ag-overlay-loading-center" style={{backgroundColor: 'lightsteelblue', height: '9%'}}>
|            <i className="fas fa-hourglass-half"> {props.loadingMessage} </i>
|        </div>
|    );
|};
|```
|
|And here is the same example as a Class-based Component:
|
|```jsx
|export default class CustomLoadingCellRenderer extends Component {
|    render() {
|        return (
|            <div className="ag-custom-loading-cell" style={{paddingLeft: '10px', lineHeight: '25px'}}>
|                <i className="fas fa-spinner fa-pulse"></i> <span> {this.props.loadingMessage}</span>
|            </div>
|        );
|    }
|}
|```
