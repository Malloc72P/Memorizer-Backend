import * as mongoose from 'mongoose';

export const ProblemSchema = new mongoose.Schema({
  owner   : String,
  title   : String,

  belongingSectionId  : String,
  createdDate         : Date,
  questionedCount     : Number,
  correctCount        : Number,
  incorrectCount      : Number,
  question            : String,
  answer              : String,
  currQuestionStep    : Number,
  recentlyQuestionedDate : Date,
});
