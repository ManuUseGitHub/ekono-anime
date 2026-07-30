import {
  AfterViewInit,
    Component,
    EventEmitter,
    inject,
    Input,
    OnInit,
    Output,
    output,
    Signal,
    signal,
    WritableSignal
} from "@angular/core";
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatFormField, MatLabel, MatOption, MatSelectModule } from "@angular/material/select";
import { MatAnchor, MatButton } from "@angular/material/button";
import { AnimeFilter, AnimeFilterIndexed } from "../../models/AnimeFilter";
import { StatTypesService } from "../../services/stat-types-service";
import {
    AiringItem,
    ApprovedItem,
    GenreItem,
    RatingItem,
    SeasonItem,
    SourceItem,
    ThemeItem,
    TypeItem,
    YearItem
} from "../../models/anime-registry";
import { FormSelectorNaComponent } from "../form-selector-na/form-selector-na.component";
import { INCLUSIVE_MARK } from "../../../ressources/value";
import { AnimeCount } from "../anime-count/anime-count";
import { AparteBusEventComponent } from "../../../aparte/shared/aparte-bus-event-component";
import { EventService } from "../../../aparte/shared/event.service";
import { EventDebuger } from "../../../aparte/shared/debugEventHandling";
import { environment } from "../../../environments/environment";
import { pinch } from "../../../aparte/aparte.builder";
import { FilterStrinigComponent } from "./filter-string-component/filter-string-component";
import { ActivatedRoute } from "@angular/router";
import { decodeSearchString, getCombinedFilterData, getDeCypheredFilter } from "../../../searchString";
import { getExtension } from "../../../ressources/malFilterExtension";
import * as filter from "../../../ressources/fullOptions.json";
import { intersect } from "../../lib/arrays";
const totalFilters = (filter as any).default;

type AnimeFilterForm = {
    text: FormControl<string | null>;
    approved: FormControl<boolean | null>;
    types: FormControl<string[] | null>;
    sources: FormControl<string[] | null>;
    airing: FormControl<boolean | null>;
    seasons: FormControl<string[] | null>;
    years: FormControl<number[] | null>;
    genres: FormControl<string[] | null>;
    themes: FormControl<string[] | null>;
    rating: FormControl<string[] | null>;
};

@Component({
    selector: "app-anime-filters-component",
    imports: [
        ReactiveFormsModule,
        MatCheckbox,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatOptionModule,
        MatFormField,
        MatButton,
        MatLabel,
        MatOption,
        MatAnchor,
        FormSelectorNaComponent,
        AnimeCount,
        FilterStrinigComponent
    ],
    templateUrl: "./anime-filters-component.html",
    styleUrl: "./anime-filters-component.scss"
})
export class AnimeFiltersComponent extends AparteBusEventComponent implements OnInit, AfterViewInit {
    private activatedRoute = inject(ActivatedRoute);

    constructor(protected override events: EventService) {
        super(events);
        this.evDebug = new EventDebuger(environment);
        events.evDebug = this.evDebug;
    }

    emit(name: "enter" | "left" | "search", event?: MouseEvent | SubmitEvent) {
        if (event) event.preventDefault();
        switch (name) {
            case "enter":
                this.broadcast(pinch({ ACTIVE: "ux.search.hover" }));
                break;
            case "left":
                this.broadcast(pinch({ UNACTIVE: "ux.search.hover" }));
                break;
            case "search":
                this.brodacastSearch();
        }
    }

    filterNullProperties(obj: any) {
        const result: any = {};
        Object.keys(obj)
            .filter(k => obj[k] != null || obj[k] != undefined)
            .forEach((k: string) => {
                result[k] = obj[k];
            });
        return result;
    }
    brodacastSearch() {
        const booleanFormValue = this.formBoolean.getRawValue();
        this.broadcast(
            pinch({ FILTER: "anime.search" }),
            this.filterNullProperties({
                ...this.form.getRawValue(),
                ...{
                    airing: booleanFormValue.airing == INCLUSIVE_MARK ? null : [booleanFormValue.airing!.airing],
                    approved: booleanFormValue.approved == INCLUSIVE_MARK ? null : [booleanFormValue.approved!.approved]
                },
                genres: this.form.controls.genres.value ?? []
            }) as AnimeFilter
        );
    }
    selectedGenres: WritableSignal<string[]> = signal([]);
    selectedThemes: WritableSignal<string[]> = signal([]);
    onReadAiring: (option: AiringItem) => string = option => {
        return `${option.airing ? "currently airing" : "not airing"} <small class="text-blue-500 count">(${
            option.animeCount
        })</small>`;
    };
    onReadApproved: (option: ApprovedItem) => string = option => {
        return `${option.approved ? "approved" : "not or unknown"} <small class="text-blue-500 count">(${
            option.animeCount
        })</small>`;
    };

    toggleGenre(genre: string, checked: boolean): void {
        const current = this.form.controls.genres.value ?? [];
        this.form.controls.genres.setValue(checked ? [...current, genre] : current.filter(g => g !== genre));
    }
    private readonly fb = inject(FormBuilder);
    private readonly statService = inject(StatTypesService);

    formBoolean!: FormGroup<{
        approved: FormControl<{ approved: boolean } | "*" | null>;
        airing: FormControl<{ airing: boolean } | "*" | null>;
    }>;
    form!: FormGroup<AnimeFilterForm>;

    ngOnInit(): void {
        this.form = this.fb.group({
            text: this.fb.control<string | null>(null),
            approved: this.fb.control<boolean | null>(null),
            types: this.fb.control<string[] | null>(null),
            sources: this.fb.control<string[] | null>(null),
            airing: this.fb.control<boolean | null>(null),
            seasons: this.fb.control<string[] | null>(null),
            years: this.fb.control<number[] | null>(null),
            genres: this.fb.control<string[] | null>(null),
            themes: this.fb.control<string[] | null>(null),
            rating: this.fb.control<string[] | null>(null)
        });

        this.formBoolean = this.fb.group({
            approved: this.fb.control<any | "*" | null>(null),
            airing: this.fb.control<any | "*" | null>(null)
        });
        this.formBoolean.patchValue({ airing: INCLUSIVE_MARK, approved: INCLUSIVE_MARK });

        const stats = [
            ["genres", this.sigGenres],
            ["themes", this.sigThemes],
            ["airings", this.sigAiring],
            ["approved", this.sigApproved],
            ["types", this.sigTypes],
            ["years", this.sigYears],
            ["seasons", this.sigSeasons],
            ["sources", this.sigSources],
            ["rating", this.sigRating]
        ] as const;

        stats.forEach(([name, signal]) => {
            this.statService.getStat(name).subscribe((r: any) => {
                const list: any[] = r.data;
                signal.set(list.sort());
            });
        });
    }

    ngAfterViewInit() {
        this.activatedRoute.queryParamMap.subscribe(data => {
            const searchString = data.get("search");
            if (searchString) {
                const result = getDeCypheredFilter(totalFilters, decodeSearchString(searchString, totalFilters));

                const controlsKeys = Object.keys(this.form.controls);
                const resultKeys = Object.keys(result);

                intersect(controlsKeys, resultKeys).forEach(k => {
                    if (k == "genres") {
                        this.selectedGenres.set(result[k]);
                    }
                    (this.form.controls as any)[k].setValue(result[k]);
                });

                this.brodacastSearch();
            }
        });
    }

    sigSeasons: WritableSignal<SeasonItem[] | undefined> = signal(undefined);
    sigSources: WritableSignal<SourceItem[] | undefined> = signal(undefined);
    sigTypes: WritableSignal<TypeItem[] | undefined> = signal(undefined);
    sigApproved: WritableSignal<ApprovedItem[] | undefined> = signal(undefined);
    sigAiring: WritableSignal<AiringItem[] | undefined> = signal(undefined);
    sigGenres: WritableSignal<GenreItem[] | undefined> = signal(undefined);
    sigThemes: WritableSignal<ThemeItem[] | undefined> = signal(undefined);
    sigYears: WritableSignal<YearItem[] | undefined> = signal(undefined);
    sigRating: WritableSignal<RatingItem[] | undefined> = signal(undefined);
}
