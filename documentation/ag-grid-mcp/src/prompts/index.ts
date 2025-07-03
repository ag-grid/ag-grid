import { Prompt, GetPromptResult } from '@modelcontextprotocol/sdk/types.js';
import { validateFramework } from '../utils/validation.js';

export async function getPrompts(): Promise<Prompt[]> {
  return [
    {
      name: 'quick-start',
      description: 'Get started with AG-Grid in any framework',
      arguments: [
        {
          name: 'framework',
          description: 'Framework to use (react, angular, vue, vanilla)',
          required: true
        },
        {
          name: 'projectType',
          description: 'Project type (new or existing)',
          required: false
        },
        {
          name: 'typescript',
          description: 'Use TypeScript (true/false)',
          required: false
        },
        {
          name: 'features',
          description: 'Comma-separated list of features to include',
          required: false
        }
      ]
    },
    {
      name: 'advanced-feature',
      description: 'Implement complex features like Master-Detail or Pivoting',
      arguments: [
        {
          name: 'feature',
          description: 'Feature to implement (master-detail, pivoting, grouping, etc.)',
          required: true
        },
        {
          name: 'framework',
          description: 'Framework to use (react, angular, vue, vanilla)',
          required: true
        },
        {
          name: 'complexity',
          description: 'Implementation complexity (basic, intermediate, advanced)',
          required: false
        }
      ]
    },
    {
      name: 'performance-optimization',
      description: 'Optimize grid performance for large datasets',
      arguments: [
        {
          name: 'framework',
          description: 'Framework being used (react, angular, vue, vanilla)',
          required: true
        },
        {
          name: 'dataSize',
          description: 'Approximate data size (small, medium, large, enterprise)',
          required: true
        },
        {
          name: 'currentIssues',
          description: 'Current performance issues being experienced',
          required: false
        }
      ]
    },
    {
      name: 'troubleshooting',
      description: 'Debug common AG-Grid issues',
      arguments: [
        {
          name: 'issue',
          description: 'Description of the issue you are experiencing',
          required: true
        },
        {
          name: 'framework',
          description: 'Framework being used (react, angular, vue, vanilla)',
          required: false
        },
        {
          name: 'errorMessage',
          description: 'Any error messages you are seeing',
          required: false
        }
      ]
    },
    {
      name: 'data-integration',
      description: 'Help with connecting various data sources to AG-Grid',
      arguments: [
        {
          name: 'framework',
          description: 'Framework being used (react, angular, vue, vanilla)',
          required: true
        },
        {
          name: 'dataSource',
          description: 'Type of data source (api, websocket, static, database)',
          required: true
        },
        {
          name: 'realtime',
          description: 'Whether real-time updates are needed (true/false)',
          required: false
        }
      ]
    }
  ];
}

export async function handleGetPrompt(name: string, args?: any): Promise<GetPromptResult> {
  switch (name) {
    case 'quick-start':
      return handleQuickStartPrompt(args);
    case 'advanced-feature':
      return handleAdvancedFeaturePrompt(args);
    case 'performance-optimization':
      return handlePerformanceOptimizationPrompt(args);
    case 'troubleshooting':
      return handleTroubleshootingPrompt(args);
    case 'data-integration':
      return handleDataIntegrationPrompt(args);
    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}

async function handleQuickStartPrompt(args: any): Promise<GetPromptResult> {
  const framework = validateFramework(args?.framework || 'react');
  const projectType = args?.projectType || 'new';
  const typescript = args?.typescript === 'true' || args?.typescript === true;
  const features = args?.features ? args.features.split(',').map((f: string) => f.trim()) : [];

  const prompt = `I want to get started with AG-Grid in a ${framework} ${projectType} project${typescript ? ' using TypeScript' : ''}${features.length > 0 ? ` with the following features: ${features.join(', ')}` : ''}.

Please help me:
1. Set up the basic grid configuration
2. Install the necessary dependencies
3. Import required CSS files
4. Create a simple example with sample data
5. ${features.length > 0 ? `Add the requested features: ${features.join(', ')}` : 'Show me how to add common features like sorting and filtering'}

I'm looking for practical, working code examples that I can copy and use directly in my project.`;

  return {
    description: `Quick start guide for AG-Grid with ${framework}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt
        }
      }
    ]
  };
}

async function handleAdvancedFeaturePrompt(args: any): Promise<GetPromptResult> {
  const feature = args?.feature || 'master-detail';
  const framework = validateFramework(args?.framework || 'react');
  const complexity = args?.complexity || 'intermediate';

  const prompt = `I need help implementing ${feature} in AG-Grid using ${framework}. I want a ${complexity} level implementation.

Please provide:
1. Complete working code example
2. Explanation of how the feature works
3. Configuration options and their effects
4. Best practices for this feature
5. Common pitfalls to avoid
6. Performance considerations
7. Any enterprise license requirements
8. Related features that work well together

The code should be production-ready and include proper error handling where appropriate.`;

  return {
    description: `Advanced implementation guide for ${feature} in ${framework}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt
        }
      }
    ]
  };
}

async function handlePerformanceOptimizationPrompt(args: any): Promise<GetPromptResult> {
  const framework = validateFramework(args?.framework || 'react');
  const dataSize = args?.dataSize || 'large';
  const currentIssues = args?.currentIssues || '';

  const issuesText = currentIssues ? `\n\nCurrent issues I'm experiencing: ${currentIssues}` : '';

  const prompt = `I need help optimizing AG-Grid performance for ${dataSize} datasets in ${framework}.${issuesText}

Please provide:
1. Specific optimization strategies for ${dataSize} datasets
2. Best practices for ${framework} integration
3. Configuration options that improve performance
4. Memory management techniques
5. Server-side vs client-side considerations
6. Virtualization and pagination strategies
7. Profiling and monitoring techniques
8. Code examples showing optimized implementations

Focus on practical, measurable improvements that will have the biggest impact on performance.`;

  return {
    description: `Performance optimization guide for ${framework} with ${dataSize} datasets`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt
        }
      }
    ]
  };
}

async function handleTroubleshootingPrompt(args: any): Promise<GetPromptResult> {
  const issue = args?.issue || 'grid not displaying properly';
  const framework = args?.framework ? validateFramework(args.framework) : undefined;
  const errorMessage = args?.errorMessage || '';

  const frameworkText = framework ? ` in ${framework}` : '';
  const errorText = errorMessage ? `\n\nError message: ${errorMessage}` : '';

  const prompt = `I'm having trouble with AG-Grid${frameworkText}. The issue is: ${issue}${errorText}

Please help me:
1. Identify the likely causes of this issue
2. Provide step-by-step troubleshooting steps
3. Show corrected code examples if applicable
4. Explain how to prevent this issue in the future
5. Suggest debugging techniques for similar problems
6. Point me to relevant documentation sections

I need practical solutions that I can implement right away.`;

  return {
    description: `Troubleshooting guide for: ${issue}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt
        }
      }
    ]
  };
}

async function handleDataIntegrationPrompt(args: any): Promise<GetPromptResult> {
  const framework = validateFramework(args?.framework || 'react');
  const dataSource = args?.dataSource || 'api';
  const realtime = args?.realtime === 'true' || args?.realtime === true;

  const realtimeText = realtime ? ' with real-time updates' : '';

  const prompt = `I need help connecting AG-Grid to a ${dataSource} data source${realtimeText} using ${framework}.

Please provide:
1. Complete code example for ${dataSource} integration
2. Data binding patterns for ${framework}
3. Error handling and loading states
4. ${realtime ? 'Real-time update strategies' : 'Data refresh strategies'}
5. Performance considerations for this data source type
6. Caching and optimization techniques
7. Security best practices
8. Testing approaches

The solution should be production-ready and handle edge cases properly.`;

  return {
    description: `Data integration guide for ${dataSource} with ${framework}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: prompt
        }
      }
    ]
  };
}