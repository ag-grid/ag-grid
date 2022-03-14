[[only-react]]
|Below is an example of overlay component with custom `loadingMessage` param as a Hook:
|
|```jsx
|export default props => {
|    return (
|        <div className="ag-custom-loading-cell" style={{paddingLeft: '10px', lineHeight: '25px'}}>
|            <i className="fas fa-spinner fa-pulse"></i> <span> {props.loadingMessage}</span>
|        </div>
|    );
|};
|
|const gridOptions: GridOptions = {
|  ...
|  loadingOverlayComponent: CustomLoadingOverlay,
|  loadingOverlayComponentParams: {
|    loadingMessage: 'One moment please...',
|  },
|}
|```
|
|And here is the same example as a Class-based Component:
|
|```jsx
|export default class CustomLoadingOverlay extends Component {
|    render() {
|        return (
|            <div className="ag-overlay-loading-center" style={{backgroundColor: 'lightsteelblue', height: '9%'}}>
|                <i className="fas fa-hourglass-half"> {this.props.loadingMessage} </i>
|            </div>
|        );
|    }
|}
|
|const gridOptions: GridOptions = {
|  ...
|  loadingOverlayComponent: CustomLoadingOverlay,
|  loadingOverlayComponentParams: {
|    loadingMessage: 'One moment please...',
|  },
|}
|```
