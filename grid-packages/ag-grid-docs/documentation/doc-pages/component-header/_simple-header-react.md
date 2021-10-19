[[only-react]]
|Below is a simple example of header component as a Hook:
|
|```jsx
|export default props => {
|    const [ascSort, setAscSort] = useState('inactive');
|    const [descSort, setDescSort] = useState('inactive');
|    const [noSort, setNoSort] = useState('inactive');
|    const refButton = useRef(null);
|
|    const onMenuClicked = () => {
|        props.showColumnMenu(refButton.current);
|    }
|
|    const onSortChanged = () => {
|        setAscSort(props.column.isSortAscending() ? 'active' : 'inactive');
|        setDescSort(props.column.isSortDescending() ? 'active' : 'inactive');
|        setNoSort(!props.column.isSortAscending() && !props.column.isSortDescending() ? 'active' : 'inactive');
|    }
|
|    const onSortRequested = (order, event) => {
|        props.setSort(order, event.shiftKey);
|    }
|
|    useEffect(() => {
|        props.column.addEventListener('sortChanged', onSortChanged);
|        onSortChanged()
|    }, []);
|
|    let menu = null;
|    if (props.enableMenu) {
|        menu =
|            <div ref={refButton}
|                 className="customHeaderMenuButton"
|                 onClick={() => onMenuClicked()}>
|                <i className={`fa ${props.menuIcon}`}></i>
|            </div>;
|    }
|
|    let sort = null;
|    if (props.enableSorting) {
|        sort =
|            <div style={{display: "inline-block"}}>
|                <div onClick={event => onSortRequested('asc', event)} onTouchEnd={event => onSortRequested('asc', event)}
|                     className={`customSortDownLabel ${ascSort}`}>
|                    <i className="fa fa-long-arrow-alt-down"></i>
|                </div>
|                <div onClick={event => onSortRequested('desc', event)} onTouchEnd={event => onSortRequested('desc', event)}
|                     className={`customSortUpLabel ${descSort}`}>
|                    <i className="fa fa-long-arrow-alt-up"></i>
|                </div>
|                <div onClick={event => onSortRequested('', event)} onTouchEnd={event => onSortRequested('', event)}
|                     className={`customSortRemoveLabel ${noSort}`}>
|                    <i className="fa fa-times"></i>
|                </div>
|            </div>;
|    }
|
|    return (
|        <div>
|            {menu}
|            <div className="customHeaderLabel">{props.displayName}</div>
|            {sort}
|        </div>
|    );
|};
|```
|
|And here is the same example as a Class-based Component:
|
|```jsx
|export default class CustomHeader extends Component {
|    constructor(props) {
|        super(props);
|
|        this.state = {
|            ascSort: 'inactive',
|            descSort: 'inactive',
|            noSort: 'inactive'
|        };
|
|        props.column.addEventListener('sortChanged', this.onSortChanged.bind(this));
|    }
|
|    componentDidMount() {
|        this.onSortChanged();
|    }
|
|    render() {
|        let menu = null;
|        if (this.props.enableMenu) {
|            menu =
|                <div ref={(menuButton) => {
|                    this.menuButton = menuButton;
|                }}
|                     className="customHeaderMenuButton"
|                     onClick={this.onMenuClicked.bind(this)}>
|                    <i className={`fa ${this.props.menuIcon}`}></i>
|                </div>;
|        }
|
|        let sort = null;
|        if (this.props.enableSorting) {
|            sort =
|                <div style={{display: "inline-block"}}>
|                    <div onClick={this.onSortRequested.bind(this, 'asc')} onTouchEnd={this.onSortRequested.bind(this, 'asc')}
|                         className={`customSortDownLabel ${this.state.ascSort}`}>
|                        <i className="fa fa-long-arrow-alt-down"></i>
|                    </div>
|                    <div onClick={this.onSortRequested.bind(this, 'desc')} onTouchEnd={this.onSortRequested.bind(this, 'desc')}
|                         className={`customSortUpLabel ${this.state.descSort}`}>
|                        <i className="fa fa-long-arrow-alt-up"></i>
|                    </div>
|                    <div onClick={this.onSortRequested.bind(this, '')} onTouchEnd={this.onSortRequested.bind(this, '')}
|                         className={`customSortRemoveLabel ${this.state.noSort}`}>
|                        <i className="fa fa-times"></i>
|                    </div>
|                </div>;
|        }
|
|        return (
|            <div>
|                {menu}
|                <div className="customHeaderLabel">{this.props.displayName}</div>
|                {sort}
|            </div>
|        );
|    }
|
|    onMenuClicked() {
|        this.props.showColumnMenu(this.menuButton);
|    }
|
|    onSortChanged() {
|        this.setState({
|            ascSort: this.props.column.isSortAscending() ? 'active' : 'inactive',
|            descSort: this.props.column.isSortDescending() ? 'active' : 'inactive',
|            noSort: !this.props.column.isSortAscending() && !this.props.column.isSortDescending() ? 'active' : 'inactive'
|        });
|    }
|
|    onSortRequested(order, event) {
|        this.props.setSort(order, event.shiftKey);
|    }
|}
|```
