---
title: "Context API & Redux"
---

### React Context API

If you're using the new React Context API then you can access the context in the components used within the grid.

First, let's create a context we can use in our components:

```js
import React from "react";
export default React.createContext('normal');
```

Next we need to provide the context in a parent component (at the Grid level, or above) - for example:

```jsx
<FontContext.Provider value="bold">
    <GridComponent/>
</FontContext.Provider>
```

Finally, we need to consume the context within our component:

```jsx
class StyledRenderer extends Component {
    render() {
        return (
            <FontContext.Consumer>
                {fontWeight => <span style={{ fontWeight }}>Stylised Component!</span> }
            </FontContext.Consumer>
        );
    }
}
```

### Redux / Higher Order Components (HOC)

[[note]]
| We provide a guide on how to use ag-Grid with Redux in our <a href="../redux-integration-pt1/">React/Redux Integration Guide </a>

If you use `connect` to use Redux, or if you're using a Higher Order Component (HOC) to wrap the grid React component at all,
you'll also need to ensure the grid can get access to the newly created component. To do this you need to ensure `forwardRef`
is set:

```js
export default connect((state) => {
    return {
        currencySymbol: state.currencySymbol,
        exchangeRate: state.exchangeRate
    }
}, null, null, { forwardRef: true } // must be supplied for react/redux when using AgGridReact
)(PriceRenderer);
```
