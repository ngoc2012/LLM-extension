import flyd from 'flyd';


export const logs$ = flyd.stream([]);
export const actionLogs$ = flyd.stream([]);
export const prompt$ = flyd.stream(import.meta.env.VITE_BASE_PROMPT || '');
export const apiKey$ = flyd.stream(import.meta.env.VITE_API_KEY || '');
export const tabs$ = flyd.stream([]);
export const promptModel$ = flyd.stream('');