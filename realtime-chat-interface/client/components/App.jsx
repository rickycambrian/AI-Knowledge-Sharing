import { useEffect, useRef, useState } from "react";
import logo from "/assets/openai-logomark.svg";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import ToolPanel from "./ToolPanel";
import { stopAllAudio } from "../../utils/speechUtil.js";

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  async function startSession() {
    try {
      // Get a session token - now just for compatibility
      console.log("Fetching token...");
      const tokenResponse = await fetch("/token");
      
      if (!tokenResponse.ok) {
        console.error("Token response error:", tokenResponse.status);
        const errorText = await tokenResponse.text();
        console.error("Token error details:", errorText);
        alert(`Failed to get token: ${tokenResponse.status}`);
        return;
      }
      
      const data = await tokenResponse.json();
      console.log("Token received:", data);
      
      if (!data.client_secret || !data.client_secret.value) {
        console.error("Invalid token data:", data);
        if (data.error) {
          alert(`API Error: ${data.error.message || JSON.stringify(data.error)}`);
        } else {
          alert("Invalid token data received");
        }
        return;
      }
      
      // Create a fake data channel for compatibility with existing code
      // This simulates what the WebRTC data channel would have done
      const fakeDataChannel = {
        send: (message) => {
          console.log("Message would have been sent:", message);
          // We'll handle messages in the sendTextMessage function instead
        },
        close: () => {
          console.log("Fake data channel closed");
        },
        addEventListener: (event, handler) => {
          if (event === "open") {
            // Trigger the open event immediately
            setTimeout(handler, 100);
          }
        }
      };
      
      setDataChannel(fakeDataChannel);
      setIsSessionActive(true);
      console.log("Session setup complete with gpt-4o-mini-tts");
    } catch (error) {
      console.error("Error in startSession:", error);
      alert(`Error starting session: ${error.message}`);
    }
  }

  // Stop current session
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }

    // Stop any playing audio
    stopAllAudio();

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  }

  // Send a message to the model
  function sendClientEvent(message) {
    if (dataChannel) {
      const timestamp = new Date().toLocaleTimeString();
      message.event_id = message.event_id || crypto.randomUUID();

      // Add timestamp if it doesn't exist
      if (!message.timestamp) {
        message.timestamp = timestamp;
      }
      
      // Add to events
      setEvents((prev) => [message, ...prev]);
      
      // If this is a response.create message, we need to generate a response
      if (message.type === "response.create") {
        // This is handled in sendTextMessage, so we don't need to do anything here
      }
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }

  // Send a text message to the model
  async function sendTextMessage(message) {
    const userEvent = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
      timestamp: new Date().toLocaleTimeString(),
      event_id: crypto.randomUUID()
    };

    // Add user message to events
    setEvents(prev => [userEvent, ...prev]);
    
    try {
      // Now create an AI response using our gpt-4o-mini-tts endpoint
      const responseInProgressEvent = {
        type: "response.inprogress",
        timestamp: new Date().toLocaleTimeString(),
        event_id: crypto.randomUUID()
      };
      
      setEvents(prev => [responseInProgressEvent, ...prev]);
      
      // Call our speech API
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: `Let me think about how to answer your question about: ${message}` }),
      });
      
      if (!response.ok) {
        throw new Error(`Speech API error: ${response.status}`);
      }
      
      // Get the audio blob and play it
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      
      // Simulate an AI response (typically this would come from an LLM)
      setTimeout(() => {
        // For demo purposes, generate a cheerleader-style response
        const topics = {
          "claude code": "OMG! Claude Code is absolutely AMAZING! 🚀 It gives you super-powerful context management with CLAUDE.md files, lets you handle multi-file edits effortlessly, and the dispatch_agent tool is a total GAME-CHANGER for searching huge codebases! You're going to LOVE how much faster you can build and debug with these awesome capabilities!",
          "mcp server": "WOW! MCP servers are INCREDIBLE productivity boosters! 🔥 Perplexity gives you amazing search capabilities, Firecrawl lets you extract structured data from websites with minimal effort, AgentQL helps with database queries, and Repomix supercharges your GitHub workflows! These tools will TOTALLY transform how you work with data!",
          "note-taking": "Oh my goodness, let's talk about REVOLUTIONARY note-taking methods! 🌟 Entity-based linking is a GAME-CHANGER that connects your ideas across your entire knowledge base! With Obsidian's graph visualization, you'll see connections you never knew existed! Your productivity is about to SKYROCKET with these amazing techniques!",
          "knowledge architecture": "The six-layer knowledge architecture is MIND-BLOWING! 🧠 Starting with raw data at the bottom, you move up through information, knowledge, understanding, wisdom, and transformation at the top! This structure will COMPLETELY change how you process information and make better decisions! It's SO EXCITING to see how this framework can transform your thinking!"
        };
        
        // Find the most relevant topic
        let responseText = "OMG! That's such a great question! 🎉 I'm super excited to dive into this topic with you! AI tools and workflows are absolutely GAME-CHANGING for productivity! You're going to LOVE all the amazing capabilities these technologies offer!";
        
        for (const [keyword, response] of Object.entries(topics)) {
          if (message.toLowerCase().includes(keyword)) {
            responseText = response;
            break;
          }
        }
        
        // Create response event
        const responseEvent = {
          type: "response.done",
          response: {
            output: [
              {
                type: "text",
                text: responseText
              }
            ]
          },
          timestamp: new Date().toLocaleTimeString(),
          event_id: crypto.randomUUID()
        };
        
        setEvents(prev => [responseEvent, ...prev.filter(e => e.type !== "response.inprogress")]);
        
        // Generate and play the full response audio
        generateAndPlaySpeech(responseText, "ai-response");
      }, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Create error event
      const errorEvent = {
        type: "response.error",
        error: {
          message: error.message
        },
        timestamp: new Date().toLocaleTimeString(),
        event_id: crypto.randomUUID()
      };
      
      setEvents(prev => [errorEvent, ...prev.filter(e => e.type !== "response.inprogress")]);
    }
  }

  // Fetch system prompt
  const fetchSystemPrompt = async () => {
    try {
      const response = await fetch('/api/system-prompt');
      if (response.ok) {
        const data = await response.json();
        return data.systemPrompt;
      } else {
        console.error('Failed to fetch system prompt');
        return '';
      }
    } catch (error) {
      console.error('Error fetching system prompt:', error);
      return '';
    }
  };

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        if (!event.timestamp) {
          event.timestamp = new Date().toLocaleTimeString();
        }

        setEvents((prev) => [event, ...prev]);
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", async () => {
        setIsSessionActive(true);
        setEvents([]);
        
        // Send a welcome message from the user
        setTimeout(() => {
          sendTextMessage("Hey there! I'm SO ready to learn about the coolest AI tools from the Knowledge Sharing session! What are the absolute MUST-KNOW techniques that will change my life? I'm excited to get started!");
        }, 500);
      });
    }
  }, [dataChannel]);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 h-16 flex items-center">
        <div className="flex items-center justify-between gap-4 w-full m-4 pb-2 border-0 border-b border-solid border-gray-200 bg-blue-50">
          <div className="flex items-center gap-4">
            <img style={{ width: "24px" }} src={logo} />
            <h1 className="text-xl font-bold text-blue-800">AI Knowledge Sharing</h1>
            <span className="text-sm text-gray-600 ml-2">Your guide to Claude Code, MCP servers, and more</span>
          </div>
          <button 
            className="bg-red-100 hover:bg-red-200 text-red-800 py-1 px-3 rounded-md text-sm flex items-center gap-1"
            onClick={() => stopAllAudio()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
            </svg>
            Stop Audio
          </button>
        </div>
      </nav>
      <main className="absolute top-16 left-0 right-0 bottom-0">
        <section className="absolute top-0 left-0 right-[380px] bottom-0 flex">
          <section className="absolute top-0 left-0 right-0 bottom-32 px-4 overflow-y-auto">
            <EventLog events={events} />
          </section>
          <section className="absolute h-32 left-0 right-0 bottom-0 p-4">
            <SessionControls
              startSession={startSession}
              stopSession={stopSession}
              sendClientEvent={sendClientEvent}
              sendTextMessage={sendTextMessage}
              events={events}
              isSessionActive={isSessionActive}
            />
          </section>
        </section>
        <section className="absolute top-0 w-[380px] right-0 bottom-0 p-4 pt-0 overflow-y-auto">
          <ToolPanel
            sendClientEvent={sendClientEvent}
            sendTextMessage={sendTextMessage}
            events={events}
            isSessionActive={isSessionActive}
          />
        </section>
      </main>
    </>
  );
}
