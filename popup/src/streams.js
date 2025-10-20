import flyd from 'flyd';
import { MAX_LOGS } from './const';


export const logs$ = flyd.stream(Array.from({ length: MAX_LOGS }, (_, i) => `Log entry ${i + 1}`));
export const actionLogs$ = flyd.stream([]);
// export const prompt$ = flyd.stream('Find the latest paper on Hugging Face Daily Paper about UI Agents');
// export const prompt$ = flyd.stream('Find a piano tutorial video on YouTube for beginners');
export const prompt$ = flyd.stream('Check my email not read today in yahoo mail');
// export const prompt$ = flyd.stream('Go through my recent Gmail and find email lists or promotional emails that I haven’t opened in the last 3 months');
export const apiKey$ = flyd.stream('');
export const tabs$ = flyd.stream([]);
export const selectedTabId$ = flyd.stream(null);