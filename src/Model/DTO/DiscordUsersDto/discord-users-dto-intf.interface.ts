import * as mongoose from 'mongoose';

export interface DiscordUsersDtoIntf extends mongoose.Document{
  _id;
  isAvail;
  owner;
  discordUserId;
  activationKey;
  channelId;
}
