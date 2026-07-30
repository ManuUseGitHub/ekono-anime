import { Component, Input, Output, EventEmitter, signal, OnDestroy } from "@angular/core";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatFormField } from "@angular/material/form-field";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule, MatIconButton } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { AparteBusEventComponent } from "../../../aparte/shared/aparte-bus-event-component";
import { EventService } from "../../../aparte/shared/event.service";
import { EventDebuger } from "../../../aparte/shared/debugEventHandling";
import { environment } from "../../../environments/environment";

@Component({
    selector: "app-paginator",
    imports: [
        MatPaginatorModule,
        MatFormField,
        FormsModule,
        MatInputModule,
        MatButtonModule,
        MatIconButton,
        MatIconModule,
        CommonModule
    ],
    templateUrl: "./paginator.component.html",
    styleUrls: ["./paginator.component.scss"]
})
export class PageSelectorComponent extends AparteBusEventComponent implements OnDestroy {
    constructor(protected override events: EventService) {
        super(events);
        this.evDebug = new EventDebuger(environment);
        events.evDebug = this.evDebug;
    }
    ngOnInit(): void {
        setTimeout(() => {
            this.listenDoing({ ACTIVE: "ux.search.hover" }, () => this.activatePaginator());
            this.listenDoing({ UNACTIVE: "ux.search.hover" }, () => this.unactivePaginator());
        }, 500);
    }

    unactivePaginator() {
        this.tActive = setTimeout(() => {
            this.active.set(false);
        }, 1000);
    }
    activatePaginator() {
        this.active.set(true);

        if (this.tActive) {
            clearTimeout(this.tActive);
        }
    }
    override ngOnDestroy(): void {
        super.ngOnDestroy();
        if (this.tActive) {
            clearTimeout(this.tActive);
        }
    }

    @Input({ required: true })
    currentPage!: number;

    @Input({ required: true })
    totalPages!: number;

    @Input({ required: true })
    totalElements!: number;

    active = signal(true);
    tActive: any;

    @Output()
    pageChange = new EventEmitter<number>();

    goTo(page: number): void {
        page = Math.max(1, Math.min(page, this.totalPages));

        if (page !== this.currentPage) {
            this.currentPage = page;
            this.pageChange.emit(page);
        }
    }

    first(): void {
        this.goTo(1);
    }

    last(): void {
        this.goTo(this.totalPages);
    }

    previous(): void {
        this.goTo(this.currentPage - 1);
    }

    next(): void {
        this.goTo(this.currentPage + 1);
    }

    jumpBack(): void {
        this.goTo(this.currentPage - 10);
    }

    jumpForward(): void {
        this.goTo(this.currentPage + 10);
    }

    onSpinnerBlur(): void {
        this.goTo(this.currentPage);
    }

    get pagesBefore(): number[] {
        if (this.currentPage <= 3) {
            return [1, 2, 3].filter(p => p < this.currentPage);
        }

        return [this.currentPage - 2, this.currentPage - 1];
    }

    get pagesAfter(): number[] {
        const result: number[] = [];

        for (let p = this.currentPage + 1; p <= Math.min(this.totalPages, this.currentPage + 2); p++) {
            result.push(p);
        }

        return result;
    }
}
