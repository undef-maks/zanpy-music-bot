import * as Discord from "discord.js";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

class GuildManager {
  private static instance: GuildManager;
  private guilds: Record<string, Discord.Guild> = {};

  public static getInstance() {
    if (!GuildManager.instance)
      GuildManager.instance = new GuildManager();
    return GuildManager.instance;
  }

  public logTable() {
    const guilds = Object.values(this.guilds);
    const table = [];

    for (const guild of guilds) {
      const { name, id } = guild;
      table.push({ name, id });
    }

    console.table(table);
  }

  public guildJoin(guild: Discord.Guild) {
    this.guilds[guild.id] = guild;
  }

  public async updateGuilds(guilds: Discord.Guild[]) {
    for (const discordGuild of guilds) {
      this.guilds[discordGuild.id] = discordGuild;
    }
  }

  public getGuils() {
    return this.guilds;
  }
}

export default GuildManager;
