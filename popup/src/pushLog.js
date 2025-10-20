import { logs$ } from './streams';


export function formatTimestamp() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// Push a log message to the logs stream
export function pushLog(message, cat = "LOG") {
  const timestamp = formatTimestamp();
  const logEntry = `[${cat}] ${timestamp}: ${message}`;
  
  let updatedLogs = [...logs$(), logEntry];
  if (updatedLogs.length > 10)
    updatedLogs = updatedLogs.slice(updatedLogs.length - 10);
  
  logs$(updatedLogs);
}