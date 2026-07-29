import { Component, OnInit } from "@angular/core";
import { hi5 } from "../../../aparte/aparte.builder";
import { environment } from "../../../environments/environment";
import { AparteBusEventComponent } from "../../../aparte/shared/aparte-bus-event-component";
import { EventService } from "../../../aparte/shared/event.service";
import { EventDebuger } from "../../../aparte/shared/debugEventHandling";

@Component({
    selector: "app-button",
    imports: [],
    templateUrl: "./button.component.html",
    styleUrl: "./button.component.scss"
})
export class ButtonComponent extends AparteBusEventComponent implements OnInit {
    constructor(protected override events: EventService) {
        super(events);
        this.evDebug = new EventDebuger(environment);
        events.evDebug = this.evDebug;
    }
    ngOnInit(): void {
        setTimeout(() => {
            this.broadcast(hi5({ HELLO: "system.saying" }), { message: "hello " });
            this.broadcast(hi5({ WORLD: "system.saying" }), { message: "world !" });
            this.broadcast(hi5({ BYE: "system.saying" }), { message: "from hello world ... bye !" });
        }, 500);
    }
}
