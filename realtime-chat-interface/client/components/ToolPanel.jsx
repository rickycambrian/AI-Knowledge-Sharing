import { useEffect, useState } from "react";

// Define our custom tools for the AI Knowledge Sharing session
const knowledgeTools = [
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
  },
  {
    type: "function",
    name: "list_available_topics",
    description: "List all available topics in the AI Knowledge Sharing session",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    type: "function",
    name: "get_additional_content",
    description: "Get content from additional session files",
    parameters: {
      type: "object",
      properties: {
        file_name: {
          type: "string",
          description: "The name of the file to get content from (without extension)",
        }
      },
      required: ["file_name"]
    }
  }
];

const sessionUpdate = {
  type: "session.update",
  session: {
    tools: knowledgeTools,
    tool_choice: "auto",
  },
};

// Component to display topic information
function TopicInformation({ topic, content }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">{topic}</h3>
      <div className="bg-white rounded-md p-3 border border-gray-200 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
      </div>
    </div>
  );
}

// Component to display MCP server details
function McpServerDetails({ serverName, installationCode, description }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">{serverName} MCP Server</h3>
      <div className="bg-white rounded-md p-3 border border-gray-200 max-h-40 overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans text-sm">{description}</pre>
      </div>
      {installationCode && (
        <div className="mt-2">
          <h4 className="text-md font-medium">Installation:</h4>
          <pre className="bg-gray-800 text-green-300 p-3 rounded-md text-sm overflow-x-auto">
            {installationCode}
          </pre>
        </div>
      )}
    </div>
  );
}

// Component to display architecture diagram
function ArchitectureDiagram({ title, diagramCode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="bg-gray-800 text-white rounded-md p-3 border border-gray-200 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm">{diagramCode}</pre>
      </div>
      <p className="text-sm text-gray-600">
        Note: This is a text representation of the diagram. A visual version would require rendering the mermaid diagram.
      </p>
    </div>
  );
}

// Component to display list of topics
function TopicsList({ topics }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Available Topics</h3>
      <ul className="bg-white rounded-md p-3 border border-gray-200 max-h-96 overflow-y-auto">
        {topics.map((topic, index) => (
          <li key={index} className="py-1 border-b border-gray-100 last:border-0">
            {topic}
          </li>
        ))}
      </ul>
      <p className="text-sm text-gray-600">
        Ask about any of these topics to learn more about them.
      </p>
    </div>
  );
}

// Component to display additional file content
function AdditionalContent({ fileName, content }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold">Content from {fileName}</h3>
      <div className="bg-white rounded-md p-3 border border-gray-200 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap font-sans text-sm">{content}</pre>
      </div>
    </div>
  );
}

// Process function call output and render the appropriate component
function FunctionCallOutput({ functionCallOutput }) {
  const { name, arguments: args } = functionCallOutput;
  const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
  
  switch (name) {
    case 'get_topic_information':
      return (
        <TopicInformation 
          topic={parsedArgs.topic} 
          content={parsedArgs.content || "No detailed content available for this topic."} 
        />
      );
    
    case 'get_mcp_server_details':
      return (
        <McpServerDetails 
          serverName={parsedArgs.server_name || parsedArgs.name}
          installationCode={parsedArgs.installationCode} 
          description={parsedArgs.description || "No details available for this server."} 
        />
      );
    
    case 'show_architecture_diagram':
      return (
        <ArchitectureDiagram 
          title={parsedArgs.title || "Knowledge Architecture"} 
          diagramCode={parsedArgs.diagramCode || "No diagram code available."} 
        />
      );
    
    case 'list_available_topics':
      return (
        <TopicsList 
          topics={parsedArgs.topics || []} 
        />
      );
      
    case 'get_additional_content':
      return (
        <AdditionalContent 
          fileName={parsedArgs.file_name} 
          content={parsedArgs.content || "No content available for this file."} 
        />
      );
    
    default:
      return (
        <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
          <p className="text-yellow-800">Unknown function: {name}</p>
          <pre className="text-xs bg-yellow-100 rounded-md p-2 mt-2 overflow-x-auto">
            {JSON.stringify(functionCallOutput, null, 2)}
          </pre>
        </div>
      );
  }
}

export default function ToolPanel({
  isSessionActive,
  sendClientEvent,
  events,
}) {
  const [functionAdded, setFunctionAdded] = useState(false);
  const [functionCallOutput, setFunctionCallOutput] = useState(null);
  const [availableTopics, setAvailableTopics] = useState([]);
  
  // Fetch available topics on component mount
  useEffect(() => {
    if (isSessionActive) {
      fetch('/api/topics')
        .then(response => response.json())
        .then(data => {
          setAvailableTopics(data.topics || []);
        })
        .catch(error => {
          console.error('Error fetching topics:', error);
        });
    }
  }, [isSessionActive]);

  // Register tools when session is created
  useEffect(() => {
    if (!events || events.length === 0) return;

    const firstEvent = events[events.length - 1];
    if (!functionAdded && firstEvent.type === "session.created") {
      sendClientEvent(sessionUpdate);
      setFunctionAdded(true);
    }

    // Handle function call outputs
    const mostRecentEvent = events[0];
    if (
      mostRecentEvent.type === "response.done" &&
      mostRecentEvent.response.output
    ) {
      mostRecentEvent.response.output.forEach((output) => {
        if (output.type === "function_call") {
          setFunctionCallOutput(output);
          
          // Acknowledge receipt of function output
          setTimeout(() => {
            sendClientEvent({
              type: "response.create",
              response: {
                instructions: `
                Acknowledge that you've processed the information. Ask if the user would like more details
                or information about another topic.
              `,
              },
            });
          }, 500);
        }
      });
    }
  }, [events, functionAdded, sendClientEvent]);

  // Reset state when session becomes inactive
  useEffect(() => {
    if (!isSessionActive) {
      setFunctionAdded(false);
      setFunctionCallOutput(null);
    }
  }, [isSessionActive]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4 overflow-y-auto">
        <h2 className="text-lg font-bold text-blue-700">AI Knowledge Sharing Tools</h2>
        {isSessionActive ? (
          <>
            {functionCallOutput ? (
              <FunctionCallOutput functionCallOutput={functionCallOutput} />
            ) : (
              <div className="mt-4">
                <p className="mb-3 font-bold">Quick Topic Access:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-3 rounded-md text-sm"
                    onClick={() => {
                      sendClientEvent({
                        type: "conversation.item.create",
                        item: {
                          type: "message",
                          role: "user",
                          content: [{ type: "input_text", text: "What are the best practices for using Claude Code?" }],
                        },
                      });
                      sendClientEvent({ type: "response.create" });
                    }}
                  >
                    Claude Code Tips
                  </button>
                  <button 
                    className="bg-green-100 hover:bg-green-200 text-green-800 py-2 px-3 rounded-md text-sm"
                    onClick={() => {
                      sendClientEvent({
                        type: "conversation.item.create",
                        item: {
                          type: "message",
                          role: "user",
                          content: [{ type: "input_text", text: "Tell me about the different MCP servers and how to use them" }],
                        },
                      });
                      sendClientEvent({ type: "response.create" });
                    }}
                  >
                    MCP Servers
                  </button>
                  <button 
                    className="bg-purple-100 hover:bg-purple-200 text-purple-800 py-2 px-3 rounded-md text-sm"
                    onClick={() => {
                      sendClientEvent({
                        type: "conversation.item.create",
                        item: {
                          type: "message",
                          role: "user",
                          content: [{ type: "input_text", text: "How can I improve my note-taking with entity linking and knowledge graphs?" }],
                        },
                      });
                      sendClientEvent({ type: "response.create" });
                    }}
                  >
                    Note Taking Methods
                  </button>
                  <button 
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 py-2 px-3 rounded-md text-sm"
                    onClick={() => {
                      sendClientEvent({
                        type: "conversation.item.create",
                        item: {
                          type: "message",
                          role: "user",
                          content: [{ type: "input_text", text: "What are the six layers of the knowledge architecture and how do they work together?" }],
                        },
                      });
                      sendClientEvent({ type: "response.create" });
                    }}
                  >
                    Knowledge Architecture
                  </button>
                </div>
                
                <p className="mt-6 mb-2 font-bold">Available Topics:</p>
                <div className="bg-white rounded-md p-3 border border-gray-200 max-h-64 overflow-y-auto">
                  <ul className="list-disc pl-5 text-sm">
                    {availableTopics.slice(0, 7).map((topic, index) => (
                      <li key={index} className="py-1">{topic}</li>
                    ))}
                    {availableTopics.length > 7 && (
                      <li className="py-1 text-gray-500">
                        ...and {availableTopics.length - 7} more topics
                      </li>
                    )}
                  </ul>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Try asking: "Tell me about Claude Code tips" or "How do I set up Perplexity MCP?"
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="mt-4">Start the session to explore AI Knowledge Sharing topics...</p>
        )}
      </div>
    </section>
  );
}
