import flyd from 'flyd';

export const logs$ = flyd.stream(Array.from({ length: 10 }, (_, i) => `Log entry ${i + 1}`));