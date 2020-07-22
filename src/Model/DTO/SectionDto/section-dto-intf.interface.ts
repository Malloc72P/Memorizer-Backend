import * as mongoose from 'mongoose';

export interface SectionDtoIntf extends mongoose.Document{
  _id;
  owner;
  title;
}
