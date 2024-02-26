<framework-specific-section frameworks="vue">
|With Vue 2 and Vue 3 you can access the `params` object via `this.params` in the usual methods (lifecycle hooks, methods etc), and with Vue 3's `setup` 
|via `props.params`.
</framework-specific-section>

<framework-specific-section frameworks="vue">

```ts
  // ...
  beforeMount() {
    this.cellValue = this.params.value;
  }
  // ...
```

</framework-specific-section>

<framework-specific-section frameworks="vue">
|The `params` (interface ICellRendererParams) passed to the Cell Component are as follows:
</framework-specific-section>