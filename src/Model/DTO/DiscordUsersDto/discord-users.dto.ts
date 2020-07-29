export class DiscordUsersDto {
  public _id;
  public isAvail;
  public owner;
  public discordUserId;
  public activationKey;

  constructor(id?, isAvail?, owner?, discordUserId?, activationKey?) {
    this._id = id;
    this.isAvail = isAvail;
    this.owner = owner;
    this.discordUserId = discordUserId;
    this.activationKey = activationKey;
  }
}
