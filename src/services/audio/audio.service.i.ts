import { AudioPlayer, AudioPlayerState, AudioPlayerStatus, PlayerSubscription, VoiceConnection } from "@discordjs/voice";
import { RawSound } from "adapters/adapter.interface";
import { VoiceChannel } from "discord.js";

export interface IAudioService {
  readonly voiceChannel: VoiceChannel;
  readonly connection: VoiceConnection;
  readonly player: AudioPlayer;

  play(sound: RawSound): void;

  pause(): void;
  resume(): void;
  stop(): void;
  subscribeStatusChange(cb: (status: AudioPlayerStatus) => void): void;
  destroy(): void;
};
