[[only-react]]
|Below is an example of a no rows overlay component with custom `noRowsMessageFunc()` params as a Hook:
|
|```jsx
|export default props => {
|    return (
|        <div className="ag-overlay-loading-center" style={{backgroundColor: 'lightcoral', height: '9%'}}>
|            <i className="far fa-frown"> {props.noRowsMessageFunc()}</i>
|        </div>
|    );
|};
|
|const gridOptions: GridOptions = {
|  ...
|  noRowsOverlayComponent: CustomNoRowsOverlay,
|  noRowsOverlayComponentParams: {
|    noRowsMessageFunc: () => 'Sorry - no rows! at: ' + new Date(),
|  },
|}
|```
|
|And here is the same example as a Class-based Component:
|
|```jsx
|export default class CustomNoRowsOverlay extends Component {
|    render() {
|        return (
|            <div className="ag-overlay-loading-center" style={{backgroundColor: 'lightcoral', height: '9%'}}>
|                <i className="far fa-frown"> {this.props.noRowsMessageFunc()}</i>
|            </div>
|        );
|    }
|}
|
|const gridOptions: GridOptions = {
|  ...
|  noRowsOverlayComponent: CustomNoRowsOverlay,
|  noRowsOverlayComponentParams: {
|    noRowsMessageFunc: () => 'Sorry - no rows! at: ' + new Date(),
|  },
|}
|```
