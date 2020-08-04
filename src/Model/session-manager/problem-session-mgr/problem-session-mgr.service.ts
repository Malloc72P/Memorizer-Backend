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
import { UserDto } from '../../DTO/UserDto/user-dto';
import { DiscordUsersDto } from '../../DTO/DiscordUsersDto/discord-users.dto';
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
      //디코랑 연동된 사용자인지 확인한다.
      //미연동상태라면 전송하지 않는다.
      let discordUsersDto:DiscordUsersDto = await this.discordUsersDao.findOneByOwner(problemDto.owner);
      if(!discordUsersDto){
        return
      }
      if(!discordUsersDto.isAvail){
        return ;
      }
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

    //디코 유저 정보를 가져와서 isAvail이 true이면,
    //해당 유저의 모든 문제데이터를 인스턴스화한다.
    this.discordUsersDao.findAll().then(async (discordUserList:Array<DiscordUsersDto>)=>{
      for(let currDiscordUser of discordUserList){
        await this.initUsersProblemList(currDiscordUser);
      }//for let currDiscordUser of discordUserList
    });//discordUserDao.findAll
  }
  async initUsersProblemList(discordUserDto:DiscordUsersDto){
    if(!discordUserDto.isAvail){
      //비활성화된 상태면 인스턴스화 안함
      return ;
    }
    let problemDtoList:Array<ProblemDto> = await this.problemDao.findAll();
    for (let currProblemDto of problemDtoList){
      let newProblemInstance:ProblemInstance = new ProblemInstance(currProblemDto);
      this.problemInstanceMap.set(currProblemDto._id, newProblemInstance);
      newProblemInstance.start();
    }//for let currProblemDto of problemDtoList

  }
}
