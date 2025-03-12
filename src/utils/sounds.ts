export const playConnectSound = () => {
  const audio = new Audio('data:audio/wav;base64,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');
  audio.volume = 0.01; // Reduce volume to 20%
  audio.play();
};

export const playDisconnectSound = () => {
  const audio = new Audio('data:audio/wav;base64,UklGRnIGAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YVQGAAB/f39/f39/f39/f39/f59/fn99fXx8e3t6eXh3dnV0c3JwcW9ubWxramloZ2VkY2FgX11cW1lYVlVUUlFPTkxLSUhGRUNCP0A+PDo5NzY0MzEwLi0rKikoJiUjIiAgHR0bGhgXFRQSERAPDgwLCggHBgQDAgEAAAAAAAEBAgMEBQYHCAkKCwwNDg8QERITFBUWGBgZGhscHR4fICEiIyQlJicoKSosLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6ent8fX5+f39/gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgH9/f39/fn5+fn19fX19fHx8fHt7e3t7e3t6e3p7e3t7e3x8fHx9fX19fn5+fn9/f3+AgICAgICAgIGBgYGBgoKCgoKDg4ODg4SEhISEhYWFhYWGhoaGhoeHh4eHiIiIiIiJiYmJiYqKioqKi4uLi4uMjIyMjI2NjY2Njo6Ojo6Pj4+Pj5CQkJCQkZGRkZGSkpKSkpOTk5OTlJSUlJSVlZWVlZaWlpaWl5eXl5eYmJiYmJmZmZmZmpqampqbm5ubm5ycnJycnZ2dnZ2enp6enp+fn5+foKCgoKChoaGhoaKioqKio6Ojo6OkpKSkpKWlpaWlpqampqanp6enp6ioqKioqampqamqqqqqqqurq6urrKysrKytra2tra6urq6ur6+vr6+wsLCwsLGxsbGxsrKysrKzs7Ozs7S0tLS0tbW1tbW2tra2tre3t7e3uLi4uLi5ubm5ubq6urq6u7u7u7u8vLy8vL29vb29vr6+vr6/v7+/v8DAwMDAwcHBwcHCwsLCwsPDw8PDxMTExMTFxcXFxcbGxsbGx8fHx8fIyMjIyMnJycnJysrKysrLy8vLy8zMzMzMzc3Nzc3Ozs7Ozs/Pz8/P0NDQ0NDR0dHR0dLS0tLS09PT09PU1NTU1NXV1dXV1tbW1tbX19fX19jY2NjY2dnZ2dnZ2tra2trb29vb29zc3Nzc3d3d3d3e3t7e3t/f39/f4ODg4ODh4eHh4eLi4uLi4+Pj4+Pk5OTk5OXl5eXl5ubm5ubn5+fn5+jo6Ojo6enp6enq6urq6uvr6+vr7Ozs7Ozt7e3t7e7u7u7u7+/v7+/w8PDw8PHx8fHx8vLy8vLz8/Pz8/T09PT09fX19fX29vb29vf39/f3+Pj4+Pj5+fn5+fr6+vr6+/v7+/v8/Pz8/P39/f39/v7+/v7///////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=');
  audio.volume = 0.01; // Reduce volume to 20%
  audio.play();
};

// Play audio from base64 data received from the WebSocket
export const playAudioFromBase64 = (base64Data: string, format: string = 'mp3'): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Convert base64 to binary
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create a blob from the binary data
      const blob = new Blob([bytes], { type: `audio/${format}` });
      
      // Create a URL for the blob
      const audioUrl = URL.createObjectURL(blob);
      
      // Create an audio element
      const audio = new Audio(audioUrl);
      
      // Set up event handlers
      audio.onended = () => {
        // Clean up the URL object
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        // Clean up the URL object
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };
      
      // Play the audio
      audio.play().catch(error => {
        console.error('Failed to play audio:', error);
        // Clean up the URL object
        URL.revokeObjectURL(audioUrl);
        reject(error);
      });
    } catch (error) {
      console.error('Error processing audio data:', error);
      reject(error);
    }
  });
};

// Use Deepgram for text-to-speech with browser fallback
export const speakText = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create a URL for the TTS endpoint
    const ttsUrl = `http://localhost:8003/tts?text=${encodeURIComponent(text)}`;
    
    // Create a new audio element
    const audio = new Audio();
    
    // Set up event handlers
    audio.onended = () => {
      resolve();
    };
    
    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      // Fall back to browser TTS
      useBrowserTTS(text).then(resolve).catch(reject);
    };
    
    // Load and play the audio
    audio.src = ttsUrl;
    audio.load();
    
    // Play the audio
    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
      // Fall back to browser TTS
      useBrowserTTS(text).then(resolve).catch(reject);
    });
  });
};

// Fallback to browser's built-in TTS
const useBrowserTTS = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if the browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech not supported in this browser');
      reject(new Error('Text-to-speech not supported'));
      return;
    }

    // Create a new speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure the voice
    utterance.lang = 'en-US';
    utterance.volume = 1.0;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Set event handlers
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };
    
    // Get available voices
    let voices = window.speechSynthesis.getVoices();
    
    // If voices are not loaded yet, wait for them
    if (voices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();
        setVoice(voices);
        // Speak the text
        window.speechSynthesis.speak(utterance);
      };
    } else {
      setVoice(voices);
      // Speak the text
      window.speechSynthesis.speak(utterance);
    }
    
    // Helper function to set the voice
    function setVoice(availableVoices: SpeechSynthesisVoice[]) {
      // Try to use a female voice if available
      const femaleVoice = availableVoices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google US English Female')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    }
  });
};
