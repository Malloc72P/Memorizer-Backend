export class ProblemDto {
  public _id;
  public owner;
  public title;

  //소속된 섹션
  public belongingSectionId;

  public createdDate;
  //출제된 횟수
  public questionedCount;
  //맞춘 횟수
  public correctCount;
  //틀린 횟수
  public incorrectCount;
  //문제 지문
  public question;
  //문제 정답
  public answer;

  //현재 출제간격
  public currQuestionStep;
  //최근 출제한 날짜
  public recentlyQuestionedDate;


  constructor(id?, owner?, title?, belongingSectionId?, createdDate?, questionedCount?, correctCount?, incorrectCount?, question?, answer?, currQuestionStep?, recentlyQuestionedDate?) {
    this._id = id;
    this.owner = owner;
    this.title = title;
    this.belongingSectionId = belongingSectionId;
    this.createdDate = createdDate;
    this.questionedCount = questionedCount;
    this.correctCount = correctCount;
    this.incorrectCount = incorrectCount;
    this.question = question;
    this.answer = answer;
    this.currQuestionStep = currQuestionStep;
    this.recentlyQuestionedDate = recentlyQuestionedDate;
  }
}
