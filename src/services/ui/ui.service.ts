import { TextBasedChannel, Message, MessageEditOptions, MessageCreateOptions, TextChannel } from "discord.js";
import { Sound } from "types/sound";
import { MusicEmbeds } from "./embeds/music.embeds";
import { MusicComponents } from "./components/music.components";
import { IUIService } from "./ui.service.i";

export class UIService implements IUIService {
  private lastMessage?: Message;
  private viewMode: 'player' | 'list' = 'player';

  constructor(private readonly channel: TextChannel) { }

  public async updateView(current: Sound, queue: Sound[]) {
    const nextTrack = queue[0];

    const options = this.viewMode === 'player'
      ? {
        embeds: [MusicEmbeds.player(current, nextTrack)],
        components: [MusicComponents.playerRow()]
      }
      : {
        embeds: [MusicEmbeds.queueList(queue)],
        components: [MusicComponents.listRow()]
      };

    await this.sendOrEdit(options);
  }

  private async sendOrEdit(options: MessageEditOptions & MessageCreateOptions) {
    try {
      if (this.lastMessage) {
        return await this.lastMessage.edit(options);
      }

      this.lastMessage = await this.channel.send(options);
    } catch (err) {
      console.error("Не вдалося оновити UI:", err);
      this.lastMessage = undefined;
      await this.sendOrEdit(options);
    }
  }

  public async showError(message: string): Promise<void> {
    const errorMsg = await this.channel.send({
      embeds: [MusicEmbeds.error(message)]
    });

    setTimeout(() => errorMsg.delete().catch(() => { }), 7000);
  }

  public async removeInterface(): Promise<void> {
    if (this.lastMessage) {
      await this.lastMessage.delete().catch(() => { });
      this.lastMessage = undefined;
    }
  }

  public async showAddedToQueue(sound: Sound | Sound[]): Promise<void> {
    const addedMsg = await this.channel.send({
      embeds: [MusicEmbeds.addedToQueue(sound)]
    });

    setTimeout(() => addedMsg.delete().catch(() => { }), 5000);
  }

  public setMode(mode: 'player' | 'list') {
    this.viewMode = mode;
  }
}
