import 'dotenv/config';
import { initSessionContent, generateSystemPrompt } from './utils/sessionContent.js';

// Initialize the session content
try {
  console.log("Initializing session content...");
  const sessionContent = initSessionContent();
  console.log(`Loaded session: ${sessionContent.title}`);
  console.log(`Topics found: ${sessionContent.topics.length}`);
  
  // Generate the system prompt
  const systemPrompt = generateSystemPrompt();
  console.log("\n\nSystem Prompt:");
  console.log(systemPrompt);
  
  // Test OpenAI token generation
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("ERROR: No OpenAI API key found in .env file");
    process.exit(1);
  }
  
  console.log("\n\nTesting OpenAI token generation...");
  fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-2024-05-13", // Using the best model available
      voice: "alloy", // Using a clear voice
      // Note: The OpenAI API doesn't accept system_prompt as a parameter
      // We'll need to set this via another method after connection
    }),
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        console.error(`OpenAI API error (${response.status}):`, text);
        throw new Error(`OpenAI API error: ${response.status}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log("Token generated successfully!");
    console.log("Token data:", JSON.stringify(data, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error("Error:", error);
    process.exit(1);
  });
  
} catch (error) {
  console.error("Fatal error:", error);
  process.exit(1);
}