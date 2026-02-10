import { AudioPlayerStatus } from "@discordjs/voice";
import { RawSound } from "adapters/adapter.interface";
import { Message } from "discord.js";
import { Sound } from "types/sound";

export type UIViewMode = 'player' | 'list';
export type AudioStatus = 'playing' | 'buffering' | 'paused' | 'idle';

export interface IUIService {
  updateView(current: RawSound, queue: RawSound[], status?: AudioPlayerStatus): Promise<void>;

  setMode(mode: UIViewMode): void;

  showAddedToQueue(sound: RawSound | RawSound[]): Promise<void>;

  showError(message: string): Promise<void>;

  removeInterface(): Promise<void>;

  showSoundSelect(sound: RawSound[], selectCb: (sound: RawSound) => void): Promise<void>;
};
