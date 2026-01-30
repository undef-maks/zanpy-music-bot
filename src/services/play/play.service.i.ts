import { ChatInputCommandInteraction, Guild } from "discord.js";
import { PlayPlatform } from "types/platforms";


export type PlayServiceResponse =
  | { status: 'success'; message?: string }
  | { status: 'error'; message: string; code?: string };

export interface IPlayService {
  readonly guild: Guild;
  readonly isConnected: boolean;

  skip(): PlayServiceResponse;
  continue(): PlayServiceResponse;
  pause: () => PlayServiceResponse;
  play(platform: PlayPlatform, prompt: string): Promise<PlayServiceResponse>;
  isUrl: (text: string) => PlayPlatform | null;

  destroy: () => void;
};
