import { User } from "discord.js"

export interface Sound {
  id?: string,
  name: string,
  from: "youtube" | "soundcloud",
  url: string,
  author: string,
  iconUrl: string,
  addedBy?: User,
  seconds: number,
};
