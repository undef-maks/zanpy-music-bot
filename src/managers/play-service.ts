import { ButtonInteraction, ChatInputCommandInteraction, Guild, GuildMember, TextChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";
import AudioService from "./audio-service";
import SoundService from "./sound-service";
import UIService from "./ui-service";
import { Sound } from "types/sound";
import BalanceService from "./balance-service";

const balanceService = BalanceService.getInstance();

export default class PlayService {
  private uiService: UIService;
  private soundService: SoundService;
  private audioService: AudioService;
  private textChannel: TextChannel;
  private guild: Guild;
  private id: number;

  constructor(guild: Guild, textChannel: TextChannel) {
    this.guild = guild;
    this.textChannel = textChannel;
    this.id = Math.round(Math.random() * 100000);
    this.soundService = new SoundService();
    this.audioService = new AudioService({
      stateChangeBuff: this.onBuff,
      stateChangeAny: this.onChangeStatus,
      stateChangeIdle: this.onIdle,
      stateChangePlaying: this.onPlaying,
      guild: this.guild
    });
    this.uiService = new UIService({ channel: this.textChannel });
  }


  public async play(interaction: ChatInputCommandInteraction, payload: string) {
    const { user, member } = interaction;
    if (!member) return interaction.editReply("Failed.");

    const channel = this.getVoiceChannel(member as GuildMember);
    if (!channel) return interaction.editReply("Failed. Join voice channel.");

    const connection = this.audioService.makeConnection(channel);
    if (!connection) return interaction.editReply("Failed. Can't connect to your voice");

    const searchData = await this.soundService.youtubeSearch(payload);

    if (searchData.length === 0) return interaction.editReply("Failed. Nothing found.");

    if (searchData.length === 1) {
      await this.soundService.appendSounds(searchData, user);
      this.firstSetup();
      interaction.editReply(`Добавлено ${searchData[0].name}`);
    } else {
      this.uiService.searchYoutubeInteraction(interaction, searchData, async (s: Sound) => {
        await this.soundService.appendSounds([s], user)
        this.firstSetup();
        await this.updateMessage();
      });
    }

    let message = this.uiService.message;

    if (!message)
      message = await this.sendPlayerMessage();
    if (message) {
      this.uiService.message = message;
    }

    this.updateMessage();
  }

  private firstSetup() {
    if (this.audioService.getQueStarted()) return;

    const sound = this.soundService.peek();
    if (sound)
      this.audioService.setupSound(sound);

    this.audioService.setQue(true);
  }

  private async updateMessage() {
    this.uiService.updateMessage({
      playIndex: this.soundService.getPlayIndex(),
      audioStatus: this.audioService.getStatus(),
      playList: this.soundService.getPlaylist(),
      nextTrack: this.soundService.peek(1),
      nowPlaying: this.soundService.peek()
    })
  }

  private async sendPlayerMessage() {
    const message = await this.textChannel.send("Player message");
    return message;
  }

  private getVoiceChannel(member: GuildMember): VoiceBasedChannel | null {
    const channel = member.voice.channel;

    return channel ?? null;
  }

  private onChangeStatus = (status: string) => {
  }

  public buttonClick(interaction: ButtonInteraction) {
    switch (interaction.customId) {
      case "change-window":
        this.uiService.switchScreen();
        this.updateMessage();
        interaction.deferUpdate();
        break;
      case "sound-skip":
        this.audioService.skip();
        interaction.deferUpdate();
        break;
      case "like":
        this.soundService.like(this.soundService.getPlayIndex(), interaction.user);
        interaction.deferUpdate();
        break;
    }
  }

  private onIdle = () => {
    const voiceChannel = this.audioService.getVoiceChannel();
    if (voiceChannel) {
      const soundCost = this.audioService.getPlayingTime() * 0.1;
      voiceChannel.members.forEach(member => {
        if (!member.user.bot)
          balanceService.addBalance(member.user, soundCost);
      })
    }

    this.soundService.consume();
    const newSound = this.soundService.peek();

    if (newSound) {
      this.audioService.setupSound(newSound);
    } else {
      this.audioService.setQue(false);
    }

    this.updateMessage();
  }

  private onPlaying = () => {
    this.updateMessage();
  }

  private onBuff = () => {
    this.updateMessage();
  }
}
