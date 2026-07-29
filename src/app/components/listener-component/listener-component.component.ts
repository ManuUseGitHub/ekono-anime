import { Component, OnInit } from "@angular/core";

import { environment } from "../../../environments/environment";
import { EventService } from "../../../aparte/shared/event.service";
import { AparteBusEventComponent } from "../../../aparte/shared/aparte-bus-event-component";
import { EventDebuger } from "../../../aparte/shared/debugEventHandling";

@Component({
    selector: "app-listener-component",
    imports: [],
    templateUrl: "./listener-component.component.html",
    styleUrl: "./listener-component.component.scss"
})
export class ListenerComponentComponent extends AparteBusEventComponent implements OnInit {
    constructor(protected override events: EventService) {
        super(events);
        this.evDebug = new EventDebuger(environment);
        events.evDebug = this.evDebug;
    }
    ngOnInit(): void {
        this.listenSatisfied(
            [{ HELLO: "system.saying" }, { WORLD: "system.saying" }, { BYE: "system.saying" }],
            (event: any) => {
                console.log("received : ", event);
            }
        );
    }
}
