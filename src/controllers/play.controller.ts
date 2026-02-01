import { Guild, GuildMember, Interaction, TextChannel, VoiceChannel } from "discord.js";
import { PlayService } from "../services/play/play-service";
import { PlayPlatform } from "types/platforms";
import { SoundAdapter } from "adapters/adapter.interface";
import { YtSoundAdapter } from "adapters/yt.adapter";
import { SoundcloudAdapter } from "adapters/sc.adapter";
import { AudioService } from "services/audio/audio.service";
import { QueueService } from "services/queue/queue.service";
import { UIService } from "services/ui/ui.service";
import { PlayerButtons } from "interactions/player.buttons";

export type NamespaceHandler = (guildId: string, action: string, interaction: Interaction, service: PlayService) => Promise<void>;
const soundAdapters: Record<PlayPlatform, SoundAdapter> = {
  youtube: new YtSoundAdapter(),
  soundcloud: new SoundcloudAdapter(),
}

class PlayController {
  private services: Record<string, PlayService> = {};
  private namespaces: Record<string, NamespaceHandler> = {
    player: async (gid, action, i, service) => {
      console.log(action)
      PlayerButtons.execute(action, service);
    }
  };

  public handleInteraction(guild: Guild, namespace: string, action: string, interaction: Interaction) {
    let service = this.getService(guild.id);

    if (!service) return "innactive button";

    this.namespaces[namespace](guild.id, action, interaction, service);
  }

  public async play(prompt: string, member: GuildMember, voiceChannel: VoiceChannel, textChannel: TextChannel) {
    const guild = member.guild;

    let service = this.getService(guild.id);
    if (!service) {
      service = await this.createNewService(guild, voiceChannel, textChannel);
    }

    if (service == null) return "Some problems";

    service.play("youtube", prompt);
  }

  public async skip(guildId: string) {
    const service = this.getService(guildId);
    if (!service) return { status: "error", message: "Can't found service" };

    service.skip();
    return { status: "success", message: "" };
  }

  private getService(guildId: string): PlayService | null {
    return this.services[guildId] ?? null;
  }

  private async createNewService(guild: Guild, voiceChannel: VoiceChannel, textChannel: TextChannel): Promise<PlayService | null> {
    try {
      const audioService = await AudioService.create(voiceChannel);
      const queueService = new QueueService();
      const uiService = new UIService(textChannel);
      const service = new PlayService(soundAdapters, guild, audioService, queueService, uiService);

      this.services[guild.id] = service;

      return service;
    } catch {
      return null;
    }
  }
}

export default new PlayController();
