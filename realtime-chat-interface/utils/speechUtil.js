/**
 * Utility functions for handling text-to-speech
 */

// Cache for audio elements to prevent memory leaks
const audioCache = new Map();

/**
 * Generate and play speech from text using the GPT-4o-mini-tts model
 * @param {string} text - The text to convert to speech
 * @param {string} id - Optional identifier for the audio element (useful for caching/cleanup)
 * @returns {Promise<HTMLAudioElement>} - The audio element playing the speech
 */
export async function generateAndPlaySpeech(text, id = null) {
  try {
    console.log("Generating speech for:", text);
    
    // Check text length and trim if necessary
    if (text.length > 4000) {
      console.warn("Text exceeds 4000 characters, trimming...");
      text = text.slice(0, 4000);
    }
    
    // Send request to our backend API
    const response = await fetch('/api/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Speech generation failed: ${errorData.error || response.statusText}`);
    }
    
    // Get the audio blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Clean up previous audio with the same ID if it exists
    if (id && audioCache.has(id)) {
      const oldAudio = audioCache.get(id);
      oldAudio.pause();
      URL.revokeObjectURL(oldAudio.src);
      audioCache.delete(id);
    }
    
    // Create and play the audio element
    const audio = new Audio(audioUrl);
    
    // Store in cache if ID is provided
    if (id) {
      audioCache.set(id, audio);
    }
    
    // Clean up when done playing
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (id) {
        audioCache.delete(id);
      }
    };
    
    // Play the audio
    await audio.play();
    return audio;
    
  } catch (error) {
    console.error("Error generating or playing speech:", error);
    throw error;
  }
}

/**
 * Stop playing all cached audio elements
 */
export function stopAllAudio() {
  audioCache.forEach((audio) => {
    audio.pause();
    URL.revokeObjectURL(audio.src);
  });
  audioCache.clear();
}