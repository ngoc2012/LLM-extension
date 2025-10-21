import { pushActionLog } from "../../pushLog";
import { tabsAction } from "./tabsAction.js";
import { domAction } from "./domAction.js";


export async function llmAction(commandArray) {
  if (!Array.isArray(commandArray) || commandArray.length === 0) {
    const msg = `Invalid command: ${JSON.stringify(commandArray)}`;
    pushActionLog(msg);
    return msg;
  }
  const [category, ...args] = commandArray;
  const tabIdString = args.length > 0 ? args.pop() : null;
  let tabId = null;
  if (typeof tabIdString === "string") {
    tabId = tabIdString ? parseInt(tabIdString) : null;
  } else if (typeof tabIdString === "number") {
    tabId = tabIdString;
  }

  try {
    let message;
    switch (category) {
      case "tabs":
        message = await tabsAction(args, tabId);
        break;

      case "dom": {
        message = await domAction(args, tabId);
        break;
      }

      default:
        message = `Unknown category: ${category}`;
        pushActionLog(message);
        return message;
    }

    pushActionLog(`LLM ${category} action result: ${JSON.stringify(message)}`);
    return message;
  } catch (err) {
    if (err.message) {
      const msg = `LLM Action failed: ${err.message}`;
      pushActionLog(msg);
      return msg;
    }
    return '';
  }
}
