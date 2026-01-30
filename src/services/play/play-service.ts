import { PlayPlatform } from "types/platforms";
import { IPlayService, PlayServiceResponse } from "./play.service.i";
import { SoundAdapter } from "adapters/adapter.interface";
import { Sound } from "types/sound";
import { ChatInputCommandInteraction, Guild } from "discord.js";
import { IAudioService } from "services/audio/audio.service.i";
import { IQueueService } from "services/queue/queue.service.i";
import { AudioPlayerStatus } from "@discordjs/voice";
import { IUIService } from "services/ui/ui.service.i";

export class PlayService implements IPlayService {
  isConnected: boolean = false;
  status: AudioPlayerStatus = AudioPlayerStatus.Idle;

  constructor(private adapters: Record<PlayPlatform, SoundAdapter>,
    readonly guild: Guild,
    private audio: IAudioService,
    private queue: IQueueService,
    private ui: IUIService) {
    audio.subscribeStatusChange(this.onPlayerStatusChange);
  }

  onPlayerStatusChange = (status: AudioPlayerStatus) => {
    this.status = status;
    if (status === AudioPlayerStatus.Idle) {
      this.queue.next();
      const sound = this.queue.peek(0);
      if (sound) {
        this.audio.play(sound);
      } else {
        this.ui.removeInterface();
      }
    }
    this.updateUI();
  }

  private async updateUI() {
    const current = this.queue.peek(0);

    if (current) {
      await this.ui.updateView(current, this.queue.peekAll().slice(1), this.status);
    }
  }

  async play(platform: PlayPlatform, prompt: string): Promise<PlayServiceResponse> {
    const adapter = this.adapters[platform];
    const isUrl = this.isUrl(prompt);

    const adapterRes = isUrl
      ? await adapter.searchByUrl(prompt)
      : await adapter.search(prompt);

    if (typeof adapterRes === "string") {
      await this.ui.showError(adapterRes);
      return { status: "error", message: adapterRes };
    }

    const tracks = Array.isArray(adapterRes) ? adapterRes : [adapterRes];

    tracks.forEach(track => this.queue.append(track));
    await this.ui.showAddedToQueue(tracks.length > 1 ? tracks : tracks[0]);

    if (this.audio.player.state.status === AudioPlayerStatus.Idle) {
      this.audio.play(tracks[0]);
    } else {
      await this.updateUI();
    }

    return { status: "success", message: `Додано: **${tracks[0].name}**` };
  }

  destroy() { };

  pause(): PlayServiceResponse {
    const isPaused = this.audio.player.pause();
    if (!isPaused) {
      this.audio.player.unpause();
    }
    this.updateUI();
    return { status: "success", message: "Пауза/Відтворення" };
  }

  skip(): PlayServiceResponse {
    this.audio.player.stop();
    return { status: "error", message: "nothing" };
  }

  continue(): PlayServiceResponse {
    this.audio.player.unpause();
    this.updateUI();
    return { status: "error", message: "nothing" };
  }

  isUrl(text: string): PlayPlatform | null {
    const youtubeRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/;
    const soundcloudRegex = /^(https?:\/\/)?(www\.)?(soundcloud\.com)\/.+$/;

    if (youtubeRegex.test(text)) {
      return "youtube";
    }

    if (soundcloudRegex.test(text)) {
      return "soundcloud";
    }

    return null;
  };
}
