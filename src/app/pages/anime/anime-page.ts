import {
    Component,
    CreateComputedOptions,
    Inject,
    inject,
    OnInit,
    Signal,
    signal,
    ViewChild,
    WritableSignal
} from "@angular/core";
import { AnimeService } from "../../services/anime-service";
import { AnimeRegistry, RegistryItem } from "../../models/anime-registry";
import { MatPaginatorModule, PageEvent } from "@angular/material/paginator";
import { PageSelectorComponent } from "../../components/paginator/paginator.component";
import { TitleSplitterPipe } from "../../pipes/title-splitter-pipe";
import { AnimeFiltersComponent } from "../../components/anime-filters-component/anime-filters-component";
import { AnimeFilter } from "../../models/AnimeFilter";
import { debounceTime, Subject, switchMap } from "rxjs";
import { AnimeCardComponent } from "../../components/anime-card/anime-card";
import { AnimeDetailsDialogComponent } from "../../components/anime-details-dialog/anime-details-dialog";
import { MatDialog } from "@angular/material/dialog";
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { EventService } from "../../../aparte/shared/event.service";
import { AparteBusEventComponent } from "../../../aparte/shared/aparte-bus-event-component";
import { EventDebuger } from "../../../aparte/shared/debugEventHandling";
import { environment } from "../../../environments/environment";

@Component({
    selector: "app-anime",
    imports: [
        MatPaginatorModule,
        PageSelectorComponent,
        TitleSplitterPipe,
        AnimeFiltersComponent,
        AnimeCardComponent,
        AnimeCardComponent,
        MatIcon,
        MatIconModule
    ],
    templateUrl: "./template.html",
    styleUrl: "./style.scss"
})
export class AnimeComponent extends AparteBusEventComponent implements OnInit {
    @ViewChild(PageSelectorComponent)
    private filters!: PageSelectorComponent;
    private dialog: MatDialog = inject(MatDialog);

    selectedAnime: WritableSignal<RegistryItem | undefined> = signal(undefined);

    private readonly search$ = new Subject<AnimeFilter>();

    searchFilter: WritableSignal<AnimeFilter | undefined> = signal({ pageIndex: 1, pageSize: 10 });
    activate: WritableSignal<boolean> = signal(false);

    // this.yugiResult = toSignal(this._yuGiService.getCards(this.currentPage));
    filter(event: AnimeFilter) {
        this.goTo(1);
        this.getCards({ ...event });
    }
    private readonly _animeService: AnimeService = inject(AnimeService);

    animeResult: WritableSignal<AnimeRegistry | undefined> = signal(undefined);
    currentPage: WritableSignal<number> = signal(1);
    animeSize: WritableSignal<number> = signal(100);

    constructor(protected override events: EventService) {
        super(events);
        this.evDebug = new EventDebuger(environment);
        events.evDebug = this.evDebug;

        this.search$
            .pipe(
                debounceTime(500),
                switchMap(filter => this._animeService.getCards(filter))
            )
            .subscribe({
                next: result => {
                    this.animeResult.set(result);
                    this.animeSize.set(result.meta.total);
                },
                error: err => {
                    console.log("Error fetching anime:", err);
                }
            });
        this.getCards();
    }

    ngOnInit(): void {
        this.listenDoing({ ACTIVE: "ux.search.hover" }, () => this.activate.set(true));
        this.listenDoing({ UNACTIVE: "ux.search.hover" }, () => this.activate.set(false));
        this.listenDoing({ FILTER: "anime.search" }, (event: AnimeFilter) => this.filter(event));
    }

    goTo(page: number): void {
        this.currentPage.set(page);
        this.filters.goTo(page);
    }

    get maxPages() {
        if (this.searchFilter()) {
            const pageSize = this.searchFilter()!.pageSize ?? 1;
            return Math.floor(this.animeSize() / pageSize);
        } else return 0;
    }

    pageChanged(event: PageEvent) {
        this.getCards(event);
    }

    page(event: number) {
        this.getCards({ pageIndex: event, length: this.animeSize() });
    }

    async getCards(event?: AnimeFilter) {
        const previous = this.searchFilter()!;
        const filter = event ? { ...previous, ...event } : previous;

        this.searchFilter.set(filter);
        this.search$.next(filter);
    }

    private showDialog(anime: RegistryItem) {
        const dialogRef = this.dialog.open(AnimeDetailsDialogComponent, {
            data: anime,
            maxWidth: "95vw",
            panelClass: "anime-dialog",
            autoFocus: false
        });
        dialogRef.afterClosed().subscribe(() => {
            this.closeAnime();
        });
    }

    openAnime(anime: RegistryItem) {
        this.selectedAnime.set(anime);

        this.showDialog(anime);
    }

    closeAnime() {
        this.selectedAnime.set(undefined);
        this.dialog.closeAll();
    }
}
