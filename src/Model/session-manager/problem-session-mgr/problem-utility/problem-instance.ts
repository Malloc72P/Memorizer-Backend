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
  start(){
    this.timerSource = timer(ServerSetting.timerStepList[this.problemDto.currQuestionStep]);

    this.timerSubscription = this.timerSource.subscribe((res)=>{
      ProblemInstance.problemInstanceEventEmitter.emit("timer-terminated", this.problemDto);
    });
  }
}
