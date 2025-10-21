import { actionLogs$, logs$ } from './streams';
import { MAX_LOGS, MAX_LOG_LENGTH, MAX_ACTION_LOG_LENGTH } from './param';


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
  if (updatedLogs.length > MAX_LOGS)
    updatedLogs = updatedLogs.slice(updatedLogs.length - MAX_LOGS);

  logs$(updatedLogs);
}

export function pushActionLog(message) {
  const logEntry = `${formatTimestamp()}: ${message.slice(0, MAX_ACTION_LOG_LENGTH)}`;
  actionLogs$([...actionLogs$(), logEntry]);
  pushLog(message.slice(0, MAX_LOG_LENGTH), "ACTION");
}