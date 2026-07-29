import { RegistryItem } from "./models/anime-registry";

export type Paginator = {
  pageIndex: number,
  pageSize: number,
}

export interface AnimeCardDetails {
  malId: number;
  title: string;
  imageUrl: string;

  loading?: boolean;
  loaded?: boolean;
  flipped?: boolean;

  details?: RegistryItem;
}
