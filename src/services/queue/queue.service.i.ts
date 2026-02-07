import { RawSound } from "adapters/adapter.interface";

export interface IQueueService {
  readonly sounds: RawSound[];

  append(sound: RawSound | RawSound[]): void;
  skip(all: boolean): void;
  next(): RawSound | void;
  peek(offset: number): RawSound | null;
  peekAll(): RawSound[];
};
