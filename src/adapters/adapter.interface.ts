import { Sound } from "types/sound";



export interface SoundAdapter {
  isError: (obj: any) => boolean,
  search: (query: string) => Promise<Sound[] | string>;
  searchByUrl: (url: string) => Promise<Sound[] | string>;
};
