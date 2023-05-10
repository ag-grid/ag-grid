---
title: "Higher Order Components"
frameworks: ["react"]
---
### Redux / Higher Order Components (HOC)

[[note]]
| We provide a guide on how to use AG Grid with Redux in our <a href="../redux-integration-pt1/">React/Redux Integration Guide </a>

If you use `connect` to use Redux, or if you're using a Higher Order Component (HOC) to wrap the grid React component,
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
