import { Sound } from "types/sound";
import { Adapter } from "./adapter.interface";
import { GetListByKeyword, SearchItem } from "youtube-search-api";

export class YtSoundAdapter implements Adapter {
  public isError(obj: any): obj is Error {
    return obj && typeof obj.message === "string";
  }
  public createSound(data: SearchItem): Sound | Error {
    const sound: Sound = {
      name: data.title,
      author: data.channelTitle ?? "noname",
      from: "youtube",
      iconUrl: "null",
      url: this.makeUrl(data.id),
      seconds: 0
    };
    return sound;
  }

  async search(query: string): Promise<Sound[] | { message: string; }> {
    try {
      const data = await GetListByKeyword(query);
      const sounds = [];
      for (const searchItem of data.items) {
        const newSound = this.createSound(searchItem);
        if (this.isError(newSound)) continue;
        sounds.push(newSound);
      }
      return sounds;
    } catch (error) {
      return { message: "error" };
    }
  }
  async searchByUrl(url: string): Promise<Sound[] | { message: string; }> {
    return { message: "" };
  };

  private makeUrl(videoId: string) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
};
