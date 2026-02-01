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

    if (res.status !== "success") interaction.reply(res.message);
    else interaction.reply("Skipped.");
  },
} as Command;
