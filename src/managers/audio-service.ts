import { AudioPlayer, createAudioResource, joinVoiceChannel, StreamType, VoiceConnection } from "@discordjs/voice";
import { Guild, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { Sound } from "types/sound";
import { YtDlp } from "ytdlp-nodejs";
import prism from "prism-media";

type Props = {
  guild: Guild,
  stateChangeAny: (status: string) => void,
  stateChangeBuff: () => void,
  stateChangeIdle: () => void,
  stateChangePlaying: () => void
};

export default class AudioService {
  private ytdlp: YtDlp = new YtDlp();
  private connection: VoiceConnection | null = null;
  private player: AudioPlayer;
  private isPlaying: boolean = false;
  private lastTimePlayed: number | null = null;
  private voiceChannel?: VoiceBasedChannel;
  private guild: Guild;
  private props: Props;
  private queueStarted: boolean = false;

  constructor(props: Props) {
    this.props = props;
    this.guild = props.guild;
    this.player = new AudioPlayer();

    this.player.on('stateChange', async (oldState, newState) => {
      if (oldState.status !== newState.status) {
        props.stateChangeAny(newState.status);
      }

      switch (newState.status) {
        case 'idle':
          this.isPlaying = false;
          props.stateChangeIdle();
          break;
        case 'buffering':
          props.stateChangeBuff();
          break;
        case 'playing':
          this.isPlaying = true;
          props.stateChangePlaying();
          break;
      }
    });
  }

  public getVoiceChannel(): Readonly<VoiceBasedChannel | null> {
    return this.voiceChannel ?? null;
  }

  public getQueStarted(): Readonly<boolean> {
    return this.queueStarted;
  }
  public setQue(value: boolean) {
    this.queueStarted = value;
  }

  async makeConnection(voiceChannel: VoiceBasedChannel) {
    if (this.connection && this.voiceChannel?.id === voiceChannel.id) return this.connection;

    this.voiceChannel = voiceChannel;

    this.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: this.guild.id,
      adapterCreator: this.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    this.connection.subscribe(this.player);

    return this.connection;
  }

  public getStatus() {
    return this.player.state.status;
  }

  public getPlayingTime() {
    if (this.lastTimePlayed === null)
      return 0;

    return (Date.now() - this.lastTimePlayed) / 1000;
  }

  async setupSound(sound: Sound) {
    if (!this.player || !this.connection) return;

    try {
      const stream = this.ytdlp.stream(sound.url, {
        format: "bestaudio[ext=webm][acodec=opus]/bestaudio",
        // noCookies: false,
        // ageLimit: 18,
        // cookies: "/home/undefined/Projects/shizik-bot/cookies.txt"
      });

      console.log(stream);

      const opusStream = stream.pipe(new prism.opus.WebmDemuxer());

      const resource = createAudioResource(opusStream as any, {
        inputType: StreamType.Opus,
      });

      this.player.play(resource);
      this.connection.subscribe(this.player);

      this.isPlaying = true;
      this.lastTimePlayed = Date.now();

      await stream.promise;
    } catch (err) {

    }
  }

  public skip() {
    this.player.stop();
  }
}
