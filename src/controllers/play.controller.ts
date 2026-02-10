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

export type NamespaceHandler = (guildId: string, action: string, interaction: Interaction, service: PlayService, interactionType: "button" | "select") => Promise<void>;

export interface ControllerResponse {
  success: boolean;
  message?: string;
}

const soundAdapters: Record<PlayPlatform, SoundAdapter> = {
  youtube: new YtSoundAdapter(),
  soundcloud: new YtSoundAdapter()
};

class PlayController {
  private services: Record<string, PlayService> = {};
  private namespaces: Record<string, NamespaceHandler> = {
    player: async (gid, action, i, service, interactionType: "button" | "select") => {
      if (interactionType === "button") PlayerButtons.execute(action, service);
      else if (interactionType === "select") console.log("select");
    }
  };

  public async handleInteraction(guild: Guild, namespace: string, action: string, interaction: Interaction): Promise<ControllerResponse> {
    const service = this.getService(guild.id);
    if (!service) {
      return { success: false, message: "Inactive session" };
    }

    const interactionType = interaction.isButton() ? "button" : "select";

    if (interaction.isButton())
      await interaction.deferUpdate();

    if (this.namespaces[namespace]) {
      await this.namespaces[namespace](guild.id, action, interaction, service, interactionType);
      return { success: true };
    }

    return { success: false, message: "Namespace not found" };
  }

  public async play(prompt: string, member: GuildMember, voiceChannel: VoiceChannel, textChannel: TextChannel): Promise<ControllerResponse> {
    const guild = member.guild;
    let service = this.getService(guild.id);

    if (!service) {
      service = await this.createNewService(guild, voiceChannel, textChannel);
    }

    if (!service) {
      return { success: false, message: "Failed to initialize audio service" };
    }

    try {
      await service.play("youtube", prompt);
      return { success: true };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : "Playback error" };
    }
  }

  public async skip(guildId: string, all: boolean = false): Promise<ControllerResponse> {
    const service = this.getService(guildId);
    if (!service) {
      return { success: false, message: "No active service found" };
    }

    service.skip(all);
    return { success: true };
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
