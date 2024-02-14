---
title: "Upgrading to AG Grid 31.1"
---

TODO

<framework-specific-section frameworks="react">
<h2 id="migrating-to-use-reactivecustomcomponents">Migrating to Use reactiveCustomComponents</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|Custom components created without `reactiveCustomComponents` may require some changes in order to work with the setting enabled.
|
|The following four component types require changes in order to migrate.
</framework-specific-section>

<framework-specific-section frameworks="react">
<h3 id="custom-cell-editor-components">Custom Cell Editor Components</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|- `getValue` is no longer used. The component will be passed `value` as a prop with the latest value (and `initialValue` with the value when editing started). When the value is updated in the UI, the component should call the prop `onValueChange` with the updated value.
|- Any other date methods defined via `useImperativeHandle` should now be defined as callbacks, and passed to the new hook `useGridCellEditor`. These are all optional; the hook is only needed if the callbacks are required.
|
|See [Implementing a Cell Editor Component](/component-cell-editor/#implementing-a-cell-editor-component) for examples and more details on the interfaces.
</framework-specific-section>

<framework-specific-section frameworks="react">
<h3 id="custom-date-components">Custom Date Components</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|- `getDate` and `setDate` are no longer used. The component will be passed `date` as a prop with the latest date. When the date is updated in the UI, the component should call the prop `onDateChange` with the updated date (instead of calling the prop `onDateChanged` when the date changes).
|- Any other editing methods defined via `useImperativeHandle` should now be defined as callbacks, and passed to the new hook `useGridDate`. These are all optional; the hook is only needed if the callbacks are required.
|
|See [Implementing a Date Component](/component-date/#implementing-a-date-component) for examples and more details on the interfaces.
</framework-specific-section>

<framework-specific-section frameworks="react">
<h3 id="custom-filter-components">Custom Filter Components</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|- `isFilterActive` method is no longer used. If the model is `null`, the filter is treated as inactive.
|- `getModel` and `setModel` are no longer used. The component will be passed `model` as a prop with the latest model. When the filter is updated in the UI, the component should call the prop `onModelChange` with the updated model (instead of calling the prop `filterChangedCallback` when the model changes).
|- The `filterModifiedCallback` prop is replaced with the prop `onUiChange`.
|- Any other filter methods defined via `useImperativeHandle` should now be defined as callbacks, and passed to the new hook `useGridFilter`. `doesFilterPass` is a mandatory callback; all others are optional.
|
|See [Implementing a Filter Component](/component-filter/#implementing-a-filter-component) for examples and more details on the interfaces.
</framework-specific-section>

<framework-specific-section frameworks="react">
<h3 id="custom-floating-filter-components">Custom Floating Filter Components</h2>
</framework-specific-section>

<framework-specific-section frameworks="react">
|- `onParentModelChanged` is no longer used. The component will be passed `model` as a prop with the latest model. When the filter is updated in the UI, the component should call the prop `onModelChange` with the updated model (instead of calling the prop `parentFilterInstance` and setting the updated value directly on the parent filter instance when the model changes).
|- Any other filter methods defined via `useImperativeHandle` should now be defined as callbacks, and passed to the new hook `useGridFloatingFilter`. These are all optional; the hook is only needed if the callbacks are required.
|
|See [Implementing a Floating Filter Component](/component-floating-filter/#implementing-a-floating-filter-component) for examples and more details on the interfaces.
</framework-specific-section>
