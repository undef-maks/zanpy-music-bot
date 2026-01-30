import { VoiceChannel } from "discord.js";
import { IAudioService } from "./audio.service.i";
import { AudioPlayer, AudioPlayerState, AudioPlayerStatus, createAudioResource, entersState, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionStatus } from "@discordjs/voice";
import { Sound } from "types/sound";
import { YtDlp } from "ytdlp-nodejs";
import prism from "prism-media";

export class AudioService implements IAudioService {
  connection: VoiceConnection;
  player: AudioPlayer;
  isPaused: boolean = false;
  private ytdlp: YtDlp = new YtDlp();
  private onStatusChangeCallback?: (status: AudioPlayerStatus) => void;

  constructor(readonly voiceChannel: VoiceChannel) {
    this.player = new AudioPlayer();
    this.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    this.connection.subscribe(this.player);

    this.player.on("stateChange", (a, b) => {
      if (this.onStatusChangeCallback)
        this.onStatusChangeCallback(b.status);
    });
  }

  subscribeStatusChange(cb: (status: AudioPlayerStatus) => void) {
    this.onStatusChangeCallback = cb;
  }

  public static async create(voiceChannel: VoiceChannel): Promise<AudioService> {
    const instance = new AudioService(voiceChannel);

    return new Promise((resolve, reject) => {
      instance.connection.once(VoiceConnectionStatus.Ready, () => {
        resolve(instance);
      });

      setTimeout(() => reject(new Error("Voice connection timeout")), 10_000);

      instance.connection.once(VoiceConnectionStatus.Destroyed, () => reject());
    });
  }

  public stop(): void {
    this.player.stop(true);
  }

  public pause(): void {
    if (this.player.state.status !== AudioPlayerStatus.Paused) {
      this.player.pause();
      this.isPaused = true;
    }
  }

  public resume(): void {
    if (this.player.state.status === AudioPlayerStatus.Paused) {
      this.player.unpause();
      this.isPaused = false;
    }
  }

  public play(sound: Sound): void {
    switch (sound.from) {
      case "youtube": this.playYoutube(sound.url); break;
      case "soundcloud": this.playSoundcloud(sound.url); break;
    }
  }

  private async playYoutube(url: string) {
    try {
      const stream = this.ytdlp.stream(url, {
        format: "bestaudio[ext=webm][acodec=opus]/bestaudio/best",
        additionalOptions: ["--no-playlist"]
      });

      const demuxer = new prism.opus.WebmDemuxer();
      const opusStream = stream.getStream().pipe(demuxer);

      const resource = createAudioResource(opusStream, {
        inputType: StreamType.Opus,
        inlineVolume: false,
      });

      this.player.play(resource);
    } catch (err) {
      console.error(err);
    }
  }
  private playSoundcloud(url: string): void { }

  destroy(): void {
    this.stop();
    this.connection.destroy();
    this.player.removeAllListeners();
  }
}
