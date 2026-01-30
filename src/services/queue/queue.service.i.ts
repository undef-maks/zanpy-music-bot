import { Sound } from "types/sound";

export interface IQueueService {
  readonly sounds: Sound[];

  append(sound: Sound | Sound[]): void;
  skip(all: boolean): void;
  next(): Sound | void;
  peek(offset: number): Sound | null;
  peekAll(): Sound[];
};
