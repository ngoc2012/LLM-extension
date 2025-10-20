import flyd from 'flyd';

export const logs$ = flyd.stream(Array.from({ length: 10 }, (_, i) => `Log entry ${i + 1}`));
export const actionLogs$ = flyd.stream([]);
export const prompt$ = flyd.stream('List all mail subjects this week from gmail.com');
export const apiKey$ = flyd.stream('');
export const tabs$ = flyd.stream([]);
export const selectedTabId$ = flyd.stream(null);