import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";

@Service()
export class StatTypesService {
    private apiUrl = "http://localhost:3000/discriminents";

    private readonly _http: HttpClient = inject(HttpClient);

    getStat<T>(_type:string) {
        return this._http.get<T>(`${this.apiUrl}/${_type}`);
    }
}
