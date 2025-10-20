// App.jsx
import { useEffect, useState } from 'react';
import './App.css';
import { pushLog } from './pushLog';
import { prompt$ } from './streams';


function Voice() {
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize speech recognition if supported
    if ('webkitSpeechRecognition' in window) {
      const recog = new window.webkitSpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onstart = () => {
        setListening(true);
        pushLog('🎤 Listening...', 'INFO');
        prompt$('');
      };

      recog.onend = () => {
        setListening(false);
        pushLog('🛑 Voice stopped.', 'INFO');
      };

      recog.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        prompt$(transcript);
      };

      setRecognition(recog);
    } else {
      pushLog('Speech recognition not supported in this browser.', 'ERROR');
    }
  }, []);

  const handleVoiceToggle = () => {
    if (!recognition) return;
    if (listening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  return (

        <button onClick={handleVoiceToggle}>
          {listening ? '🛑 Stop Voice' : '🎤 Start Voice'}
        </button>
  );
}

export default Voice;
