# Prompt

The Comments column comes out so wide that it pushes the other columns off the screen. It should never be wider than 300 pixels

# Expected

Either `columnLimits: [{ colId: 'comments', maxWidth: 300 }]` added to the existing `autoSizeStrategy`, or `maxWidth: 300` on the comments column definition. One line either way.
