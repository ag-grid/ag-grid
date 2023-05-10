[[only-vue]]
|## Cell Renderer Component Lifecycle
|
|The lifecycle of the cell renderer is as follows:
|
|- The component will be instantiated.
|- The component's GUI will be inserted into the grid 0 or 1 times (the component could get destroyed first, i.e. when scrolling quickly).
|- `refresh()` is called 0...n times (i.e. it may never be called, or called multiple times).
|- The component is destroyed once.
|
|In other words, component instantiation and destruction are always called exactly once. The component's GUI will
|typically get rendered once unless the component is destroyed first. `refresh()` is optionally called multiple times.
