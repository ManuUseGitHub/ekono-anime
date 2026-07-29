import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Navbar } from "./layouts/navbar/navbar";
import { AparteBusEventComponent } from "../aparte/shared/aparte-bus-event-component";
import { EventService } from "../aparte/shared/event.service";
import { EventDebuger } from "../aparte/shared/debugEventHandling";
import { environment } from "../environments/environment";
import { Summary } from "../aparte/shared/aparte.types";

@Component({
    selector: "app-root",
    imports: [RouterOutlet, Navbar],
    templateUrl: "./app.html",
    styleUrl: "./app.css"
})
export class App extends AparteBusEventComponent {
    private _listenersSummary: Summary = {
        history: [],
        inventory: {}
    };

    private _broadcastersSummary: Summary = {
        history: [],
        inventory: {}
    };

    constructor(protected override events: EventService) {
        super(events);
        console.log(environment);
        this.evDebug = new EventDebuger(environment);
        events.evDebug = this.evDebug;

        this.evDebug.setDebugging(this, this._listenersSummary, this._broadcastersSummary);
    }
    protected readonly title = signal("hello");
}
