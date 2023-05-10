[[only-javascript]]
|## Cell Renderer Component Lifecycle
|
|The lifecycle of the cell renderer is as follows:
|
|- `new` is called on the class.
|- `init()` is called once.
|- `getGui()` is called 0 or 1 times (`destroy` could get called first, i.e. when scrolling quickly)
|- `refresh()` is called 0...n times (i.e. it may never be called, or called multiple times)
|- `destroy()` is called once.
|
|In other words, `new()`, `init()` and `destroy()` are always called exactly once. `getGui()` will typically get called once unless `destroy()` is called first. `refresh()` is optionally called multiple times.
|
|[[note]]
|| When implementing `destroy()` it is important to check that any elements created in `getGui()` exist, as when scrolling quickly `destroy()` can get called first. Calling `getGui()` unnecessarily would negatively affect scroll performance.
|
|If you are doing `refresh()`, remember that `getGui()` is only called once (assuming the cell renderer hasn't been destroyed first), so be sure to update the existing GUI in your refresh, do not think that the grid is going to call `getGui()` again to get a new version of the GUI.
|
