import { Sound } from "types/sound";

type Error = {
  message: string;
};

export interface Adapter {
  isError: (obj: any) => boolean,
  search: (query: string) => Promise<Sound[] | Error>;
  searchByUrl: (url: string) => Promise<Sound[] | Error>;
};
