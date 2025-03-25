# AI Knowledge Sharing Interface

This document tracks our progress in adapting the OpenAI Realtime Console to create a specialized interface for answering questions about AI knowledge sharing, tools, and best practices.

## Project Overview

We're modifying the OpenAI Realtime Console to create a specialized chat interface that provides information from the AI Knowledge Sharing session (session-one.Rmd). This interface will help users understand AI tools, workflows, and best practices covered in the session.

## Current Structure

The application currently consists of:
- Express.js server (server.js)
- React client (client/)
  - Main App component (App.jsx)
  - Various UI components (EventLog, SessionControls, ToolPanel)
- Connection to OpenAI's Realtime API for WebRTC audio and data channel

## Modification Goals

1. Change the backend to use session-one.Rmd content as context instead of an open-ended OpenAI model
2. Adapt the UI to focus on knowledge sharing rather than being a general-purpose console
3. Implement specialized tools for navigating the content from the session
4. Update styling and branding to reflect the AI Knowledge Sharing focus

## Tasks & Progress

### Backend Changes
- [x] Create utility functions to process content from session-one.Rmd
- [x] Build functions to query specific topics, MCP servers, and other content
- [x] Generate system prompt from session content
- [x] Modify server.js to load content and include in API requests
- [x] Create API endpoints for tools to retrieve session content

### UI Changes
- [x] Update branding (logo, title) to reflect AI Knowledge Sharing theme
- [x] Replace "realtime console" text with "AI Knowledge Sharing"
- [x] Add topic navigation interface in the ToolPanel
- [ ] Further enhance interface layout for knowledge content presentation

### Tool Implementation
- [x] Replace the color palette tool with knowledge navigation tools:
  - [x] Topic explorer tool - lists main topics from the session
  - [x] MCP server lookup tool - provides details on specific MCP servers
  - [x] Code snippet display capabilities
  - [x] Architecture diagram visualization support

### Content Processing
- [x] Parse and structure the session-one.Rmd content
- [x] Extract sections by headings and subheadings
- [x] Create query functions for topics and content
- [x] Process code blocks separately for better formatting

### Additional Features
- [ ] Add support for context-aware answers based on the session content
- [ ] Implement example MCP server integration as described in the session
- [ ] Add visualization for the architecture diagram mentioned in the session
- [ ] Add "further reading" suggestions based on topics

## Implementation Details

### Session Content Processing
1. Extract the main sections from session-one.Rmd using heading markers (# and ##)
2. Convert code blocks to a structured format for easy retrieval
3. Create a mapping of topics to content sections
4. Store this structure in a format accessible to the React frontend

### Custom Tool Definitions
We'll replace the current `display_color_palette` tool with:

```javascript
const sessionTools = [
  {
    type: "function",
    name: "get_topic_information",
    description: "Get detailed information about a specific AI Knowledge Sharing topic",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "The topic to get information about (e.g., 'Claude Code', 'MCP Servers', etc.)",
        }
      },
      required: ["topic"]
    }
  },
  {
    type: "function",
    name: "get_mcp_server_details",
    description: "Get installation and usage details for a specific MCP server",
    parameters: {
      type: "object",
      properties: {
        server_name: {
          type: "string",
          description: "The name of the MCP server (e.g., 'Perplexity', 'Firecrawl', etc.)",
        }
      },
      required: ["server_name"]
    }
  },
  {
    type: "function",
    name: "show_architecture_diagram",
    description: "Display the knowledge architecture diagram from the session",
    parameters: {
      type: "object",
      properties: {}
    }
  }
];
```

### Backend Flow
1. Server loads and processes the session-one.Rmd content on startup
2. When a token is requested, we inject the processed content as context
3. We modify the WebRTC data channel to handle our custom tools
4. The server responds with content from the structured session data

## Reference Files

- `/server.js` - Server with OpenAI WebRTC integration to modify
- `/client/components/App.jsx` - Main React component that handles the WebRTC connection
- `/client/components/ToolPanel.jsx` - Tool implementation to replace with our custom tools
- `/client/components/EventLog.jsx` - Displays conversation history

## Implementation Progress

We have successfully:

1. ✅ Created utility functions to parse and query session-one.Rmd content
2. ✅ Modified server.js to load session content and include it in API requests
3. ✅ Updated App.jsx to reflect the AI Knowledge Sharing branding
4. ✅ Replaced the ToolPanel implementation with knowledge-sharing specific tools
5. ✅ Added API endpoints for retrieving topics, MCP servers, and other content

## Next Actions

1. Test the application to ensure all APIs and data flow are working correctly
2. Add error handling for when session-one.Rmd path is incorrect
3. Update the logo to something more relevant to AI Knowledge Sharing
4. Enhance the UI with visual improvements and better content presentation
5. Consider adding support for interactive architecture diagram rendering using a mermaid library
6. Add search functionality to quickly find specific topics
7. Add "similar topics" recommendations when viewing a topic

## Running the Application

To run the application:

1. Ensure you have an OpenAI API key in a .env file
2. Make sure the path to session-one.Rmd is correct (currently set to `../session-one/session-one.Rmd`)
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start the application
5. Access the application at http://localhost:3000

The application will now provide a specialized interface for exploring and discussing topics from the AI Knowledge Sharing session.