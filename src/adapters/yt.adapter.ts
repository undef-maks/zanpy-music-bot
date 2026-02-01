import { Sound } from "types/sound";
import { SoundAdapter } from "./adapter.interface";
import { GetListByKeyword, SearchItem, GetVideoDetails, VideoDetails } from "youtube-search-api";

export class YtSoundAdapter implements SoundAdapter {
  public isError(obj: any): obj is Error {
    return obj && typeof obj.message === "string";
  }
  public createSound(data: SearchItem | VideoDetails): Sound | null {
    if (data.id.length > 15) return null;

    const sound: Sound = {
      name: data.title,
      author: "idk",
      from: "youtube",
      iconUrl: "null",
      url: this.makeUrl(data.id),
      seconds: 0
    };
    return sound;
  }

  async search(query: string): Promise<Sound[] | string> {
    try {
      const data = await GetListByKeyword(query);
      const sounds = [];
      for (const searchItem of data.items) {
        const newSound = this.createSound(searchItem);
        if (newSound === null) continue;
        sounds.push(newSound);
      }
      return sounds;
    } catch (error) {
      return "error";
    }
  }
  async searchByUrl(url: string): Promise<Sound[] | string> {
    try {
      const youtubeId = this.getVideoId(url);
      if (youtubeId === null)
        return "error url";

      const data = await GetVideoDetails(youtubeId);
      console.log(data);
      const sound = this.createSound(data);

      if (sound === null) return "error";
      return [sound];
    } catch (error) {
      return "error";
    }
  };

  private getVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);

    return match ? match[1] : null;
  };
  private makeUrl(videoId: string) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
};
