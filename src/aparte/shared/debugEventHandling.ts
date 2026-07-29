import { isDevMode } from "@angular/core";
import { getClassNameOfObject } from "./_";
import { hasEvent } from "./regex";
import { AparteEnvConfig, LogAccepts, Summary } from "./aparte.types";
import { iHaveSubject } from "./event.service";
import { AparteBusEventComponent } from "./aparte-bus-event-component";
import { EV } from "../aparte.composites";
import { doing, pinch, touch } from "../aparte.builder";
import { environment } from "../../environments/environment";

const BROADCASTERS_HISTORY = doing({
    HISTORY: "aparte.debug.broadcasters"
}).toString();
const LISTENERS_HISSTORY = doing({
    HISTORY: "aparte.debug.listeners"
}).toString();

export class EventDebuger {
    private environment?: AparteEnvConfig;

    constructor(environment?: AparteEnvConfig) {
        this.environment = environment;
    }

    listenersHandler = (subscribing: AparteBusEventComponent, summary: Summary) => {
        return subscribing.listenDoing({ PUSH: "aparte.debug.listeners" }, data => {
            subscribing.broadcastWithHistory(
                pinch({ HISTORY: "aparte.debug.listeners" }),
                summary,
                data,
                (summary: Summary, entry: { name: string; origin: string }) => {
                    const { name, origin } = entry;
                    if (!summary.inventory[origin]) {
                        summary.inventory[origin] = { count: 0, eventNames: [] };
                    }
                    summary.inventory[origin].count++;
                    summary.inventory[origin].eventNames.push(name);
                }
            );
        });
    };

    broadcastersHandler(subscribing: AparteBusEventComponent, summary: Summary) {
        return subscribing.listenDoing({ PUSH: "aparte.debug.broadcasters" }, data => {
            subscribing.broadcastWithHistory(
                pinch({ HISTORY: "aparte.debug.broadcasters" }),
                summary,
                data,
                (summary: Summary, entry: { name: string; origin: string }) => {
                    const { name, origin } = entry;
                    if (!summary.inventory[origin]) {
                        summary.inventory[origin] = [];
                    }
                    summary.inventory[origin].push(name);
                }
            );
        });
    }

    debugHandler(subscribing: AparteBusEventComponent) {
        return subscribing.listenDoing({ LOG: "aparte.debug" }, data => {
            if (data.name) {
                const { name, payload } = data;
                if (new RegExp(`(${BROADCASTERS_HISTORY}|${LISTENERS_HISSTORY})`).test(name)) {
                    console.group(
                        `%c${name.replaceAll(/\./g, " ").toUpperCase()}`,
                        /broadcasters/i.test(name) ? "color: #c433ff;" : "color: #aabbff;"
                    );
                    console.log(payload);
                    console.groupEnd();
                } else {
                    console.log(data);
                }
            }
        });
    }

    setDebugging(component: AparteBusEventComponent, listeners: Summary, broadcasters: Summary) {
        if (isDevMode()) {
            this.debugHandler(component);

            const logConfig = this.environment?.eventLog;
            if (logConfig && logConfig.history) {
                if (logConfig.history.listeners != "none") {
                    this.listenersHandler(component, listeners);
                }
                if (logConfig.history.broadcaster != "none") {
                    this.broadcastersHandler(component, broadcasters);
                }
            }
        }
    }

    pushEventNameListened(component: AparteBusEventComponent, eventName: string) {
        const debugPushEvent = touch({ PUSH: "aparte.debug.listeners" }).toString();

        if (debugPushEvent != eventName) {
            component.broadcast(debugPushEvent, {
                name: eventName,
                origin: component.constructor.name
            });
        }
    }

    pushEventNameBroadcasted(component: AparteBusEventComponent, builder: Object) {
        const debugPushEvent = touch({
            PUSH: "aparte.debug.broadcasters"
        }).toString();
        const eventName = builder.toString();
        if (
            debugPushEvent != eventName &&
            eventName != touch({ PUSH: "aparte.debug.listeners" }).toString() &&
            eventName != pinch({ PUSH: "aparte.debug.listeners" }).toString()
        ) {
            const logConfig = this.environment?.eventLog?.history;
            if (logConfig) {
                if (this.isValidForDebug(eventName, logConfig.broadcaster, logConfig.broadcastersRegex))
                    component.broadcast(debugPushEvent, {
                        name: eventName,
                        origin: component.constructor.name
                    });
            }
        }
    }

    checkIfNotSilenceEvent<T extends any>(klass: T, eventName: string) {
        if (eventName.charAt(0) == "_") {
            throw new Error(
                "No silenced event should be listened please listen a regular event.\n received\t: " +
                    eventName +
                    "\n origin\t\t: " +
                    getClassNameOfObject(klass) +
                    "\n\n Stacktrace\t:"
            );
        }
    }
    isSilent(eventName: string) {
        return eventName.charAt(0) == "_";
    }
    isValidForDebug(eventName: string, level: LogAccepts, regexString?: string) {
        if (/none|all/.test(level)) {
            return level == "all";
        }
        if (level == "loud") return eventName.charAt(0) != "_";
        if (level == "silent") return eventName.charAt(0) == "_";
        if (level == "regex") {
            return new RegExp(`(${regexString ? regexString : "."}|HISTORY)`!, "g").test(eventName);
        }
        return false;
    }
    broadcastDebugEvents<T extends any>(klass: T, subscribing: iHaveSubject, eventName: string, payload: any) {
        const logConfig = this.environment?.eventLog;
        if (
            isDevMode() &&
            logConfig &&
            (this.isValidForDebug(eventName, logConfig.events, logConfig.eventsRegex) ||
                (logConfig.events == "history" && hasEvent(EV.HISTORY, eventName)))
        ) {
            if (eventName != pinch({ LOG: "aparte.debug" }).build()) {
                let source: any = "application:";
                if (payload?.event && payload.event instanceof PointerEvent) {
                    source = payload.event.target;
                }

                subscribing.getSubject().next({
                    eventName: pinch({ LOG: "aparte.debug" }).build(),
                    payload: {
                        name: eventName,
                        origin: getClassNameOfObject(klass),
                        payload,
                        source
                    }
                });
            }
        }
    }
}
