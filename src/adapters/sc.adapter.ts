import { Sound } from "types/sound";
import { PlaylistAdapterResponse, RawSound, SingleSoundAdapterResponse, SoundAdapter, SoundsAdapterResponse } from "./adapter.interface";
import { SoundCloud as scdl } from "scdl-core"
import { ResourceInfo } from "@core/url-parser";
import { env } from "../config/env";

export class SoundcloudAdapter implements SoundAdapter {
  constructor() {
    try {
      (scdl as any).clientId = env.SC_CLIENT_ID;

      scdl.connect().catch(e => {
      });
    } catch (err) {

    }
  }

  async search(query: string): Promise<SoundsAdapterResponse | string> {
    const data = await scdl.search({ query, limit: 15 });

    const sounds: RawSound[] = data.collection.map(s => {
      const title = (s as any).title;
      return {
        title: title as string ?? "uknown", author: "uknown", id: String(s.id), url: this.cleanUrl(s.permalink_url), platform: "soundcloud"
      }
    });

    if (sounds.length === 0) return "Not results";

    return {
      sounds: sounds,
      type: "sounds"
    }
  }


  async searchByResource(resourceInfo: ResourceInfo): Promise<SingleSoundAdapterResponse | PlaylistAdapterResponse | string> {
    if (resourceInfo.platform != "soundcloud") return "Soundcloud adapter only";

    if (resourceInfo.category == "video") {
      const result = await this.searchSingleSound(resourceInfo.url);
      return result;
    } else if (resourceInfo.category == "playlist") {
      const result = await this.searchPlaylist(resourceInfo.url);
      return result;
    }

    return "Undefined category";
  }

  async searchPlaylist(url: string): Promise<PlaylistAdapterResponse | string> {
    const data = await scdl.playlists.getPlaylist(url);

    if (!data) return "Resource not found";

    const sounds: RawSound[] = data.tracks.map(s => {
      const title = (s as any).title;
      return {
        title: title as string ?? "uknown", author: "uknown", id: String(s.id), url: this.cleanUrl(s.permalink_url), platform: "soundcloud"
      }
    });

    const result: PlaylistAdapterResponse = {
      playlistName: data.title,
      playlistId: String(data.id),
      type: "playlist",
      sounds: sounds
    };

    return result;
  }

  async searchSingleSound(url: string): Promise<SingleSoundAdapterResponse | string> {
    const s = await scdl.tracks.getTrack(url);
    if (!s) return "Track not found";

    const title = (s as any).title;

    const sound: RawSound = {
      title: title as string ?? "uknown", author: "uknown", id: String(s.id), url: this.cleanUrl(s.permalink_url), platform: "soundcloud"
    }

    return {
      type: "sound",
      sound: sound
    };
  }

  private cleanUrl(url: string) {
    return url.split("?")[0];
  }
};

