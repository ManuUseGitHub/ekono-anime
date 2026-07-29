export interface AnimeFilter {
  approved?: boolean;
  types?: string[];
  sources?: string[];
  airing?: boolean;
  seasons?: string[];
  years?: number[];
  genres?: string[];
  themes?: string[];
  rating?: string[];

  // pagination
  pageIndex?: number;
  pageSize?: number;
  length?:number;
}

export const defaultAnimeFilterIndexed = {
  approved: undefined as number | undefined,
  types: undefined as number[] | undefined,
  sources: undefined as number[] | undefined,
  airing: undefined as number | undefined,
  seasons: undefined as number[] | undefined,
  years: undefined as number[] | undefined,
  genres: undefined as number[] | undefined,
  themes: undefined as number[] | undefined,
  rating: undefined as number[] | undefined,

  // pagination
  pageIndex: undefined as number | undefined,
  pageSize: undefined as number | undefined,
  length: undefined as number | undefined,
};

export type AnimeFilterIndexed = typeof defaultAnimeFilterIndexed;
