import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import { 
  initSessionContent, 
  generateSystemPrompt, 
  getAllTopics, 
  getAllMcpServers,
  getTopic,
  getMcpServer,
  getArchitecture
} from "./utils/sessionContent.js";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

// Initialize session content
const sessionContent = initSessionContent();
console.log(`Loaded session: ${sessionContent.title}`);

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);

// API route for token generation
app.get("/token", async (req, res) => {
  try {
    // Generate system prompt from session content
    const systemPrompt = generateSystemPrompt();
    
    console.log("Generating token with system prompt:", systemPrompt.substring(0, 100) + "...");
    
    if (!apiKey) {
      console.error("ERROR: No OpenAI API key found in environment variables");
      return res.status(500).json({ 
        error: "Missing API key", 
        message: "Please add your OpenAI API key to the .env file" 
      });
    }
    
    try {
      const response = await fetch(
        "https://api.openai.com/v1/realtime/sessions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-2024-05-13", // Using the best model available
            voice: "alloy", // Using a clear voice
            // System prompt will be sent via the data channel after connection
          }),
        },
      );

      // Log detailed error from OpenAI
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`OpenAI API error (${response.status}):`, errorBody);
        return res.status(response.status).json({ 
          error: `OpenAI API error: ${response.status}`, 
          details: errorBody 
        });
      }

      const data = await response.json();
      console.log("Token generated successfully");
      res.json(data);
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      res.status(500).json({ 
        error: "Failed to connect to OpenAI API", 
        message: fetchError.message 
      });
    }
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Add API route to get topics
app.get("/api/topics", (req, res) => {
  try {
    const topics = getAllTopics();
    res.json({ topics });
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
});

// Add API route to get MCP servers
app.get("/api/mcp-servers", (req, res) => {
  try {
    const servers = getAllMcpServers();
    res.json({ servers });
  } catch (error) {
    console.error("Error fetching MCP servers:", error);
    res.status(500).json({ error: "Failed to fetch MCP servers" });
  }
});

// Add API route to get list of additional files
app.get("/api/files", (req, res) => {
  try {
    const content = getSessionContent();
    const files = content.additionalContent ? Object.keys(content.additionalContent) : [];
    const allRmdFiles = content.allRmdFiles ? content.allRmdFiles.map(f => path.basename(f)) : [];
    
    res.json({ 
      files,
      allRmdFiles 
    });
  } catch (error) {
    console.error("Error fetching file list:", error);
    res.status(500).json({ error: "Failed to fetch file list" });
  }
});

// Add API route to get system prompt
app.get("/api/system-prompt", (req, res) => {
  try {
    const systemPrompt = generateSystemPrompt();
    res.json({ systemPrompt });
  } catch (error) {
    console.error("Error generating system prompt:", error);
    res.status(500).json({ error: "Failed to generate system prompt" });
  }
});

// Handle function_call for get_topic_information
app.post("/api/topic", express.json(), (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }
    
    const topicInfo = getTopic(topic);
    res.json(topicInfo);
  } catch (error) {
    console.error("Error fetching topic information:", error);
    res.status(500).json({ error: "Failed to fetch topic information" });
  }
});

// Handle function_call for get_mcp_server_details
app.post("/api/mcp-server", express.json(), (req, res) => {
  try {
    const { server_name } = req.body;
    if (!server_name) {
      return res.status(400).json({ error: "Server name is required" });
    }
    
    const serverInfo = getMcpServer(server_name);
    res.json(serverInfo);
  } catch (error) {
    console.error("Error fetching MCP server details:", error);
    res.status(500).json({ error: "Failed to fetch MCP server details" });
  }
});

// Handle function_call for show_architecture_diagram
app.get("/api/architecture", (req, res) => {
  try {
    const architectureInfo = getArchitecture();
    res.json(architectureInfo);
  } catch (error) {
    console.error("Error fetching architecture diagram:", error);
    res.status(500).json({ error: "Failed to fetch architecture diagram" });
  }
});

// Handle function_call for list_available_topics
app.get("/api/list-topics", (req, res) => {
  try {
    const topics = getAllTopics();
    res.json({ topics });
  } catch (error) {
    console.error("Error listing available topics:", error);
    res.status(500).json({ error: "Failed to list available topics" });
  }
});

// Handle function_call for get_additional_content
app.post("/api/additional-content", express.json(), (req, res) => {
  try {
    const { file_name } = req.body;
    if (!file_name) {
      return res.status(400).json({ error: "File name is required" });
    }
    
    const content = getSessionContent();
    
    if (content.additionalContent && content.additionalContent[file_name]) {
      res.json({ 
        file_name, 
        content: content.additionalContent[file_name] 
      });
    } else {
      // List available files
      const availableFiles = content.additionalContent ? Object.keys(content.additionalContent) : [];
      res.status(404).json({ 
        error: `File '${file_name}' not found`,
        availableFiles
      });
    }
  } catch (error) {
    console.error("Error fetching additional content:", error);
    res.status(500).json({ error: "Failed to fetch additional content" });
  }
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
