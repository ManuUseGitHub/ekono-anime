import { RegistryItem } from "../../models/anime-registry";

import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: "app-anime-card",
    standalone: true,
    templateUrl: "./anime-card.html",
    styleUrl: "./anime-card.scss"
})
export class AnimeCardComponent {
    select($event: PointerEvent) {
        $event.preventDefault();
        this.open.emit(this.anime);
    }

    @Input({ required: true }) anime!: RegistryItem;
    @Input() expanded = false;
    @Output() open = new EventEmitter<RegistryItem>();
    @Output() close = new EventEmitter<void>();
}
