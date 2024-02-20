<framework-specific-section frameworks="react">
|The Component is provided `props` containing, amoungst other things, the value to be rendered.
</framework-specific-section>

<framework-specific-section frameworks="react">

```ts
// this comp gets inserted into the Cell
const CustomButtonComp = props => {
    return <>{props.value}</>;
};
```

</framework-specific-section>

<framework-specific-section frameworks="react">
|The provided `props` (interface CustomCellRendererProps) are:
</framework-specific-section>
