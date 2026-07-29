export const intersect = <T>(a: T[], b: T[]) => a.filter(value => b.includes(value));
export const union = <T>(a: T[], b: T[]) => [...new Set([...a, ...b])];
export const difference = <T>(a: T[], b: T[]) => a.filter(v => !b.includes(v));
export const symDifference = <T>(a: T[], b: T[]) => a.filter(x => !b.includes(x)).concat(b.filter(x => !a.includes(x)));
