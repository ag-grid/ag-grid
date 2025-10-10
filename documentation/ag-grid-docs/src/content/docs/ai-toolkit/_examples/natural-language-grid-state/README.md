# Natural Language Grid State Management Example

This example demonstrates how to integrate ChatGPT O1 mini with AG-Grid's state management system to allow users to modify grid configuration using natural language commands.

## Overview

The example provides a complete implementation that:
1. Captures the current grid state and column definitions
2. Sends natural language requests to ChatGPT O1 mini with a structured prompt
3. Receives a typed response that matches AG-Grid's setState function signature
4. Applies the changes to the grid and provides user feedback

## Key Features

- **Natural Language Processing**: Users can request grid changes in plain English
- **Type-Safe Integration**: Schema ensures ChatGPT returns valid GridState objects
- **Comprehensive State Management**: Supports all AG-Grid state properties
- **Error Handling**: Graceful handling of invalid requests or API errors
- **Visual Feedback**: Clear indication of processing status and changes made

## Files Structure

```
natural-language-grid-state/
├── index.html          # Main HTML page with UI
├── main.ts             # TypeScript implementation
├── styles.css          # Additional styling
├── gridStateSchema.ts  # TypeScript schema for ChatGPT responses
└── README.md          # This documentation
```

## Implementation Details

### Schema Definition

The `gridStateSchema.ts` file defines the expected response format from ChatGPT:

```typescript
interface ChatGPTGridStateResponse {
    gridState: GridState;      // Complete grid state object
    propertiesToIgnore?: string[];  // Optional properties to ignore
    explanation: string;       // Human-readable explanation
}
```

### Prompt Template

The system uses a structured prompt that includes:
- Current grid state
- Available column definitions
- List of supported state properties
- User's natural language request
- Response format requirements

### Supported Commands

The example includes demo handlers for:
- **Column Visibility**: "hide age column"
- **Sorting**: "sort by gold medals"
- **Grouping**: "group by country"
- **Column Pinning**: "pin athlete column"
- **Filtering**: "filter for USA athletes"

## Integration with ChatGPT API

### API Setup

Replace the `callChatGPT` function in `main.ts` with actual API integration:

```typescript
async function callChatGPT(prompt: string): Promise<ChatGPTGridStateResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${YOUR_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an AG-Grid state management assistant. Respond only with valid JSON matching the provided schema.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.1,
            max_tokens: 2000
        })
    });
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}
```

### Environment Variables

Set up your OpenAI API key:

```bash
# .env file
OPENAI_API_KEY=your_api_key_here
```

## Grid State Properties

The system supports all AG-Grid state properties:

### Column State
- `columnOrder`: Reorder columns
- `columnPinning`: Pin columns left/right
- `columnSizing`: Resize columns
- `columnVisibility`: Show/hide columns

### Data Management
- `filter`: Apply column/advanced filters
- `sort`: Sort columns
- `rowGroup`: Group by columns
- `pivot`: Enable pivot mode
- `aggregation`: Set aggregation functions

### UI State
- `pagination`: Page settings
- `sideBar`: Sidebar configuration
- `rowSelection`: Selected rows
- `scroll`: Scroll position
- `focusedCell`: Focused cell

## Usage Examples

### Basic Commands
```
"Hide the age column"
"Sort by gold medals descending"
"Group rows by country"
"Pin the athlete column to the left"
"Show only USA athletes"
```

### Advanced Commands
```
"Hide age and year columns, then sort by total medals"
"Group by country and sport, then expand all groups"
"Pin athlete column left, hide bronze and silver columns"
"Filter for athletes with more than 2 gold medals"
```

### Complex State Changes
```
"Set up a pivot table with country as rows and sport as columns, showing gold medal counts"
"Create a filtered view of swimmers grouped by country with athlete column pinned"
```

## Error Handling

The system includes comprehensive error handling:

1. **Invalid Requests**: Clear feedback for unrecognized commands
2. **API Errors**: Graceful handling of network/API issues
3. **State Validation**: Ensures generated state is valid before applying
4. **Fallback Responses**: Default explanations for edge cases

## Security Considerations

- **API Key Protection**: Never expose API keys in client-side code
- **Input Validation**: Sanitize user inputs before sending to API
- **Rate Limiting**: Implement appropriate rate limiting for API calls
- **Content Filtering**: Filter potentially harmful requests

## Performance Optimization

- **Caching**: Cache common state patterns
- **Debouncing**: Prevent rapid successive API calls
- **Partial Updates**: Only update changed state properties
- **Loading States**: Provide clear feedback during processing

## Testing

The example includes built-in demo responses for testing without API integration:

```typescript
// Test commands that work in demo mode
testCommands = [
    "hide age column",
    "sort by gold medals", 
    "group by country",
    "pin athlete column",
    "filter for USA athletes"
];
```

## Deployment

1. **Development**: Run locally with demo responses
2. **Staging**: Test with actual ChatGPT API integration
3. **Production**: Deploy with proper error handling and monitoring

## Future Enhancements

- **Voice Input**: Add speech recognition for voice commands
- **Multi-language Support**: Support commands in different languages
- **Learning System**: Improve responses based on user feedback
- **Custom Commands**: Allow users to define custom command shortcuts
- **State History**: Track and allow rollback of state changes

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Verify API key is valid and has sufficient credits
   - Check API key permissions for model access

2. **Invalid Responses**
   - Ensure prompt template is properly formatted
   - Verify response schema matches expected format

3. **State Application Errors**
   - Check column IDs exist in grid
   - Validate state properties are supported

### Debug Mode

Enable debug logging by setting:
```typescript
const DEBUG_MODE = true;
```

This will log:
- Generated prompts
- API responses
- State changes
- Error details

## License

This example is provided as part of the AG-Grid documentation and follows the same license terms as AG-Grid.