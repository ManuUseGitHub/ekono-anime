import { Component, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { formatAlignHistoryEntries, shallowCopyObject } from "./_";
import { HistoryEntry, Summary } from "./aparte.types";
import { EventDebuger } from "./debugEventHandling";
import { EventService } from "./event.service";
import { EV } from "../aparte.composites";
import { EventRegistry } from "../aparte.registry";
import { disapointed, doing, satisfied } from "../aparte.builder";

const timers: { [x: string]: any } = {};

@Component({
    template: "",
    standalone: false
})
export abstract class AparteBusEventComponent implements OnDestroy {
    protected evDebug?: EventDebuger;

    delayedBroadcast(builder: EventRegistry | Object, payload?: any) {
        const action = builder.toString();
        if (timers[action]) {
            clearTimeout(timers[action]);
        }
        timers[action] = setTimeout(() => {
            this.broadcast(action, payload);
        }, 1000);
    }
    private subscriptions: Subscription[] = [];
    constructor(protected events: EventService) {}

    listen(
        builder: EventRegistry | EventRegistry[] | Object | Object[],
        callback: (event: any) => void,
        ref: any = {}
    ) {
        if (Array.isArray(builder)) {
            this.subscribe(...builder.map(message => this._listenEvent(message.toString(), callback, ref)));
        } else {
            this.subscribe(this._listenEvent(builder, callback, ref));
        }
    }

    subscribe(...subscriptions: Subscription[]) {
        this.subscriptions.push(...subscriptions);
    }

    broadcast(builder: EventRegistry | Object, payload?: any) {
        this.evDebug?.pushEventNameBroadcasted(this, builder);
        this.events.broadcast(this, builder.toString(), payload);
    }

    broadcastWithHistory(
        builder: EventRegistry | Object,
        summary: Summary,
        entry: HistoryEntry,
        cbInventory?: (summary: Summary, entry: HistoryEntry) => any
    ) {
        const eventName = builder.toString();
        if (timers[eventName]) {
            clearTimeout(timers[eventName]);
        }

        summary.history.push(entry);
        if (cbInventory) {
            if (!summary.inventory) {
                summary.inventory = {};
            }
            cbInventory(summary, entry);
        }

        timers[eventName] = setTimeout(() => {
            formatHistoryEvent(eventName, summary);

            this.broadcast(eventName, { ...shallowCopyObject(summary), timers });
            clearTimeout(timers[eventName]);

            summary.history = [];
            summary.inventory = {};
        }, 1000);
    }

    listenDoing(
        builder: EventRegistry | EventRegistry[] | Object | Object[],
        callback: (event: any) => void,
        ref: any = {} as any
    ) {
        if (Array.isArray(builder)) {
            this.listen(builder.map(doing), callback, ref);
        } else {
            this.subscribe(this._listenEvent(doing(builder), callback, ref));
        }
    }

    listenSatisfied(
        builder: EventRegistry | EventRegistry[] | Object | Object[],
        callback: (event: any) => void,
        ref: any = {} as any
    ) {
        if (Array.isArray(builder)) {
            this.listen(builder.map(satisfied), callback, ref);
        } else {
            this.subscribe(this._listenEvent(satisfied(builder), callback, ref));
        }
    }

    listenDisapointed(builder: EventRegistry | Object, callback: (event: any) => void, ref: any = {} as any) {
        return this._listenEvent(disapointed(builder), callback, ref);
    }

    private _listenEvent(builder: Object, callback: (event: any) => void, ref: any = {} as any): Subscription {
        const eventName = builder.toString();
        this.evDebug?.pushEventNameListened(this, eventName);
        return this.events.listen(this, eventName, callback, ref);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(x => {
            try {
                if (!x.closed) {
                    x.unsubscribe();
                }
            } catch (err) {
                console.error(err);
            }
        });
    }
}
function formatHistoryEvent(eventName: string, summary: Summary) {
    if (new RegExp(`(${EV.HISTORY.toString()})`).test(eventName)) {
        summary.history = formatAlignHistoryEntries(summary.history);
    }
}
