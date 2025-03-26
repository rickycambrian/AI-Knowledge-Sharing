import { useState } from "react";
import { CloudLightning, CloudOff, MessageSquare, Volume2 } from "react-feather";
import Button from "./Button";
import { generateAndPlaySpeech } from "../../utils/speechUtil.js";

function SessionStopped({ startSession }) {
  const [isActivating, setIsActivating] = useState(false);

  function handleStartSession() {
    if (isActivating) return;

    setIsActivating(true);
    startSession();
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <Button
        onClick={handleStartSession}
        className={isActivating ? "bg-gray-600" : "bg-blue-600"}
        icon={<CloudLightning height={16} />}
      >
        {isActivating ? "Starting knowledge assistant..." : "Start AI Knowledge Assistant"}
      </Button>
    </div>
  );
}

function SessionActive({ stopSession, sendTextMessage }) {
  const [message, setMessage] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  function handleSendClientEvent() {
    sendTextMessage(message);
    setMessage("");
  }
  
  // Function to speak with cheerleader voice
  async function speakWithCheerleaderVoice() {
    if (isSpeaking || !message.trim()) return;
    
    const cheerleaderIntro = `OMG! That's a GREAT question about ${message.length > 30 ? message.substring(0, 30) + '...' : message}! Let me get you the ABSOLUTE BEST info on this! You're going to LOVE what I have to share! Let's DO this! 🎉`;
    
    setIsSpeaking(true);
    try {
      await generateAndPlaySpeech(cheerleaderIntro, "question-intro");
    } catch (error) {
      console.error("Error with cheerleader voice:", error);
    } finally {
      setIsSpeaking(false);
    }
  }

  return (
    <div className="flex items-center justify-center w-full h-full gap-2">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter" && message.trim()) {
            handleSendClientEvent();
          }
        }}
        type="text"
        placeholder="Ask a question about AI Knowledge Sharing..."
        className="border border-gray-200 rounded-full p-4 flex-1"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        onClick={speakWithCheerleaderVoice}
        disabled={isSpeaking || !message.trim()}
        icon={<Volume2 height={16} />}
        className={`${isSpeaking ? 'bg-pink-400' : 'bg-pink-600'} px-2`}
      >
        {isSpeaking ? "Speaking..." : "Preview"}
      </Button>
      <Button
        onClick={() => {
          if (message.trim()) {
            handleSendClientEvent();
          }
        }}
        icon={<MessageSquare height={16} />}
        className="bg-blue-600"
      >
        Ask Question
      </Button>
      <Button onClick={stopSession} icon={<CloudOff height={16} />}>
        disconnect
      </Button>
    </div>
  );
}

export default function SessionControls({
  startSession,
  stopSession,
  sendClientEvent,
  sendTextMessage,
  serverEvents,
  isSessionActive,
}) {
  return (
    <div className="flex gap-4 border-t-2 border-gray-200 h-full rounded-md">
      {isSessionActive ? (
        <SessionActive
          stopSession={stopSession}
          sendClientEvent={sendClientEvent}
          sendTextMessage={sendTextMessage}
          serverEvents={serverEvents}
        />
      ) : (
        <SessionStopped startSession={startSession} />
      )}
    </div>
  );
}
