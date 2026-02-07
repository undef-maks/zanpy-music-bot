import { Sound } from "types/sound";
import { IQueueService } from "./queue.service.i";
import { RawSound } from "adapters/adapter.interface";

export class QueueService implements IQueueService {
  private _sounds: RawSound[] = [];

  get sounds(): RawSound[] {
    return [...this._sounds];
  }

  append(sound: RawSound | RawSound[]): void {
    if (Array.isArray(sound)) {
      this._sounds.push(...sound);
    } else {
      this._sounds.push(sound);
    }
  }

  skip(all: boolean = false): void {
    if (all) {
      this._sounds = [];
    } else {
      this._sounds.shift();
    }
  }

  next(): RawSound | void {
    return this._sounds.shift();
  }

  peek(offset: number = 0): RawSound | null {
    return this._sounds[offset] || null;
  }

  peekAll(): RawSound[] {
    return this.sounds;
  }
}
