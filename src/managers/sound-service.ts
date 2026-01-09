import { getBotUser } from "@core/get-bot-user";
import { isYoutubeUrl } from "@core/is-url";
import { getSaveSound } from "@core/save-sound";
import { BotUser } from "@models/bot-user.model";
import { ISound } from "@models/sound.model";
import { Adapter } from "adapters/adapter.interface";
import { YoutubeSoundAdapter } from "adapters/youtube-sound.adapter";
import { YtSoundAdapter } from "adapters/yt.adapter";
import { User } from "discord.js";
import { Sound } from "types/sound";

export default class SoundService {
  private playList: Sound[] = [];
  private playIndex: number = 0;
  private youtubeAdapter: Adapter;

  constructor() {
    this.youtubeAdapter = new YtSoundAdapter();
  }

  public getPlayIndex(): Readonly<number> {
    return this.playIndex;
  }

  public getPlaylist(): Readonly<Sound[]> {
    return this.playList;
  }

  public peek(offset = 0): Sound | null {
    const item = this.playList[offset + this.playIndex];

    return item ?? null;
  }

  private async addUserHistorySound(sound: ISound, user: User) {
    const botUser = await getBotUser(user);
    botUser.historySounds.push(sound);
    botUser.save();
  }

  public async like(index: number, user: User) {
    const sound = this.playList[index];

    if (!sound) return;
    if (!sound.id) return;

    const botUser = await getBotUser(user);
    const dbSound = await getSaveSound(sound);

    const exists = await BotUser.exists({
      _id: botUser._id,
      favorite: sound.id
    });

    if (exists) return;

    botUser.favorite.push(dbSound);
    await botUser.save();
  }

  public async appendSounds(sounds: Sound[], user: User) {
    const result: Sound[] = [];

    for (const s of sounds) {
      const dbSound = await getSaveSound(s);
      const newSound = { ...s, id: dbSound.id, addedBy: user };
      this.playList.push(newSound);
      result.push(newSound);

      this.addUserHistorySound(dbSound, user);

      console.log(`Adding sound ${dbSound.id} ${dbSound.name}`);
    }

    return result;
  }

  public consume() {
    this.playIndex++;
  }

  public async youtubeSearch(payload: string) {
    let data;

    if (isYoutubeUrl(payload)) {
      data = await this.youtubeAdapter.searchByUrl(payload);
    } else {
      data = await this.youtubeAdapter.search(payload);
    }

    if (this.youtubeAdapter.isError(data)) return [];

    return data as Sound[];
  }
}
