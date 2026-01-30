import { Sound } from "types/sound";

export interface SoundAdapter {
  search: (query: string) => Promise<Sound[] | string>;
  searchByUrl: (url: string) => Promise<Sound[] | string>;
};
