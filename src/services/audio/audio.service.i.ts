import { AudioPlayer, AudioPlayerState, AudioPlayerStatus, PlayerSubscription, VoiceConnection } from "@discordjs/voice";
import { VoiceChannel } from "discord.js";
import { Sound } from "types/sound";

export interface IAudioService {
  readonly voiceChannel: VoiceChannel;
  readonly connection: VoiceConnection;
  readonly player: AudioPlayer;

  play(sound: Sound): void;

  pause(): void;
  resume(): void;
  stop(): void;
  subscribeStatusChange(cb: (status: AudioPlayerStatus) => void): void;
  destroy(): void;
};
