import {
  ApplicationCommandOptionType,
  GuildMember,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import Command from "../classes/command";
import PlayController from "../controllers/play.controller";
import { PlayPlatform } from "types/platforms";

export default {
  data: {
    name: "play",
    description: "Пошук треку",
    options: [
      {
        name: "payload",
        description: "Введіть назву трека або виконавця",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "platform",
        description: "На чому ти хочеш запускати музон",
        type: ApplicationCommandOptionType.String,
        required: false,
        choices: [
          { name: "YouTube", value: "youtube" },
          { name: "SoundCloud", value: "soundcloud" },
        ],
      },
    ],
  },
  async execute(interaction) {
    const payload = interaction.options.getString("payload");
    const platformInput = interaction.options.getString("platform");

    if (!payload) return;

    await interaction.deferReply();

    const member = interaction.member as GuildMember;
    const channel = member.voice.channel as VoiceChannel;
    const textChannel = interaction.channel as TextChannel;

    if (channel == null || textChannel == null) {
      return interaction.editReply("You need to join voice channel.");
    }

    PlayController.play(
      payload,
      member,
      channel,
      textChannel,
      (platformInput as PlayPlatform) || undefined,
    );
  },
} as Command;
