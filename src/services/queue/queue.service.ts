import { Sound } from "types/sound";
import { IQueueService } from "./queue.service.i";

export class QueueService implements IQueueService {
  private _sounds: Sound[] = [];

  get sounds(): Sound[] {
    return [...this._sounds];
  }

  append(sound: Sound | Sound[]): void {
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

  next(): Sound | void {
    return this._sounds.shift();
  }

  peek(offset: number = 0): Sound | null {
    return this._sounds[offset] || null;
  }

  peekAll(): Sound[] {
    return this.sounds;
  }
}
