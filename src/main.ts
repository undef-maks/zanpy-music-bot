import { ButtonInteraction, ChatInputApplicationCommandData, ChatInputCommandInteraction, Events, GatewayIntentBits, Guild, ModalSubmitInteraction } from "discord.js";
import { env } from "./config/env";
import Client from "./classes/client";
import GuildManager from "./managers/guild-manager";
import commands from "./commands/index";
import { connectDB } from "./core/db-connect";
import { getBotUser } from "@core/get-bot-user";
import scdl from "@piebakery/play-dl";
import playController from "controllers/play.controller";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ]
});

const guildManager = GuildManager.getInstance();
const commandDatas: ChatInputApplicationCommandData[] = [];

client.once(Events.GuildCreate, async (guild) => {
  guildManager.guildJoin(guild);
  console.log(`New guild ${guild.name} ${guild.id}`);

  client.application?.commands.set(commandDatas, guild.id);
})

client.once(Events.ClientReady, async (readyClient) => {
  const guilds = [...client.guilds.cache.values()] as Guild[];

  guildManager.updateGuilds(guilds);
  guildManager.logTable();

  for (let command of commands) {
    commandDatas.push(command.data);
    client.commands.set(command.data.name, command);
  }

  guilds.map(g =>
    client.application?.commands.set(commandDatas, g.id)
  );
});

async function slashCommandsInteraction(interaction: ChatInputCommandInteraction) {
  const botUser = await getBotUser(interaction.user);

  if (interaction.commandName) {
    for (let command of commands) {
      if (interaction.commandName == command.data.name) {
        command.execute(interaction);
      }
    }
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) slashCommandsInteraction(interaction);
  if (interaction.isButton()) buttonClickInteraction(interaction);
  if (interaction.isModalSubmit()) modalSumbitInteraction(interaction);
  // if (interaction.isStringSelectMenu()) stringSelectMenuInteraction(interaction);
});

async function buttonClickInteraction(interaction: ButtonInteraction) {
  const guild = interaction.guild;

  if (!guild) return;

  const [namespace, action] = interaction.customId.split(':');
  playController.handleInteraction(guild, namespace, action, interaction);
}

async function modalSumbitInteraction(interaction: ModalSubmitInteraction) {
  const guild = interaction.guild;

  if (!guild) return;

}

// async function stringSelectMenuInteraction(interaction: StringSelectMenuInteraction) {
// }


connectDB();
client.login(env.BOT_TOKEN);
export default client;

