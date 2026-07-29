import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from "@angular/material/dialog";
import { RegistryItem } from "../../models/anime-registry";
import { AnimeCardComponent } from "../anime-card/anime-card";
import { TitleSplitterPipe } from "../../pipes/title-splitter-pipe";
import { MatDivider } from "@angular/material/divider";
import { MatChip, MatChipSet, MatChipOption } from "@angular/material/chips";
import { MatIcon, MatIconModule } from "@angular/material/icon";

@Component({
    selector: "app-anime-details-dialog",
    imports: [MatDialogModule, MatDivider, AnimeCardComponent, TitleSplitterPipe, MatChip, MatIcon, MatIconModule, MatChipSet, MatChipOption],
    standalone:true,
    templateUrl: "./anime-details-dialog.html",
    styleUrl: "./anime-details-dialog.scss"
})
export class AnimeDetailsDialogComponent {

    selectedAnime?: RegistryItem;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public anime: RegistryItem
    ) {}

}
