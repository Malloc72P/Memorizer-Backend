export class DiscordUsersDto {
  public _id;
  public isAvail;
  public owner;
  public discordUserId;
  public activationKey;
  public channelId;

  constructor(id?, isAvail?, owner?, discordUserId?, activationKey?, channelId?) {
    this._id = id;
    this.isAvail = isAvail;
    this.owner = owner;
    this.discordUserId = discordUserId;
    this.activationKey = activationKey;
    this.channelId = channelId;
  }
}
