export type RegistryItem = {
    url: string;
    malId: number;
    imageUrl: string;
    largeImageUrl: string;
    importedAt: string;
    approved: boolean;
    title: string;
    type: string;
    source: string;
    airing: boolean;
    aired_from: string;
    aired_to: any;
    rating: string;
    score: number;
    scored_by: number;
    rank: number;
    popularity: number;
    members: number;
    favorites: number;
    synopsis: string;
    season: string;
    year: number;
    genres: string;
    themes: string;
};
export interface AnimeRegistry {
    data: [RegistryItem];
    meta: {
        page: number;
        limit: number;
        count: number;
        pages: number;
        total: number;
    };
}

export interface GenreItem {
    genre: string;
    animeCount: number;
}

export interface GenresRegistry {
    data: [GenreItem];
}

export interface TypeItem {
    type: boolean;
    animeCount: number;
}

export interface SeasonRegistry {
    data: [SeasonItem];
}

export interface SourceItem {
    source: boolean;
    animeCount: number;
}

export interface SourceRegistry {
    data: SourceItem[];
}

export interface SeasonItem {
    season: boolean;
    animeCount: number;
}

export interface TypeRegistry {
    data: [TypeItem];
}

export interface AiringItem {
    airing: boolean;
    animeCount: number;
}

export interface AiringRegistry {
    data: [AiringItem];
}

export interface ApprovedItem {
    approved: boolean;
    animeCount: number;
}

export interface ApprovedRegistry {
    data: [ApprovedItem];
}

export interface ThemeItem {
    theme: string;
    animeCount: number;
}

export interface ThemesRegistry {
    data: [ThemeItem];
}

export interface YearItem {
    year: string;
    animeCount: number;
}

export interface YearRegistry {
    data: [YearItem];
}

export interface RatingItem {
    rating: string;
    animeCount: number;
}

export interface RatingRegistry {
    data: [RatingItem];
}
