import * as mongoose from 'mongoose';

export const DiscordUsersSchema = new mongoose.Schema({
  isAvail : Boolean,
  owner   : String,
  discordUserId : String,
  activationKey : String,
  channelId : String,
});
