import flyd from 'flyd';

export const logs$ = flyd.stream(Array.from({ length: 10 }, (_, i) => `Log entry ${i + 1}`));
export const prompt$ = flyd.stream('Hello, world');
export const apiKey$ = flyd.stream('');
export const tabs$ = flyd.stream([]);
export const selectedTabId$ = flyd.stream(null);