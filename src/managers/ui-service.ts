import { EmojieData } from "@core/emojie.data";
import { formatTime } from "@core/format-time";
import { BotUser } from "@models/bot-user.model";
import { Playlist } from "@models/play-list.model";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, Message, ModalBuilder, ModalComponentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel, TextInputBuilder, TextInputStyle, User } from "discord.js";
import { Sound } from "types/sound";

type ConstructorProps = {
  channel: TextChannel
};

type UpdateMessageProps = {
  nowPlaying: Sound | null;
  nextTrack: Sound | null;
  playList: Readonly<Sound[]>;
  audioStatus: string;
  playIndex: number;
};

export default class UIService {
  message: Message | null = null;
  channel: TextChannel;
  screenState: "MUSIC" | "TURN" = "MUSIC";

  constructor(props: ConstructorProps) {
    this.channel = props.channel;
  }

  async updateMessage(props: UpdateMessageProps) {
    const maxTracksDisplay = 15;
    const { playList, nowPlaying, nextTrack, audioStatus, playIndex } = props;

    const totalTracks = playList.length;
    const nothingTodo = !nowPlaying;
    const visibleTracks = playList.slice(0, maxTracksDisplay);
    const soundsList = this.getSoundsList(visibleTracks, playIndex);

    const extraTracks =
      totalTracks > maxTracksDisplay
        ? `\n\n_…та ще **${totalTracks - maxTracksDisplay}** треків_`
        : "";

    const color = 0x038cfc;
    const embed = new EmbedBuilder()
      .setColor(color)
      .setDescription("Nothing todo...");

    if (!nothingTodo) {
      embed
        .setURL(nowPlaying.url)
        .setTitle(nowPlaying.name)
      // .setThumbnail(nowPlaying.iconUrl)

      if (nowPlaying.addedBy) {
        embed.setAuthor({
          name: nowPlaying.addedBy.displayName,
          iconURL: nowPlaying.addedBy.avatarURL() ?? nowPlaying.iconUrl,
        });
      }
    }

    const row = new ActionRowBuilder<ButtonBuilder>();

    switch (this.screenState) {
      case "TURN": {
        embed.setDescription(soundsList + extraTracks);

        row.addComponents(
          new ButtonBuilder()
            .setCustomId("change-window")
            .setLabel("Player")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("sound-skip")
            .setLabel("Skip")
            .setStyle(ButtonStyle.Danger)
        );
        break;
      }

      case "MUSIC": {
        if (nothingTodo) {
          embed.setDescription("Nothing todo...\nДодай музику через **/play**");
        } else {
          const time = formatTime(nowPlaying.seconds);
          const statusInfo = this.getPlayStatusInfo(audioStatus);
          const content = `**Next:** ${nextTrack ? nextTrack.name : "Пусто"}`;
          embed.setDescription(content);

          embed.addFields(
            {
              name: `<${EmojieData.hourglass}> Час`,
              value: `${time.hours}h ${time.minutes}m ${time.seconds}s`,
              inline: true,
            },
            {
              name: `<${EmojieData.diamond2}> Канал`,
              value: nowPlaying.author,
              inline: true,
            },
            {
              name: `<${EmojieData.diamond1}> Статус`,
              value: statusInfo,
              inline: true,
            }
          );
        }

        row.addComponents(
          new ButtonBuilder()
            .setCustomId("change-window")
            .setLabel("Turn")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("like")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Like")
            .setEmoji(EmojieData.like),
          new ButtonBuilder()
            .setCustomId("sound-skip")
            .setLabel("Skip")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("playlist-save")
            .setLabel("Save to")
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId("playlist-play")
            .setLabel("Add Playlist")
            .setStyle(ButtonStyle.Primary)
        );
        break;
      }

      default: {
        embed.setDescription("Nothing to display");
        break;
      }
    }

    if (this.message) {
      await this.message.edit({ embeds: [embed], components: [row] });
    }
  }

  public async showChoosePlaylist(interaction: ButtonInteraction) {
    const lists = await Playlist.find({});
    const options: StringSelectMenuOptionBuilder[] = [];

    for (const [index, list] of lists.entries()) {
      const { name, createdBy } = list;
      console.log(name, createdBy, index);

      const botUser = await BotUser.findOne({ _id: createdBy });

      options.push(
        new StringSelectMenuOptionBuilder()
          .setLabel(name)
          .setEmoji(EmojieData.diamond1)
          .setValue(`${index}`)
          .setDescription(`Created by: ${botUser?.nickname ?? "Unknown"}.`)
      );
    }

    if (options.length === 0) {
      return interaction.reply({
        content: "❌ Немає жодного доступного плейлиста.",
        ephemeral: true,
      });
    }

    if (options.length > 25) {
      options.splice(25);
    }

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("selector_2")
      .setPlaceholder("Виберіть плейлист")
      .setOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const message = await interaction.reply({ components: [row], fetchReply: true });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 178_000,
    });

    collector.on("collect", async (i) => {
      const selection = i.values[0];
      const choosed = lists[Number(selection)];

      await i.deferUpdate();
      if (!choosed) return;

      console.log(`✅ Вибрано: ${choosed.name}`);

      await i.followUp({
        content: `🎶 Ти вибрав плейлист **${choosed.name}**`,
        ephemeral: true,
      });
    });

    collector.on("end", async () => {
      try {
        await message.delete();
      } catch { }
    });
  }

  async showModalSavePlaylist(interaction: ButtonInteraction) {
    const playlistName = new TextInputBuilder()
      .setCustomId("list-name")
      .setLabel("Назва плейлисту")
      .setStyle(TextInputStyle.Short);

    const action = new ActionRowBuilder().addComponents(playlistName);

    const modal = new ModalBuilder()
      .setCustomId('save-playlist-modal')
      .setTitle('Зберегти плейлист')
    modal.addComponents(action as any);
    await interaction.showModal(modal);
  }

  getPlayStatusInfo(status: string) {
    switch (status) {
      case "autopaused":
        return "Призупинено";
      case "buffering":
        return "Завантаження";
      case "idle":
        return "Нічого не роблю";
      case "paused":
        return "Призупинено";
      case "playing":
        return "Співаю";
      default:
        return "Хз, хз...";
    }
  }

  getSoundsList(tracks: Sound[], playIndex: number) {
    const soundsList = tracks
      .map((s, i) => {
        const prefix = i === playIndex ? EmojieData.play : EmojieData.diamond1;
        const bold = i === playIndex ? "**" : "";
        return `${i === playIndex ? `<${prefix}>${bold}` : `<${prefix}>`} ${s.name}: ${s.author}${bold}`;
      })
      .join("\n");

    return soundsList;
  }

  public async searchYoutubeInteraction(
    interaction: ChatInputCommandInteraction,
    sounds: Sound[],
    collectCb: (sound: Sound, user: User) => void
  ) {
    const options = sounds.map((d, i) => new StringSelectMenuOptionBuilder()
      .setLabel(d.name.slice(0, 52))
      .setValue(`${i}`)
      .setDescription(`${d.author}`)
      .setEmoji(i % 2 === 0 ? EmojieData.diamond1 : EmojieData.diamond2));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`selector_1`)
      .setPlaceholder("Виберіть трек")
      .setOptions(options)

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const i = await interaction.editReply({ content: `Вибери трек знизу\nЦе повідомлення зникне через 3 хвилини.`, components: [row] });

    const collector = i.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 178_000
    });

    const mainInteraction = i;

    collector.on("collect", async (i) => {
      const selection = i.values[0];
      const choosed = sounds[Number(selection)];

      i.deferUpdate();
      if (!choosed) return;

      collectCb(choosed, i.user);
    });

    collector.on("end", async (i) => {
      mainInteraction.delete();
    })
  }

  public switchScreen() {
    this.screenState = this.screenState === "MUSIC" ? "TURN" : "MUSIC";
  }
}


