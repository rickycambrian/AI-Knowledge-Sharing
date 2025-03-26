import { ArrowUp, ArrowDown, Volume2, MessageSquare } from "react-feather";
import { useState } from "react";
import { generateAndPlaySpeech } from "../../utils/speechUtil.js";

function Event({ event, timestamp }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isClient = event.event_id && !event.event_id.startsWith("event_");

  // Check if the event is an assistant response with text
  const isTextResponse = event.type === "response.done" && 
    event.response?.output?.some(item => item.type === "text" && item.text);

  // Extract text from the response if present
  const getResponseText = () => {
    if (!isTextResponse) return null;
    
    // Combine all text segments into a single string
    return event.response.output
      .filter(item => item.type === "text" && item.text)
      .map(item => item.text)
      .join(" ");
  };

  // Function to speak the response text
  const speakResponse = async () => {
    const text = getResponseText();
    if (!text) return;
    
    setIsSpeaking(true);
    try {
      await generateAndPlaySpeech(text, event.event_id);
    } catch (error) {
      console.error("Error speaking response:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 rounded-md bg-gray-50">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isClient ? (
            <ArrowDown className="text-blue-400" />
          ) : (
            <ArrowUp className="text-green-400" />
          )}
          <div className="text-sm text-gray-500">
            {isClient ? "client:" : "server:"}
            &nbsp;{event.type} | {timestamp}
          </div>
        </div>
        
        {/* Speak button for text responses */}
        {isTextResponse && (
          <button 
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
              isSpeaking ? "bg-pink-200 text-pink-800" : "bg-gray-200 text-gray-700 hover:bg-pink-100"
            }`}
            onClick={speakResponse}
            disabled={isSpeaking}
          >
            <Volume2 size={14} />
            {isSpeaking ? "Speaking..." : "Speak with Cheerleader Voice"}
          </button>
        )}
      </div>
      
      {/* Display text content directly if it's a text response */}
      {isTextResponse && (
        <div className="bg-white border border-gray-200 p-3 rounded-md text-sm">
          {getResponseText()}
        </div>
      )}
      
      {/* JSON view (expanded) */}
      <div
        className={`text-gray-500 bg-gray-200 p-2 rounded-md overflow-x-auto ${
          isExpanded ? "block" : "hidden"
        }`}
      >
        <pre className="text-xs">{JSON.stringify(event, null, 2)}</pre>
      </div>
    </div>
  );
}

export default function EventLog({ events }) {
  const eventsToDisplay = [];
  let deltaEvents = {};

  events.forEach((event) => {
    if (event.type.endsWith("delta")) {
      if (deltaEvents[event.type]) {
        // for now just log a single event per render pass
        return;
      } else {
        deltaEvents[event.type] = event;
      }
    }

    eventsToDisplay.push(
      <Event key={event.event_id} event={event} timestamp={event.timestamp} />,
    );
  });

  return (
    <div className="flex flex-col gap-2 overflow-x-auto">
      {events.length === 0 ? (
        <div className="text-gray-500">Awaiting events...</div>
      ) : (
        eventsToDisplay
      )}
    </div>
  );
}
