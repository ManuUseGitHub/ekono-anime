import { Component, OnInit, signal, WritableSignal } from "@angular/core";
import { EventService } from "../../../../aparte/shared/event.service";
import { AparteBusEventComponent } from "../../../../aparte/shared/aparte-bus-event-component";
import { EventDebuger } from "../../../../aparte/shared/debugEventHandling";
import { environment } from "../../../../environments/environment";
import { AnimeFilter } from "../../../models/AnimeFilter";
import { getCombinedFilterData, getSearchStringFromFilterData } from "../../../../searchString";
import { data } from "../../../../ressources/totalFilter";
import { getExtension } from "../../../../ressources/malFilterExtension";

@Component({
    selector: "app-filter-string-component",
    imports: [],
    templateUrl: "./filter-string-component.html",
    styleUrl: "./filter-string-component.scss"
})
export class FilterStrinigComponent extends AparteBusEventComponent implements OnInit {
    constructor(protected override events: EventService) {
        super(events);
        this.evDebug = new EventDebuger(environment);
        events.evDebug = this.evDebug;
    }
    ngOnInit(): void {
        this.listenDoing({ FILTER: "anime.search" }, (event: AnimeFilter) => this.computeString(event));
    }
    computeString(event: AnimeFilter): void {
        this.computedFilterString.set(
            getSearchStringFromFilterData(getCombinedFilterData(data, getExtension()), event)
        );
    }

    computedFilterString: WritableSignal<string> = signal("");
}
