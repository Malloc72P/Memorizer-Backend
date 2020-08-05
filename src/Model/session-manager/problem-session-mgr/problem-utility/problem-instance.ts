import { ProblemDto } from '../../../DTO/ProblemDto/problem.dto';
import {timer} from 'rxjs'
import { ServerSetting } from '../../../../Config/server-setting';
import {EventEmitter} from 'events';


export class ProblemInstance {
  public problemDto:ProblemDto;
  public timerSource;
  public timerSubscription;

  public static readonly problemInstanceEventEmitter= new EventEmitter();

  constructor(problemDto: ProblemDto) {
    this.problemDto = problemDto;
  }
  stop(){
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe;
    }
  }
  start(problemDto?:ProblemDto){
    if(problemDto){
      this.problemDto = problemDto;
    }
    this.stop();
    let timerValue = ProblemInstance.getQuestionWaitTime(this.problemDto);

    if(timerValue < 0 ){
      //이미 출제된 경우임
      return;
    }

    this.timerSource = timer(timerValue);


    this.timerSubscription = this.timerSource.subscribe((res)=>{
      ProblemInstance.problemInstanceEventEmitter.emit("timer-terminated", this.problemDto);
      this.timerSubscription.unsubscribe();
    });
  }
  updateTimer(problemDto:ProblemDto){
    if(problemDto.currQuestionStep !== this.problemDto.currQuestionStep){
      this.timerSubscription.unsubscribe();
      this.problemDto = problemDto;
      this.start();
    }
  }
  resetTimer(){
    this.timerSubscription.unsubscribe();
    this.start();
  }
  delete(){
    this.timerSubscription.unsubscribe();
  }
  //문제를 출제하는데 대기 해야 하는 시간을 계산하고 리턴함.
  //만약 0보다 작으면 음수 값이 리턴될 것 임
  public static getQuestionWaitTime(problemDto:ProblemDto){
    let timerValue = 0;//문제 출제까지 대기해야 하는 시간
    if(problemDto.currQuestionStep >= 10){
      timerValue = ServerSetting.timerStepList[9];
    }else{
      timerValue = ServerSetting.timerStepList[problemDto.currQuestionStep];
    }
    let currTime = new Date();
    //recently Questioned Date. 최근 문제출제한 시간 값
    let rQD = problemDto.recentlyQuestionedDate;
    // let waitTime = rQD + timerValue - currTime;
    let waitTime = rQD.getTime() + timerValue - currTime.getTime();

    console.log("ProblemInstance >> getQuestionWaitTime >> waitTime : ",waitTime);
    // console.log("ProblemInstance >> getQuestionWaitTime >> recentlyQuestionedDate : ",this.problemDto.recentlyQuestionedDate.getMilliseconds());
    // console.log("ProblemInstance >> getQuestionWaitTime >> timerValue : ",timerValue);
    // console.log("ProblemInstance >> getQuestionWaitTime >> currTime.getMilliseconds() : ",currTime);
    return waitTime;
  }
}
