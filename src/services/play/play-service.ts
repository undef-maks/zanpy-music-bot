import { PlayPlatform } from "types/platforms";
import { IPlayService, PlayServiceResponse } from "./play.service.i";
import { RawSound, SoundAdapter } from "adapters/adapter.interface";
import { Sound } from "types/sound";
import { ChatInputCommandInteraction, Guild } from "discord.js";
import { IAudioService } from "services/audio/audio.service.i";
import { IQueueService } from "services/queue/queue.service.i";
import { AudioPlayerStatus } from "@discordjs/voice";
import { IUIService } from "services/ui/ui.service.i";
import { parseResourceUrl } from "@core/url-parser";

export class PlayService implements IPlayService {
  isConnected: boolean = false;
  status: AudioPlayerStatus = AudioPlayerStatus.Idle;

  constructor(
    private adapters: Record<PlayPlatform, SoundAdapter>,
    readonly guild: Guild,
    private audio: IAudioService,
    private queue: IQueueService,
    private ui: IUIService
  ) {
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
  };

  private async updateUI() {
    const current = this.queue.peek(0);
    console.log(current);
    if (current) {
      await this.ui.updateView(current, this.queue.peekAll().slice(1), this.status);
    }
  }

  async play(platform: PlayPlatform, prompt: string): Promise<PlayServiceResponse> {
    const adapter = this.adapters[platform];
    const parsedPrompt = parseResourceUrl(prompt);
    const adapterRes = parsedPrompt
      ? await adapter.searchByResource(parsedPrompt)
      : await adapter.search(prompt);

    if (typeof adapterRes === "string") return { status: "error", message: adapterRes };

    if (adapterRes.type === "sound") {
      this.queue.append(adapterRes.sound);
    } else if (adapterRes.type === "playlist") {
      this.queue.append(adapterRes.sounds);
    } else if (adapterRes.type === "sounds") {
      await this.ui.showSoundSelect(adapterRes.sounds, (sound: RawSound) => this.playPrior(sound));
    }

    if (this.audio.player.state.status === AudioPlayerStatus.Idle) {
      this.audio.play(this.queue.sounds[0]);
    } else {
      await this.updateUI();
    }

    return {
      status: "success",
      message: `Added tracks to queue`
    };
  }

  private async playPrior(sound: RawSound) {
    this.queue.append(sound);

    if (this.audio.player.state.status === AudioPlayerStatus.Idle) {
      this.audio.play(this.queue.sounds[0]);
    } else {
      await this.updateUI();
    }
  }

  destroy(): PlayServiceResponse {
    this.audio.player.stop();
    this.ui.removeInterface();
    return { status: "success", message: "Player destroyed and interface removed" };
  }

  pause(): PlayServiceResponse {
    const isPaused = this.audio.player.pause();
    if (!isPaused) {
      this.audio.player.unpause();
    }
    this.updateUI();
    return { status: "success", message: "Playback state toggled" };
  }

  skip(all?: boolean): PlayServiceResponse {
    if (all) {
      this.queue.skip(true);
    }

    const success = this.audio.player.stop();
    return {
      status: success ? "success" : "error",
      message: success ? "Track skipped" : "Failed to skip track"
    };
  }

  continue(): PlayServiceResponse {
    const success = this.audio.player.unpause();
    this.updateUI();
    return {
      status: success ? "success" : "error",
      message: success ? "Playback continued" : "Failed to continue playback"
    };
  }

  async changeViewMode(view: 'player' | 'list'): Promise<PlayServiceResponse> {
    this.ui.setMode(view);
    await this.updateUI();
    return { status: "success", message: `View mode changed to ${view}` };
  }

  isUrl(text: string): PlayPlatform | null {
    const youtubeRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/;
    const soundcloudRegex = /^(https?:\/\/)?(www\.)?(soundcloud\.com)\/.+$/;

    if (youtubeRegex.test(text)) return "youtube";
    if (soundcloudRegex.test(text)) return "soundcloud";

    return null;
  }
}




