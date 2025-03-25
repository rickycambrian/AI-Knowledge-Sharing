import express from 'express';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Create Express app
const app = express();
const port = process.env.PORT || 3001; // Use a different port to avoid conflicts

// Read the session content
const SESSION_FILE_PATH = '/Users/riccardoesclapon/Documents/github/AI-Knowledge-Sharing/session-one/session-one.Rmd';
let rawSessionContent = '';
try {
  rawSessionContent = fs.readFileSync(SESSION_FILE_PATH, 'utf-8');
  console.log(`Successfully read content from: ${SESSION_FILE_PATH}`);
  console.log(`Content length: ${rawSessionContent.length} characters`);
} catch (error) {
  console.error(`Error reading content from ${SESSION_FILE_PATH}:`, error);
  rawSessionContent = 'Error loading content';
}

// Serve static files from a 'public' directory
app.use(express.static('public'));
app.use(express.json());

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Create a simple HTML interface
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Knowledge Sharing Interface</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      color: #333;
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    #chat-container {
      display: flex;
      flex-direction: column;
      height: 70vh;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      background-color: #f9f9f9;
    }
    .message {
      margin-bottom: 10px;
      padding: 8px 12px;
      border-radius: 5px;
      max-width: 80%;
    }
    .user-message {
      background-color: #e1f5fe;
      align-self: flex-end;
      margin-left: auto;
    }
    .ai-message {
      background-color: #f0f0f0;
    }
    #input-area {
      display: flex;
      padding: 10px;
      border-top: 1px solid #ddd;
    }
    #message-input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    #send-button {
      margin-left: 10px;
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    #send-button:hover {
      background-color: #45a049;
    }
    .topic-list {
      margin-bottom: 20px;
    }
    .topic-list button {
      margin: 5px;
      padding: 5px 10px;
      background-color: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }
    .topic-list button:hover {
      background-color: #e0e0e0;
    }
  </style>
</head>
<body>
  <h1>AI Knowledge Sharing Assistant</h1>
  
  <div class="topic-list">
    <p>Quick topics:</p>
    <button onclick="askAbout('Claude Code')">Claude Code</button>
    <button onclick="askAbout('MCP Servers')">MCP Servers</button>
    <button onclick="askAbout('Note Taking')">Note Taking</button>
    <button onclick="askAbout('Knowledge Architecture')">Knowledge Architecture</button>
  </div>

  <div id="chat-container">
    <div id="messages"></div>
    <div id="input-area">
      <input type="text" id="message-input" placeholder="Ask a question about AI Knowledge Sharing...">
      <button id="send-button">Send</button>
    </div>
  </div>

  <script>
    const messagesContainer = document.getElementById('messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // Add a welcome message
    addMessage('Welcome to the AI Knowledge Sharing Assistant! Ask me anything about Claude Code, MCP Servers, Note Taking methods, or the Knowledge Architecture discussed in the session.', 'ai');

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(event) {
      if (event.key === 'Enter') {
        sendMessage();
      }
    });

    function askAbout(topic) {
      messageInput.value = "Tell me about " + topic;
      sendMessage();
    }

    function sendMessage() {
      const message = messageInput.value.trim();
      if (message) {
        addMessage(message, 'user');
        messageInput.value = '';
        
        // Send the message to the server
        fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        })
        .then(response => response.json())
        .then(data => {
          addMessage(data.response, 'ai');
        })
        .catch(error => {
          console.error('Error:', error);
          addMessage('Sorry, there was an error processing your request.', 'ai');
        });
      }
    }

    function addMessage(text, sender) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message');
      messageElement.classList.add(sender + '-message');
      messageElement.textContent = text;
      messagesContainer.appendChild(messageElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  </script>
</body>
</html>
`;

// Write the HTML file
fs.writeFileSync('public/index.html', htmlContent);

// Define topics with their content from the session
const topics = {
  'Claude Code': {
    content: `Claude Code is one of the most balanced tools for good results, thinking, and effective tool calling. Key tips include:
    
1. Reset Context: Claude Code has finite context, which is beneficial as you're aware of what the LLM knows.
   Use README.md, CLAUDE.md, and optional ai_docs for context.

2. CLAUDE.md configuration: Initialize with /init or create manually for project-specific instructions.

3. Avoid failure modes: Sonnet 3.7 tends to create mock data; add strict rules to CLAUDE.md.

4. Reset context before it runs out: Use /compact before getting below 20%.

5. Division of labor: Think about what you should do vs. what AI workflows should do.

6. Try to have fun: Explore interesting aspects of your interests.`
  },
  'MCP Servers': {
    content: `MCP servers extend LLM capabilities and are set up differently depending on your chat interface. Key servers include:

1. Perplexity: Discovers context newer than the LLM's training cutoff. 
   Install with: claude mcp add perplexity-ask npx -- -y @modelcontextprotocol/server-perplexity-ask -e PERPLEXITY_API_KEY=YOUR_KEY

2. Firecrawl: Gets website text content.
   Install with: claude mcp add mcp-server-firecrawl npx -- -y firecrawl-mcp

3. AgentQL: Advanced web scraping that extracts data even as websites change.
   Install with: claude mcp add agentql npx -- -y agentql-mcp -e AGENTQL_API_KEY=YOUR_KEY

4. Repomix: Navigates GitHub repositories with intelligent token management.
   Install with: claude mcp add repomix npx -- -y repomix --mcp

You can test MCP tools at https://mcp.so/ or https://glama.ai before installing.`
  },
  'Note Taking': {
    content: `Effective note-taking is crucial for knowledge management. Key recommendations:

1. Use an Obsidian-compatible format with entity linking ([[entity]]).

2. Create hierarchical structure and connections between notes.

3. Daily notes: Write bulleted lists, linking to entities with [[project]] syntax.

4. Search capabilities: Filter by entity, text content, or date range.

5. LLM integration: Use AI to help find specific information.

Future bet: The Obsidian format of entity-linked pages will become a standard interface for knowledge.

For organizations:
- Capture important meetings for perfect recall
- Save and centralize meeting transcripts
- Use integrations (like Zapier) to automate connections
- Make knowledge available via LLM interfaces`
  },
  'Knowledge Architecture': {
    content: `The proposed knowledge architecture has six layers:

1. Knowledge Acquisition Layer: Raw input, query refinement, information extraction, and structural formalization.

2. Knowledge Organization Layer: Entity formation, relationship discovery, temporal contextualization, and pattern recognition.

3. Cognitive Processing Layer: Reasoning engine, inference generation, hypothesis formation, and fact validation.

4. Knowledge Synthesis Layer: Knowledge graph, memory indexing, semantic network, and conceptual mapping.

5. Application Layer: Query response, insight generation, recommendation system, and explanatory interface.

6. Feedback & Evolution Layer: User feedback, self-evaluation, confidence scoring, and knowledge refinement.

This architecture supports a system that progressively learns and improves over time.`
  }
};

// Process a user message
function processMessage(message) {
  // Simple keyword matching for topics
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your AI Knowledge Sharing Assistant. How can I help you today?";
  }
  
  for (const [topic, info] of Object.entries(topics)) {
    if (lowerMessage.includes(topic.toLowerCase())) {
      return info.content;
    }
  }
  
  // Check for MCP server mentions
  const mcpServers = ['perplexity', 'firecrawl', 'agentql', 'repomix'];
  for (const server of mcpServers) {
    if (lowerMessage.includes(server)) {
      return topics['MCP Servers'].content;
    }
  }
  
  // Check for note-taking related terms
  const noteTerms = ['notes', 'note taking', 'obsidian', 'reflect'];
  for (const term of noteTerms) {
    if (lowerMessage.includes(term)) {
      return topics['Note Taking'].content;
    }
  }
  
  // Default response
  return "I can provide information about Claude Code, MCP Servers, Note Taking methods, and Knowledge Architecture. Please ask me about any of these topics!";
}

// API route for chat messages
app.post('/api/chat', (req, res) => {
  const message = req.body.message;
  const response = processMessage(message);
  res.json({ response });
});

// Start the server
app.listen(port, () => {
  console.log(`Simple Knowledge Sharing Interface running at http://localhost:${port}`);
});