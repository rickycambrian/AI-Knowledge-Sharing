# AI Knowledge Sharing Interface

This application provides a specialized interface for exploring and discussing topics from AI Knowledge Sharing sessions. It leverages the OpenAI Realtime API with WebRTC to create an interactive experience for learning about AI tools, best practices, and workflows.

## Overview

The AI Knowledge Sharing Interface is designed as an evolving system that:

1. Progressively learns from multiple knowledge sharing sessions
2. Maintains a knowledge graph of important concepts and their relationships
3. Provides contextual answers to questions about AI tools and techniques
4. Allows exploration of specific topics through specialized tools

## Current Capabilities

- Access and navigate content from the initial knowledge sharing session
- Explore topics like Claude Code usage, MCP servers, and note-taking methods
- View implementation details for various MCP servers
- Understand the proposed knowledge architecture

## Future Development

This interface is envisioned to evolve into a comprehensive knowledge system that will:

- Incorporate content from future knowledge sharing sessions automatically
- Build and maintain a knowledge graph that connects concepts across sessions
- Leverage tool use to find, research, and verify information
- Provide personalized learning paths based on user interests
- Maintain a persistent memory of important discoveries and insights
- Enable collaborative knowledge exploration and contribution

## Installation and Usage

Before you begin, you'll need an OpenAI API key - [create one in the dashboard here](https://platform.openai.com/settings/api-keys). Create a `.env` file from the example file and set your API key in there:

```bash
cp .env.example .env
```

Running this application locally requires [Node.js](https://nodejs.org/) to be installed. Install dependencies for the application with:

```bash
npm install
```

Start the application server with:

```bash
npm run dev
```

This should start the application on [http://localhost:3000](http://localhost:3000).

## Technical Implementation

This application is built with:

- Express.js backend for serving content and API endpoints
- React frontend for the interactive interface
- OpenAI's Realtime API for real-time conversation capabilities
- WebRTC for audio and data communication
- Custom session content parsing and knowledge management utilities

## How to Use

1. Start the application and connect to the AI
2. Ask questions about AI tools, workflows, or best practices
3. Explore specific topics using the topic navigation panel
4. View detailed information about MCP servers and their implementation
5. Learn about the knowledge architecture proposed in the session

## Adding New Sessions

As new knowledge sharing sessions are conducted, the system will be updated to incorporate their content, enriching the knowledge base and expanding the range of topics that can be explored.

## License

MIT
