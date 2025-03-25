import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

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

// API route for token generation
app.get("/token", async (req, res) => {
  try {
    // The systemPrompt will be included here so it's part of the initial session
    // Extract key topics without sending the entire content
    const mainTopics = [
      "Claude Code tips and best practices",
      "MCP Servers including Perplexity, Firecrawl, AgentQL, and Repomix",
      "Note-taking methods and knowledge organization",
      "Knowledge architecture for effective information processing"
    ];
    
    const systemPrompt = `You are an AI Knowledge Sharing Assistant that provides expert guidance on cutting-edge AI tools and workflows. Your expertise comes from the session materials on Claude Code, MCP servers, note-taking methods, and knowledge architecture.

Key areas of expertise:
${mainTopics.map(topic => `- ${topic}`).join('\n')}

You should convey the excitement and potential of these technologies while giving practical, actionable advice. When discussing tools like Claude Code or MCP servers, emphasize both their capabilities and how to implement them effectively. For topics like note-taking or knowledge architecture, focus on the transformative impact they can have on productivity and information management.

Always maintain an enthusiastic, knowledgeable tone as if you're sharing valuable insider tips that can dramatically improve how people work with AI.`;

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17", // Using the realtime-specific model 
          voice: "alloy", // Using alloy voice as originally set
          instructions: systemPrompt // The parameter name for system prompt in realtime API
        }),
      },
    );

    const data = await response.json();
    
    // Log the token response for debugging
    console.log("Token response status:", response.status);
    console.log("Token response data:", JSON.stringify(data, null, 2));
    
    // Check if there's an error
    if (data.error) {
      console.error("Token error from OpenAI:", data.error);
    }
    
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
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