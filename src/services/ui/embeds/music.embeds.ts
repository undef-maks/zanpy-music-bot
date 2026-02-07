import { EmbedBuilder } from "discord.js";
import { Sound } from "types/sound";
import { EmojieData } from "@core/emojie.data";
import { RawSound } from "adapters/adapter.interface";

const getEmogi = (str: string) => `<${str}>`;

export const MusicEmbeds = {
  player(current: RawSound, next?: RawSound, status: 'playing' | 'paused' | 'buffering' = 'playing') {
    const embed = new EmbedBuilder()
      .setColor(0x038cfc)
      .setTitle(current.title)
      .setURL(current.url)
      .setDescription(`**Next:** ${next ? next.title : "Пусто"}`);

    // if (current.addedBy) {
    //   embed.setAuthor({
    //     name: current.addedBy.displayName,
    //     iconURL: current.addedBy.avatarURL() ?? undefined,
    //   });
    // }

    // const h = Math.floor(current.seconds / 3600);
    // const m = Math.floor((current.seconds % 3600) / 60);
    // const s = current.seconds % 60;
    // const timeString = `${h}h ${m}m ${s}s`;

    embed.addFields(
      // {
      //   name: `${getEmogi(EmojieData.hourglass)} Час`,
      //   value: timeString,
      //   inline: true,
      // },
      {
        name: `${getEmogi(EmojieData.diamond2)} Канал`,
        value: current.author || "Невідомо",
        inline: true,
      },
      {
        name: `${getEmogi(EmojieData.diamond1)} Статус`,
        value: status === 'paused' ? "На паузі" : status === 'buffering' ? "Завантаження..." : "Відтворюється",
        inline: true,
      }
    );

    return embed;
  },

  queueList(sounds: RawSound[], playIndex: number = 0) {
    const maxTracksDisplay = 15;
    const totalTracks = sounds.length;

    const soundsList = sounds.slice(0, maxTracksDisplay)
      .map((s, i) => `**${i + 1}.** ${s.title}`)
      .join('\n') || "Список порожній";

    const extraTracks = totalTracks > maxTracksDisplay
      ? `\n\n_…та ще **${totalTracks - maxTracksDisplay}** треків_`
      : "";

    return new EmbedBuilder()
      .setColor(0x038cfc)
      .setTitle("📋 Список відтворення")
      .setDescription(soundsList + extraTracks);
  },

  addedToQueue(sound: RawSound | RawSound[]) {
    const isArray = Array.isArray(sound);
    return new EmbedBuilder()
      .setDescription(isArray ? `Додано плейлист (**${sound.length}** треків)` : `Додано в чергу: **${sound.title}**`)
      .setColor("#2ecc71");
  },

  error(message: string) {
    return new EmbedBuilder()
      .setTitle("❌ Помилка")
      .setDescription(message)
      .setColor("#ff0000");
  }
};
