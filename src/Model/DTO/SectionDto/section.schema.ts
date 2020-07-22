import * as mongoose from 'mongoose';

export const SectionSchema = new mongoose.Schema({
  owner   : String,
  title   : String,
});
