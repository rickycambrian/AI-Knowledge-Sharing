import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import OpenAI from 'openai';

const app = express();
const port = process.env.PORT || 3001; // Changed to 3001 to avoid conflicts
const apiKey = process.env.OPENAI_API_KEY;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
});

// Read the raw content of the session file
const SESSION_FILE_PATH = '/Users/riccardoesclapon/Documents/github/AI-Knowledge-Sharing/session-one/session-one.Rmd';
let rawSessionContent = '';
try {
  rawSessionContent = fs.readFileSync(SESSION_FILE_PATH, 'utf-8');
  console.log(`Successfully read content from: ${SESSION_FILE_PATH}`);
  console.log(`Content length: ${rawSessionContent.length} characters`);
} catch (error) {
  console.error(`Error reading content from ${SESSION_FILE_PATH}:`, error);
}

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);
app.use(express.json());

// API route for token generation - using GPT-4o-mini-tts model
app.get("/token", async (req, res) => {
  try {
    // Since we're not using the Realtime API anymore, we'll create a simple token for the client
    // This token will be used to authenticate with our own API endpoint
    
    // Simple temporary token generation
    const tokenData = {
      client_secret: {
        value: `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      },
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      status: "ready"
    };
    
    // Log the token info
    console.log("Generated token:", JSON.stringify(tokenData, null, 2));
    
    res.json(tokenData);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// API route for generating speech using gpt-4o-mini-tts
app.post("/api/speech", async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text parameter is required" });
    }
    
    // Voice styling instructions for cheerleader personality
    const instructions = `Personality/affect: a high-energy cheerleader helping with administrative tasks 

Voice: Enthusiastic, and bubbly, with an uplifting and motivational quality.

Tone: Encouraging and playful, making even simple tasks feel exciting and fun.

Dialect: Casual and upbeat, using informal phrasing and pep talk-style expressions.

Pronunciation: Crisp and lively, with exaggerated emphasis on positive words to keep the energy high.

Features: Uses motivational phrases, cheerful exclamations, and an energetic rhythm to create a sense of excitement and engagement.`;
    
    console.log("Generating speech for text:", text);
    
    const audioResponse = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
      instructions: instructions,
    });
    
    // Convert to buffer
    const buffer = Buffer.from(await audioResponse.arrayBuffer());
    
    // Send audio file as response
    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
    
  } catch (error) {
    console.error("Speech generation error:", error);
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

// API route to get system prompt
app.get("/api/system-prompt", (req, res) => {
  // Extract key topics without sending the entire content
  const mainTopics = [
    "Claude Code tips and best practices",
    "MCP Servers including Perplexity, Firecrawl, AgentQL, and Repomix",
    "Note-taking methods and knowledge organization",
    "Knowledge architecture with six layers for effective information processing",
    "Context management challenges and solutions",
    "Workflow adaptations for AI integration"
  ];
  
  const systemPrompt = `You are an AI Knowledge Sharing Assistant specializing in AI tools and workflows.

You have knowledge about these topics from the session:
${mainTopics.map(topic => `- ${topic}`).join('\n')}

IMPORTANT INSTRUCTIONS:
1. Answer questions about Claude Code, MCP servers, note-taking methods, and knowledge architecture.
2. Be concise but thorough in your answers.
3. This is an evolving knowledge system that will progressively learn from future sessions.
4. If you don't know an answer, suggest related topics that you do know about.

Main topics to focus on:
- Claude Code: tips for using, context management, CLAUDE.md configuration
- MCP Servers: Perplexity, Firecrawl, AgentQL, Repomix setup and benefits
- Note-taking: Entity-based linking, obsidian format, organization strategies
- Knowledge Architecture: Six-layer model for processing information`;

  res.json({ systemPrompt });
});

// API route for topics
app.get("/api/topics", (req, res) => {
  // List of available topics for the knowledge sharing session
  const topics = [
    "Claude Code basics and advanced features",
    "Context management in Claude Code",
    "CLAUDE.md file configuration",
    "Perplexity MCP server setup",
    "Firecrawl MCP server features",
    "AgentQL MCP integration",
    "Repomix MCP capabilities",
    "Entity-based note-taking",
    "Knowledge graphs with Obsidian",
    "Six layers of knowledge architecture",
    "Information processing models",
    "Workflow adaptations for AI",
    "Context window optimization",
    "AI prompt engineering",
    "Knowledge retrieval strategies"
  ];
  
  res.json({ topics });
});

// Render the React client
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("./client/index.html", "utf-8"),
    );
    const { render } = await vite.ssrLoadModule("./client/entry-server.jsx");
    const appHtml = await render(url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml?.html);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});