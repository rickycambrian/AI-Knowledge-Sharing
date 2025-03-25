import path from 'path';
import fs from 'fs';
import { parseSessionContent, getTopicInformation, getMcpServerDetails, getArchitectureDiagram } from './sessionParser.js';
import { fallbackSessionContent } from './fallbackSessionContent.js';

// Use the exact path specified for session-one.Rmd
const SESSION_FILE_PATH = '/Users/riccardoesclapon/Documents/github/AI-Knowledge-Sharing/session-one/session-one.Rmd';

// Read the raw content of the file
let rawSessionContent = '';
try {
  rawSessionContent = fs.readFileSync(SESSION_FILE_PATH, 'utf-8');
  console.log(`Successfully read raw content from: ${SESSION_FILE_PATH}`);
  console.log(`Content length: ${rawSessionContent.length} characters`);
} catch (error) {
  console.error(`Error reading raw content from ${SESSION_FILE_PATH}:`, error);
}

// Parse the session content once at startup
let parsedSessionContent = null;

/**
 * Initialize the session content
 * @returns {Object} The session content
 */
export function initSessionContent() {
  if (!parsedSessionContent) {
    try {
      // Check if file exists
      if (!fs.existsSync(SESSION_FILE_PATH)) {
        throw new Error(`File not found at path: ${SESSION_FILE_PATH}`);
      }
      
      // We're already reading the raw content at the top of the file
      if (!rawSessionContent || rawSessionContent.trim().length === 0) {
        throw new Error('File exists but is empty or unreadable');
      }
      
      // Create a simple structure with the raw content
      parsedSessionContent = {
        title: 'AI Knowledge Sharing Session',
        date: 'March 25, 2025',
        topics: ['Claude Code', 'MCP Servers', 'Note Taking', 'Context Management'],
        mcpServers: ['Perplexity', 'Firecrawl', 'AgentQL', 'Repomix'],
        content: rawSessionContent,
      };
      
      console.log('Session content loaded successfully');
      
    } catch (error) {
      console.error('CRITICAL ERROR loading session content:', error);
      throw new Error('Cannot continue without the required session file');
    }
  }
  return parsedSessionContent;
}

/**
 * Get the parsed session content
 * @returns {Object} The parsed session content
 */
export function getSessionContent() {
  if (!parsedSessionContent) {
    return initSessionContent();
  }
  return parsedSessionContent;
}

/**
 * Get information about a specific topic
 * @param {string} topic The topic to search for
 * @returns {Object} Information about the topic
 */
export function getTopic(topic) {
  // Since we're using the raw content, we'll return a simplified response
  return {
    topic,
    content: `Information about "${topic}" can be found in the session content.`
  };
}

/**
 * Get a list of all available topics
 * @returns {Array} List of topics
 */
export function getAllTopics() {
  const content = getSessionContent();
  return content.topics;
}

/**
 * Get details about a specific MCP server
 * @param {string} serverName The name of the MCP server
 * @returns {Object} Information about the MCP server
 */
export function getMcpServer(serverName) {
  // Since we're using the raw content, we'll return a simplified response
  return {
    name: serverName,
    description: `Information about "${serverName}" MCP server can be found in the session content.`
  };
}

/**
 * Get a list of all available MCP servers
 * @returns {Array} List of MCP servers
 */
export function getAllMcpServers() {
  const content = getSessionContent();
  return content.mcpServers;
}

/**
 * Get the architecture diagram
 * @returns {Object} Information about the architecture diagram
 */
export function getArchitecture() {
  // Since we're using the raw content, we'll return a simplified response
  return {
    title: "Knowledge Architecture",
    description: "Architecture information can be found in the session content."
  };
}

/**
 * Generate a system prompt with session context
 * @returns {string} System prompt with session context
 */
export function generateSystemPrompt() {
  // Use the raw content directly
  const systemPrompt = `You are an AI Knowledge Sharing Assistant.

Below is the full content of a session on AI Knowledge Sharing:

${rawSessionContent}

IMPORTANT INSTRUCTIONS:
1. You have access to the entire session content above. Use it as your primary knowledge source.
2. This is an evolving knowledge system that will progressively learn more information from further sessions.
3. You are expected to provide a unified interface where users can ask questions about any content from the session.
4. Be concise but thorough in your answers, citing specific sections when relevant.
5. If you don't know an answer or it's not covered in the session content, say so and suggest related topics that are covered.
6. You have tools to provide detailed information about specific topics, MCP servers, and more.

You should maintain a knowledge graph memory of important concepts and their relationships as you learn through researching and tool use.
`;

  return systemPrompt;
}

export default {
  initSessionContent,
  getSessionContent,
  getTopic,
  getAllTopics,
  getMcpServer,
  getAllMcpServers,
  getArchitecture,
  generateSystemPrompt
};