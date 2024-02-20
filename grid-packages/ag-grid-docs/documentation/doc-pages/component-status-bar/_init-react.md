<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|  const updateStatusBar = () => { ... }
|
|  useEffect(() => {
|    props.api.addEventListener('modelUpdated', updateStatusBar);
|
|    // Remember to remove the event listener when the component is destroyed
|    return () => {
|        if (!props.api.isDestroyed()) {
|            props.api.removeEventListener('modelUpdated', updateStatusBar);
|        }
|    }
|  }, []);
</snippet>
</framework-specific-section>