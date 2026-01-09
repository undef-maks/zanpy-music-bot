import { getYoutubeVideoId } from "@core/is-url";
import { Sound } from "types/sound";
import yts, { VideoMetadataResult, VideoSearchResult } from "yt-search";
import { Adapter } from "./adapter.interface";

type Error = {
  message: string;
};

export class YoutubeSoundAdapter implements Adapter {
  public isError(obj: any): obj is Error {
    return obj && typeof obj.message === "string";
  }

  public createSound(data: VideoMetadataResult | VideoSearchResult): Sound | Error {
    const sound: Sound = {
      name: data.title,
      author: data.author.name,
      from: "youtube",
      iconUrl: data.thumbnail ?? "null",
      url: data.url,
      seconds: data.seconds
    };

    return sound;
  }

  public async search(query: string): Promise<Sound[] | Error> {
    try {
      const sounds: Sound[] = [];
      const request = await yts.search(query);
      const videos = request.videos.slice(0, 20);

      const mapped = videos.map(v => this.createSound(v));

      const soundsOnly = mapped.filter((s): s is Sound => !this.isError(s));
      sounds.push(...soundsOnly);

      return sounds;
    } catch (err) {
      return { message: "Error when search." };
    }
  }

  public async searchByUrl(url: string): Promise<Sound[] | Error> {
    const videoId = getYoutubeVideoId(url);
    if (!videoId) return { message: "Wrong video id" };

    const video = await yts.search({ videoId: videoId });

    if (!video) return { message: "Can't find this video" };

    const sound = this.createSound(video);

    if (this.isError(sound)) return { message: "Problem with sound generating" };

    return [sound];
  }
}
