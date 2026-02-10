import { TextBasedChannel, Message, MessageEditOptions, MessageCreateOptions, TextChannel, StringSelectMenuInteraction } from "discord.js";
import { Sound } from "types/sound";
import { MusicEmbeds } from "./embeds/music.embeds";
import { MusicComponents } from "./components/music.components";
import { IUIService } from "./ui.service.i";
import { RawSound } from "adapters/adapter.interface";

export class UIService implements IUIService {
  private lastMessage?: Message;
  private viewMode: 'player' | 'list' = 'player';

  constructor(private readonly channel: TextChannel) { }

  public async updateView(current: RawSound, queue: RawSound[]) {
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

  public async showSoundSelect(sounds: RawSound[], selectCb: (sound: RawSound) => void) {
    const msg = await this.channel.send({
      content: "Select you track.",
      components: [MusicComponents.selectSound(sounds.map(s => s.title))]
    });
    const collector = msg.createMessageComponentCollector({
      filter: (i) => i.isStringSelectMenu() && i.customId === 'sound-selection-menu',
      time: 30000
    });

    collector.on('collect', async (interaction: StringSelectMenuInteraction) => {
      const selectedTrack = interaction.values[0];
      const index = selectedTrack.split('-')[1];
      selectCb(sounds[Number(index)]);
      collector.stop();
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        await msg.edit({ content: "Час вибору вичерпано.", components: [] }).catch(() => null);
      }
    });
  }

  public async showAddedToQueue(sound: RawSound | RawSound[]): Promise<void> {
    const addedMsg = await this.channel.send({
      embeds: [MusicEmbeds.addedToQueue(sound)]
    });

    setTimeout(() => addedMsg.delete().catch(() => { }), 5000);
  }

  public setMode(mode: 'player' | 'list') {
    this.viewMode = mode;
  }
}
