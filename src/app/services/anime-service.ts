import { inject, Service } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AnimeRegistry } from "../models/anime-registry";
import { Observable } from "rxjs";

@Service()
export class AnimeService {
    private apiUrl = "http://localhost:3000/anime";

    private readonly _http = inject(HttpClient);

    getCards(event: any): Observable<AnimeRegistry> {
        console.log(event);

        const limit = event.pageSize;
        const page = event.pageIndex;

        const genres = event.genres ? [...event.genres] : [];
        genres.push("-hentai");

        return this._http.post<AnimeRegistry>(this.apiUrl, { ...event, limit, page, genres });
    }
}
