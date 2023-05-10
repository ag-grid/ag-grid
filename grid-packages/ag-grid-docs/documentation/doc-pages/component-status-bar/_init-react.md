[[only-react]]
|```jsx
|  const updateStatusBar = () => { ... }
|
|  useEffect(() => {
|    props.api.addEventListener('modelUpdated', updateStatusBar);
|
|    // Remember to remove the event listener when the component is destroyed
|    return () => props.api.removeEventListener('modelUpdated', updateStatusBar);
|  }, []);
|```
