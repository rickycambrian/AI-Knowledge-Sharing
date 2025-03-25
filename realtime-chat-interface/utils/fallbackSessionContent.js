/**
 * This file contains fallback session content for when the actual Rmd file cannot be loaded.
 * It's a simplified version of the actual session content with key topics and concepts.
 */

export const fallbackSessionContent = {
  title: 'AI Knowledge Sharing Session',
  date: 'March 25, 2025',
  topics: [
    'Claude Code Tips',
    'Easily Reset Context',
    'CLAUDE.md configuration',
    'Failure Modes to Avoid',
    'Division of Labor', 
    'MCP Servers',
    'Perplexity',
    'Firecrawl',
    'AgentQL',
    'Repomix',
    'Note Taking',
    'Knowledge Architecture'
  ],
  mcpServers: [
    { 
      name: 'Perplexity', 
      description: 'Useful for giving LLM the ability to discover context newer than what it was trained on.',
      installationCode: 'claude mcp add perplexity-ask npx -- -y @modelcontextprotocol/server-perplexity-ask -e PERPLEXITY_API_KEY=YOUR_API_KEY_HERE'
    },
    { 
      name: 'Firecrawl', 
      description: 'Allows LLM to get a website\'s text content.',
      installationCode: 'claude mcp add mcp-server-firecrawl npx -- -y firecrawl-mcp'
    },
    { 
      name: 'AgentQL', 
      description: 'AgentQL is an amazing web scraping tool, you start with the data you care about and the format, and the tool is always able to figure out how to extract it from the web page, even as the website structurally changes.',
      installationCode: 'claude mcp add agentql npx -- -y agentql-mcp -e AGENTQL_API_KEY=YOUR_API_KEY'
    },
    { 
      name: 'Repomix', 
      description: 'This tool is very useful for navigating GitHub repositories and their code in a way where tokens can be more intelligently managed.',
      installationCode: 'claude mcp add repomix npx -- -y repomix --mcp'
    }
  ],
  codeSnippets: [],
  sections: [
    {
      level: 1,
      title: 'Claude Code Tips',
      content: `Claude Code is what I tend to use the most and get the best balance between good results, right level of thinking, and most effective tool calling (built-in + MCP). More capable than other tools in thinking hieraarchically about tasks and parallel tool executions for each sub-task which other tools do not do. I consider this to be the best interface for my work, so here are some helpful tips.

Tip 1 - Easily Reset Context: Claude Code does not give you infinite context like Cline and other tools. But this is actually very beneficial because you are directly aware of all the information the LLM currently has access to and what it doesn't know about.

Tip 2 - CLAUDE.md configuration: You can initialize the 'CLAUDE.md' file using /init from Claude Code chat. This will auto-generate the file based on the code repository.

Tip 3 - Failure Modes to Avoid: Sonnet 3.7 loves to create mock data and invent workarounds to arrive at the needed solution.

Tip 4 - Reset context: Claude Code will auto-reset context before it runs out, but it's better to find a good place to run the /compact command before getting below 20%.

Tip 5 - Division of Labor: Think about the division of labor between what you should do and what the AI workflows should be doing.

Tip 6 - Try to have fun: Try to find opportunities to discover the more interesting and fun sides of your interests.`,
      subsections: []
    },
    {
      level: 1,
      title: 'MCP Servers',
      content: `The way you setup MCP servers depends on the chat interface you are using. Each interface like Claude Desktop, Cline, Cursor, etc... have their own .json configuration. This configuration runs a command that initializes the MCP servers for the chat you are having and exposes them as available tools. In order to install a new MCP server you need to add a command, mapped to a name to recognize the MCP server by.

There are two main categories of use-cases for you to want to use an MCP server through a chat interface:
1. Get information that's not available in the LLM's trained context.
2. Interact with an external service`,
      subsections: []
    },
    {
      level: 1,
      title: 'Note Taking',
      content: `I think it's very important to capture your notes in an Obsidian compatible format.
- Creating relations in notes helps us navigate and discover the context better as both humans and agents

Goal: have instant access to any information of anything you worked on over the past several years with no added overhead for your ideal note-taking method

My note taking method:
- As you write your notes, whenever you want to tie a piece of information to an entity, you can mention it as [[entity]] which will create a connection between that information and that entity. Each time you create an [[entity]] this creates a new page that can have its own notes, and allows for hierchical structure good for navigation.
- I write down bulleted lists in my daily notes as I work on different things, wrapping certain text as an [[entity]], and creating hierarchical structure that allows me to store things like versions of code for a project in a way that doesn't take up room in my notes but is still easy to find.`,
      subsections: []
    },
    {
      level: 1,
      title: 'Knowledge Architecture',
      content: `Our knowledge architecture consists of multiple layers:
1. Knowledge Acquisition Layer - Raw information input, query refinement, information extraction
2. Knowledge Organization Layer - Entity formation, relationship discovery, pattern recognition
3. Cognitive Processing Layer - Reasoning engine, inference generation, hypothesis formation
4. Knowledge Synthesis Layer - Knowledge graph, memory indexing, semantic network
5. Application Layer - Query response, insight generation, recommendation system
6. Feedback & Evolution Layer - User feedback, self-evaluation, confidence scoring`,
      subsections: []
    }
  ]
};

export default fallbackSessionContent;