<framework-specific-section frameworks="react">
|Below is an example of header component:
</framework-specific-section>

<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
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
|            &lt;div ref={refButton}
|                 className="customHeaderMenuButton"
|                 onClick={() => onMenuClicked()}>
|                &lt;i className={`fa ${props.menuIcon}`}>&lt;/i>
|            &lt;/div>;
|    }
|
|    let sort = null;
|    if (props.enableSorting) {
|        sort =
|            &lt;div style={{display: "inline-block"}}>
|                &lt;div onClick={event => onSortRequested('asc', event)} onTouchEnd={event => onSortRequested('asc', event)}
|                     className={`customSortDownLabel ${ascSort}`}>
|                    &lt;i className="fa fa-long-arrow-alt-down">&lt;/i>
|                &lt;/div>
|                &lt;div onClick={event => onSortRequested('desc', event)} onTouchEnd={event => onSortRequested('desc', event)}
|                     className={`customSortUpLabel ${descSort}`}>
|                    &lt;i className="fa fa-long-arrow-alt-up">&lt;/i>
|                &lt;/div>
|                &lt;div onClick={event => onSortRequested('', event)} onTouchEnd={event => onSortRequested('', event)}
|                     className={`customSortRemoveLabel ${noSort}`}>
|                    &lt;i className="fa fa-times">&lt;/i>
|                &lt;/div>
|            &lt;/div>;
|    }
|
|    return (
|        &lt;div>
|            {menu}
|            &lt;div className="customHeaderLabel">{props.displayName}&lt;/div>
|            {sort}
|        &lt;/div>
|    );
|};
</snippet>
</framework-specific-section>
