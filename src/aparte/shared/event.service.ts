import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { checkObjectTypes } from "./_";
import { EventDebuger } from "./debugEventHandling";

export interface iHaveSubject {
    getSubject(): Subject<unknown>;
}

@Injectable({
    providedIn: "root"
})
export abstract class EventService implements iHaveSubject {
    public evDebug?: EventDebuger;

    getSubject(): Subject<unknown> {
        return this._subject;
    }
    protected _subject = new Subject();

    broadcast<T extends any>(klass: T, event: Object, payload?: any) {
        const eventName = event.toString();
        this.broadcastRegular(eventName, payload);
        this.evDebug?.broadcastDebugEvents(klass, this, eventName, payload);
    }

    listen<T extends any>(klass: T, eventName: string, callback: (eventO: T) => void, ref: any = {}) {
        return this._subject.asObservable().subscribe((nextObj: any) => {
            this.evDebug?.checkIfNotSilenceEvent(klass, eventName);
            if (eventName === nextObj.eventName) {
                const payload = nextObj.payload;
                checkObjectTypes(ref, payload);
                callback(payload);
            }
        });
    }
    /**
     * A regular event should be broadcasted even if it is silenced
     * @param eventName
     * @param payload
     */
    private broadcastRegular(eventName: string, payload: any) {
        if (this.evDebug?.isSilent(eventName)) {
            this._subject.next({ eventName: eventName.substring(1), payload });
        } else {
            this._subject.next({ eventName, payload });
        }
    }
}
