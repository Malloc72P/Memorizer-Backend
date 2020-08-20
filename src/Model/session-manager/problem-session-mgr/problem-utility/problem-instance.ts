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

  getTimerKey(problemDto?:ProblemDto){
    if(problemDto){
      this.problemDto = problemDto;
    }
    return ProblemInstance.GetTimerKey(problemDto);
  }
  public static GetTimerKey(problemDto:ProblemDto){
    let waitMilliTime = ProblemInstance.GetRQD(problemDto.recentlyQuestionedDate).getTime() + ProblemInstance.getWaitTime(problemDto);
    let waitTime:Date = new Date(waitMilliTime);
    let waitTimeKey = ProblemInstance.BuildKeyTime(waitTime)

    return waitTimeKey;
  }

  public static BuildKeyTime(date:Date){
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;
  }
  public static getWaitTime(problemDto:ProblemDto){
    let timerValue = 0;//문제 출제까지 대기해야 하는 시간
    if(problemDto.currQuestionStep >= 10){
      timerValue = ServerSetting.timerStepList[9];
    }else{
      timerValue = ServerSetting.timerStepList[problemDto.currQuestionStep];
    }
    return timerValue;
  }
  //문제를 출제하는데 대기 해야 하는 시간을 계산하고 리턴함.
  //만약 0보다 작으면 음수 값이 리턴될 것 임
  public static getQuestionWaitTime(problemDto:ProblemDto){
    //문제 출제까지 대기해야 하는 시간
    let timerValue = ProblemInstance.getWaitTime(problemDto);

    let currTime = new Date();
    //recently Questioned Date. 최근 문제출제한 시간 값
    let rQD = ProblemInstance.GetRQD(problemDto.recentlyQuestionedDate);

    // let waitTime = rQD + timerValue - currTime;
    let waitTime = rQD.getTime() + timerValue - currTime.getTime();
    return waitTime;
  }
  private static GetRQD(rqd){
    if (rqd instanceof Date) {
      return rqd;
    }else{
      return new Date(rqd);
    }
  }
}
