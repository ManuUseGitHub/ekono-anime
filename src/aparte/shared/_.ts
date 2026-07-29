import { HistoryEntry } from './aparte.types';

export const shallowCopyObject = (obj: any) => JSON.parse(JSON.stringify(obj));

export const getClassNameOfObject = <T extends unknown>(klass: T) => {
  // the origin is the class name prepended by un underscore "_"
  const origin = (klass as any).constructor.name;

  // gives the class name without the underscore or the
  return /_?(?<origin>.+)/.exec(origin)!.groups!['origin'];
};
export const checkObjectTypes = (payload: any, ref: any) => {
  if (ref == undefined) return;
  const a = Object.keys(ref).sort().join('|');
  const b = Object.keys(payload).sort().join('|');
  if (a != '' && b != '') {
    if (a != b) {
      console.error(a, '\n', b, 'Are differents !!!');
    }
  }
};

export function formatAlignHistoryEntries(entries: HistoryEntry[]) {
  const space =
    entries.reduce(function (prev, current) {
      return prev && prev.name.length > current.name?.length ? prev : current;
    }).name.length + 1;

  return entries.map((entry: HistoryEntry, i) => {
    const correction =
      Math.floor(Math.log10(entries.length)) -
      Math.floor(Math.log10(i ? i : 1));
    const difference = space - entry.name.length + correction;
    return `${entry.name}${' '.repeat(difference)} from ${entry.origin}`;
  });
}

