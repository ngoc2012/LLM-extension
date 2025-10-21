import flyd from 'flyd';


export const logs$ = flyd.stream([]);
export const actionLogs$ = flyd.stream([]);
export const prompt$ = flyd.stream('');
export const apiKey$ = flyd.stream('');
export const tabs$ = flyd.stream([]);