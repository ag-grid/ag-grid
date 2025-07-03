import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { GridConfigSchema } from '../utils/validation.js';
import { CodeGenerationService } from '../utils/codeGeneration.js';
import { GridConfig } from '../types/index.js';

export const generateGridConfigTool: Tool = {
  name: 'generate-grid-config',
  description: 'Generate basic AG-Grid configuration code for the specified framework',
  inputSchema: {
    type: 'object',
    properties: {
      framework: {
        type: 'string',
        enum: ['react', 'angular', 'vue', 'vanilla'],
        description: 'The framework to generate code for'
      },
      version: {
        type: 'string',
        description: 'AG-Grid version (optional, defaults to latest)',
        pattern: '^\\d+\\.\\d+\\.\\d+(-\\w+)?$'
      },
      features: {
        type: 'array',
        items: {
          type: 'string'
        },
        description: 'Additional features to include in the configuration'
      },
      theme: {
        type: 'string',
        description: 'AG-Grid theme name (default: ag-theme-quartz)',
        enum: ['ag-theme-quartz', 'ag-theme-alpine', 'ag-theme-balham', 'ag-theme-material']
      },
      enterpriseFeatures: {
        type: 'boolean',
        description: 'Whether to include enterprise features (default: false)'
      }
    },
    required: ['framework']
  }
};

export async function handleGenerateGridConfig(args: any): Promise<string> {
  const validatedArgs = GridConfigSchema.parse(args);
  
  try {
    const config: GridConfig = {
      framework: validatedArgs.framework,
      version: validatedArgs.version || '34.0.0',
      features: validatedArgs.features || [],
      theme: validatedArgs.theme || 'ag-theme-quartz',
      enterpriseFeatures: validatedArgs.enterpriseFeatures || false
    };

    const code = CodeGenerationService.generateGridConfig(config);
    
    const packageInfo = getPackageInfo(config);
    const installCommand = getInstallCommand(config);
    
    return `## ${config.framework.charAt(0).toUpperCase() + config.framework.slice(1)} AG-Grid Configuration

### Installation
\`\`\`bash
${installCommand}
\`\`\`

### Code
\`\`\`${config.framework === 'vanilla' ? 'javascript' : config.framework === 'react' ? 'jsx' : 'typescript'}
${code}
\`\`\`

### Package Information
${packageInfo}

### Next Steps
1. Import the necessary CSS files in your main application file
2. Set up your row data and column definitions
3. Configure additional grid options as needed
4. Consider adding features like sorting, filtering, and pagination

### Theme Options
- \`ag-theme-quartz\` (default) - Modern, clean theme
- \`ag-theme-alpine\` - Compact theme for dense data
- \`ag-theme-balham\` - Professional theme with subtle styling
- \`ag-theme-material\` - Material Design theme

### Documentation
- [Getting Started Guide](https://www.ag-grid.com/documentation/)
- [${config.framework.charAt(0).toUpperCase() + config.framework.slice(1)} Integration](https://www.ag-grid.com/documentation/${config.framework}/)
- [Themes](https://www.ag-grid.com/documentation/themes/)`;
  } catch (error) {
    throw new Error(`Failed to generate grid configuration: ${error}`);
  }
}

function getPackageInfo(config: GridConfig): string {
  const packages = ['ag-grid-community'];
  
  if (config.framework === 'react') {
    packages.push('ag-grid-react');
  } else if (config.framework === 'angular') {
    packages.push('ag-grid-angular');
  } else if (config.framework === 'vue') {
    packages.push('ag-grid-vue3');
  }
  
  if (config.enterpriseFeatures) {
    packages.push('ag-grid-enterprise');
  }
  
  return `Required packages: ${packages.join(', ')}`;
}

function getInstallCommand(config: GridConfig): string {
  const packages = ['ag-grid-community'];
  
  if (config.framework === 'react') {
    packages.push('ag-grid-react');
  } else if (config.framework === 'angular') {
    packages.push('ag-grid-angular');
  } else if (config.framework === 'vue') {
    packages.push('ag-grid-vue3');
  }
  
  if (config.enterpriseFeatures) {
    packages.push('ag-grid-enterprise');
  }
  
  return `npm install ${packages.join(' ')}`;
}