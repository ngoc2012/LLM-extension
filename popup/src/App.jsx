// App.jsx
import './App.css';
import { prompt$, apiKey$ } from './streams';
import Voice from './Components/Voice.jsx';
import Toggle from './Components/Toggle.jsx';
import ActionTest from './Test/ActionTest.jsx';
import Model from './Model/Model.jsx';
import { useFlyd } from './useFlyd.js';


function App() {
  const apiKey = useFlyd(apiKey$);
  const prompt = useFlyd(prompt$);

  return (
    <div className="App">
      <h2>LLM Extension</h2>

      <div>
        <h3>API Key</h3>
        <textarea
          value={apiKey}
          onChange={(e) => apiKey$(e.target.value)}
          placeholder="Enter your API key"
          rows={1}
        />
      </div>

      <div>
        <h3>Prompt</h3>
        <textarea
          value={prompt}
          onChange={(e) => prompt$(e.target.value)}
          placeholder="Type or speak your prompt"
          rows={5}
        />
      </div>

      <Voice />
      <Model />
      <Toggle
        component={ActionTest}
        label={{ show: "Show Action Test", hide: "Hide Action Test" }}
      />

    </div>
  );
}

export default App;
