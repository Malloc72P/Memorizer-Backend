import * as Discord from "discord.js"
export class DiscordMsg {
  public title;
  public description;
  public embedFields:Array<Discord.EmbedField>;
  public color;
  public link;


  constructor(title?, description?, embedFields?: Array<Discord.EmbedField>, color?, link?) {
    this.title = title;
    this.description = description;
    this.embedFields = embedFields;
    this.color = color;
    this.link = link;
  }
}
