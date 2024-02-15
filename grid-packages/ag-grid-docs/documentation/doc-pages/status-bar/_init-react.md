<framework-specific-section frameworks="react">
<snippet transform={false} language="jsx">
|  const updateStatusBar = () => { ... }
|
|  useEffect(() => {
|    props.api.addEventListener('modelUpdated', updateStatusBar);
|
|    // Remove event listener when destroyed
|    return () => {
|        if (!props.api.isDestroyed()) {
|            props.api.removeEventListener('modelUpdated', updateStatusBar);
|        }
|    }
|  }, []);
</snippet>
</framework-specific-section>