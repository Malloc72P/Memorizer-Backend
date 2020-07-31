import { Injectable } from '@nestjs/common';
import { ProblemDaoService } from '../../DAO/problem-dao/problem-dao.service';
import { UserDaoService } from '../../DAO/user-dao/user-dao.service';
import { DiscordUsersDaoService } from '../../DAO/discord-users-dao/discord-users-dao.service';
import { ProblemDto } from '../../DTO/ProblemDto/problem.dto';
import { ProblemInstance } from './problem-utility/problem-instance';
import { DiscordMsgSenderService } from '../discord-session-mgr/discord-msg-sender/discord-msg-sender.service';
import {
  DiscordReplyMsgEnum,
  DiscordReplyMsgMgrService,
} from '../discord-session-mgr/discord-reply-msg-mgr/discord-reply-msg-mgr.service';
import { DiscordSessionMgrService } from '../discord-session-mgr/discord-session-mgr.service';
import * as Discord from "discord.js";
import { DiscordMsg } from '../discord-session-mgr/discord-utility/discord-msg/discord-msg';
import { ServerSetting } from '../../../Config/server-setting';
@Injectable()
export class ProblemSessionMgrService {
  private problemInstanceMap:Map<any, ProblemInstance> = new Map<any, ProblemInstance>();
  constructor(
    private userDao:UserDaoService,
    private discordUsersDao:DiscordUsersDaoService,
    private problemDao:ProblemDaoService,
    private discordMsgSender:DiscordMsgSenderService,
    private replyMsgMgr:DiscordReplyMsgMgrService,
    private discordSessionMgr:DiscordSessionMgrService,
  ){
    this.discordSessionMgr.discordBotEventEmitter.addListener("ready", (discordClient:Discord.Client)=>{
      this.initProblemSessionMgrService();
    });
  }//constructor
  initProblemSessionMgrService(){
    //문제출제 이벤트 발생기에 리스너를 추가함
    ProblemInstance.problemInstanceEventEmitter.addListener("timer-terminated", async (problemDto:ProblemDto)=>{
      console.log("ProblemSessionMgrService >> timer-terminated >> subscribe >> problemDto : ",problemDto);
      let problemMsg:DiscordMsg = this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.prepareTest);
      problemMsg.title += problemDto.title;
      problemMsg.description += problemDto.question;
      problemMsg.embedFields[0].value = problemDto.questionedCount;
      problemMsg.embedFields[1].value = problemDto.correctCount;
      problemMsg.embedFields[2].value = problemDto.incorrectCount;
      problemMsg.link = ServerSetting.ngUrl + "/problem/" + problemDto.belongingSectionId + "/" + problemDto._id;
      await this.discordMsgSender.sendMsgWithIdToken(problemDto.owner, problemMsg);
    });//addListener()

    this.problemDao.findAll().then((problemDtoList:Array<ProblemDto>)=>{
      //problemDto를 이용해서, RxjsTimer를 시작할 수 있는 start메서드가 있는 ProblemInstance를 생성하고, Map에 저장함
      for (let currProblemDto of problemDtoList){
        let newProblemInstance:ProblemInstance = new ProblemInstance(currProblemDto);
        this.problemInstanceMap.set(currProblemDto._id, newProblemInstance);
        newProblemInstance.start();
      }
    });//findAll()
  }
}
