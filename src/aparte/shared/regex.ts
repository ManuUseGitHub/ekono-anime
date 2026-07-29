import { EV } from "../aparte.composites";

export const hasEvent = (event: EV, eventName: string) =>
  new RegExp(`(${event.toString()})`).test(eventName);
