import playController from "controllers/play.controller";
import Command from "../classes/command";


export default {
  data: {
    name: "skip-all",
    description: "Команда для пропуску всіх треків"
  },
  execute(interaction) {
    if (interaction.guildId == null) return;
    playController.skip(interaction.guildId, true);
  },
} as Command;

