import { Sound } from "types/sound";
import { PlaylistAdapterResponse, SingleSoundAdapterResponse, SoundAdapter, SoundsAdapterResponse } from "./adapter.interface";
import { GetListByKeyword, SearchItem, GetVideoDetails, VideoDetails, GetPlaylistData } from "youtube-search-api";
import { parseResourceUrl, ResourceInfo } from "@core/url-parser";

export class YtSoundAdapter implements SoundAdapter {
  public isError(obj: any): obj is Error {
    return obj && typeof obj.message === "string";
  }

  async search(query: string): Promise<SoundsAdapterResponse | string> {
    try {
      const data = await GetListByKeyword(query);
      const res: SoundsAdapterResponse = {
        sounds: [],
        type: "sounds"
      };

      for (const searchItem of data.items) {
        const { id, title, channelTitle } = searchItem;
        res.sounds.push({ id, title, author: channelTitle ?? "unknown", url: this.makeUrl(id), platform: "youtube" });
      }

      return res;
    } catch (error) {
      return "error";
    }
  }

  async searchByResource(info: ResourceInfo): Promise<SingleSoundAdapterResponse | PlaylistAdapterResponse | string> {
    try {
      if (!info.id) return "Unknown id";

      if (info.category == "video") {
        const res = await this.searchSingleSound(info.id);
        return res;
      }

      if (info.category == "playlist") {
        const res = await this.searchPlaylist(info.id);
        return res;
      }

      return "unknown category";
    } catch (error) {
      return "error";
    }
  };

  private async searchPlaylist(id: string): Promise<PlaylistAdapterResponse | string> {
    const data = await GetPlaylistData(id);

    if (!data) return `Error: can't parse ${id} playlist`;

    const title = data.metadata.playlistMetadataRenderer.title;

    return {
      type: "playlist",
      playlistId: id,
      playlistName: title,
      sounds: data.items.map(video => ({
        id: video.id,
        author: video.channelTitle ?? "unknown",
        title: video.title,
        url: this.makeUrl(video.id),
        platform: "youtube"
      }))
    };
  }

  private async searchSingleSound(id: string): Promise<SingleSoundAdapterResponse | string> {
    const data = await GetVideoDetails(id);

    if (!data) return `Error, can't parse ${id} video`;

    const { title, channel } = data;

    return {
      type: "sound",
      sound: { id, title, author: channel ?? "unknown", url: this.makeUrl(id), platform: "youtube" }
    }
  }

  private getVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);

    return match ? match[1] : null;
  };
  private makeUrl(videoId: string) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
};
