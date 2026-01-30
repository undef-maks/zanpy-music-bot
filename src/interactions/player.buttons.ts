import { IPlayService, PlayServiceResponse } from "services/play/play.service.i";

export const PlayerButtons = {
  namespace: 'player',

  async execute(action: string, playService: IPlayService) {
    const handlers: Record<string, () => Promise<PlayServiceResponse>> = {
      'skip': async () => playService.skip(),
      // 'pause': async () => playService.togglePause(),
      // 'stop': async () => playService.destroy(),
    };

    if (handlers[action]) {
      await handlers[action]();
    }
  }
}
