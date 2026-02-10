import { ResourceInfo } from "@core/url-parser";

export interface SoundAdapter {
  search: (query: string) => Promise<SoundsAdapterResponse | string>;
  searchByResource: (resourceInfo: ResourceInfo) => Promise<SingleSoundAdapterResponse | PlaylistAdapterResponse | string>;
};

export interface RawSound {
  title: string,
  author: string,
  id: string,
  url: string,
  platform: "youtube" | "soundcloud",
}

export interface AdapterResponse {
  type: "playlist" | "sounds" | "sound";
};

export interface PlaylistAdapterResponse extends AdapterResponse {
  type: "playlist";
  sounds: RawSound[];

  playlistId: string;
  playlistName: string;
}

export interface SoundsAdapterResponse extends AdapterResponse {
  type: "sounds";
  sounds: RawSound[]
}

export interface SingleSoundAdapterResponse extends AdapterResponse {
  type: "sound";
  sound: RawSound;
};
