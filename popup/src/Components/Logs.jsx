import { useFlyd } from '../useFlyd.js';
import { logs$ } from '../streams.js';


export default function Logs() {
  const logs = useFlyd(logs$);

  return (
    <div className="logs">
      <h3>Logs</h3>
      {logs && logs.length > 0
        ? logs.map((log, id) => <p key={id}>{log}</p>)
        : <p>No logs available</p>}
    </div>
  );
}