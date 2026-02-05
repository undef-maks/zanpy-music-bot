import { IPlayService, PlayServiceResponse } from "services/play/play.service.i";

export const PlayerButtons = {
  namespace: 'player',

  async execute(action: string, playService: IPlayService) {
    const handlers: Record<string, () => Promise<PlayServiceResponse>> = {
      'skip': async () => playService.skip(),
      'show-list': async () => playService.changeViewMode("list"),
      'show-player': async () => playService.changeViewMode("player"),
      'pause': async () => playService.pause()
      // 'stop': async () => playService.destroy(),
    };

    if (handlers[action]) {
      await handlers[action]();
    }
  }
}
