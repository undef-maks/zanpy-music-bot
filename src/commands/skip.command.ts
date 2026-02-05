import Command from "../classes/command";
import playController from "controllers/play.controller";

export default {
  data: {
    name: "skip",
    description: "Команда для пропуску треку"
  },
  async execute(interaction) {
    if (!interaction.guildId) return;
    const res = await playController.skip(interaction.guildId);

    if (res.success == false) interaction.reply(res.message ?? "Unknown error");
    else interaction.reply("Skipped.");
  },
} as Command;
