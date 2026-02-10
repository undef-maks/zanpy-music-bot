import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";

const getAction = (action: string) => `player:${action}`;

export const MusicComponents = {
  playerRow() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(getAction("pause"))
        .setLabel('Pause/Resume')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(getAction("skip"))
        .setLabel('Skip')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(getAction("show-list"))
        .setLabel('List')
        .setStyle(ButtonStyle.Success)
    );
  },

  listRow() {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(getAction("show-player"))
        .setLabel('Player')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(getAction("skip"))
        .setLabel('Skip')
        .setStyle(ButtonStyle.Primary)
    );
  },

  selectSound(names: string[]) {
    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("sound-selection-menu")
        .addOptions(names.map((n, id) => new StringSelectMenuOptionBuilder()
          .setLabel(n)
          .setValue(`select-${id}`)))
    );
  }
};
