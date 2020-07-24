import * as mongoose from 'mongoose';

export interface ProblemDtoIntf extends mongoose.Document{
  _id;
  owner;
  title;
  belongingSectionId;
  createdDate;
  questionedCount;
  correctCount;
  incorrectCount;
  question;
  answer;
  currQuestionStep;
  recentlyQuestionedDate;
}
