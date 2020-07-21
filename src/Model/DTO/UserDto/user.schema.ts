import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  email     : { type: String, required: true},
  regDate   : { type: Date, default: Date.now },
  idToken   : String,
  accessToken : String,
  userName  : String,
  profileImg  : String,
});
