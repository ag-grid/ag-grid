#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Import tools
import { 
  generateGridConfigTool, 
  handleGenerateGridConfig 
} from './tools/generateGridConfig.js';
import { 
  createColumnDefinitionsTool, 
  handleCreateColumnDefinitions 
} from './tools/createColumnDefinitions.js';
import { 
  setupDataBindingTool, 
  handleSetupDataBinding 
} from './tools/setupDataBinding.js';
import { 
  addGridFeatureTool, 
  handleAddGridFeature 
} from './tools/addGridFeature.js';

// Import resources and prompts (we'll create these)
import { getResources, handleReadResource } from './resources/index.js';
import { getPrompts, handleGetPrompt } from './prompts/index.js';

class AgGridMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'ag-grid-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // Tool handlers
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          generateGridConfigTool,
          createColumnDefinitionsTool,
          setupDataBindingTool,
          addGridFeatureTool,
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'generate-grid-config':
            return {
              content: [
                {
                  type: 'text',
                  text: await handleGenerateGridConfig(args),
                },
              ],
            };

          case 'create-column-definitions':
            return {
              content: [
                {
                  type: 'text',
                  text: await handleCreateColumnDefinitions(args),
                },
              ],
            };

          case 'setup-data-binding':
            return {
              content: [
                {
                  type: 'text',
                  text: await handleSetupDataBinding(args),
                },
              ],
            };

          case 'add-grid-feature':
            return {
              content: [
                {
                  type: 'text',
                  text: await handleAddGridFeature(args),
                },
              ],
            };

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });

    // Resource handlers
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: await getResources(),
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      return await handleReadResource(uri);
    });

    // Prompt handlers
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: await getPrompts(),
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await handleGetPrompt(name, args);
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('AG-Grid MCP Server running on stdio');
  }
}

const server = new AgGridMcpServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});