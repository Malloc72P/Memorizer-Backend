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
import { EventEmitter } from 'events';
import { Schema, Types } from 'mongoose';
import {ObjectId} from 'mongodb';

@Injectable()
export class ProblemSessionMgrService {
  private problemInstanceMap:Map<any, ProblemInstance> = new Map<any, ProblemInstance>();
  //문제출제로 인해 전송된 메세지를 저장하는 맵.
  //사용자가 문제를 맞추는 경우, 해당하는 메세지를 지운다.
  private sentMessageMap:Map<any, Discord.Message> = new Map<any, Discord.Message>();
  public problemSessionMgrEventEmitter:EventEmitter = new EventEmitter();
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
    this.problemSessionMgrEventEmitter.addListener("problem-created",
      (problemDto:ProblemDto)=>{
        this.createProblemInstance(problemDto);
    });
    this.problemSessionMgrEventEmitter.addListener("problem-updated",
      (problemDto:ProblemDto)=>{
        this.updateProblemInstance(problemDto);
      });
    this.problemSessionMgrEventEmitter.addListener("problem-deleted",
      (problemDto:ProblemDto)=>{
        this.deleteProblemInstance(problemDto);
      });
  }//constructor
  initProblemSessionMgrService(){
    //문제출제 이벤트 발생기에 리스너를 추가함
    ProblemInstance.problemInstanceEventEmitter.addListener("timer-terminated",
      async (problemDto:ProblemDto)=>{
      await this.doProblemTest(problemDto);
    });//addListener()

    //디코 유저 정보를 가져와서 isAvail이 true이면,
    //해당 유저의 모든 문제데이터를 인스턴스화한다.
    this.discordUsersDao.findAll().then(async (discordUserList:Array<DiscordUsersDto>)=>{
      for(let currDiscordUser of discordUserList){
        await this.initUsersProblemList(currDiscordUser);
      }//for let currDiscordUser of discordUserList
      //problemSessionMgrService 초기화 완료
      this.problemSessionMgrEventEmitter.emit("ready");
    });//discordUserDao.findAll
  }
  //문제출제 메서드
  async doProblemTest(problemDto:ProblemDto){
    try { //디코랑 연동된 사용자인지 확인한다.
      //미연동상태라면 전송하지 않는다.
      let discordUsersDto: DiscordUsersDto = await this.discordUsersDao.findOneByOwner(problemDto.owner);
      //현재 시점에 DB에 저장되어있는 데이터를 불러오기 위해 findOne메서드 사용함.
      problemDto = await this.problemDao.findOne(problemDto._id);
      if (!discordUsersDto) {
        return;
      }
      if (!discordUsersDto.isAvail) {
        return;
      }
      if (!problemDto) {
        return;
      }

      console.log('ProblemSessionMgrService >> timer-terminated >> subscribe >> problemDto : ', problemDto);
      let problemMsg: DiscordMsg = this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.prepareTest);
      problemMsg.title += problemDto.title;
      problemMsg.description += problemDto.question;
      problemMsg.embedFields[0].value = problemDto.questionedCount;
      problemMsg.embedFields[1].value = problemDto.correctCount;
      problemMsg.embedFields[2].value = problemDto.incorrectCount;
      problemMsg.link = ServerSetting.ngUrl + '/problem/' + problemDto.belongingSectionId + '/' + problemDto._id;
      let sentMsg:Discord.Message = await this.discordMsgSender.sendMsgWithIdToken(problemDto.owner, problemMsg);
      this.sentMessageMap.set(this.getProblemDtoId(problemDto), sentMsg);
    } catch (e) {
      console.log("problemSessionMgr >> updateProblemInstance >> e : ",e);
    }
  }
  async initUsersProblemList(discordUserDto:DiscordUsersDto){
    if(!discordUserDto.isAvail){
      //비활성화된 상태면 인스턴스화 안함
      return ;
    }
    let problemDtoList:Array<ProblemDto> = await this.problemDao.findAll();
    for (let currProblemDto of problemDtoList){
      this.createProblemInstance(currProblemDto);
    }//for let currProblemDto of problemDtoList

  }
  createProblemInstance(problemDto:ProblemDto){
    let newProblemInstance:ProblemInstance = new ProblemInstance(problemDto);
    let key = this.getProblemDtoId(problemDto);
    this.problemInstanceMap.set(key, newProblemInstance);
    newProblemInstance.start();
  }
  updateProblemInstance(problemDto:ProblemDto){
    console.log("problemSessionMgr >> updateProblemInstance >> 호출됨");
    let foundProblemInstance:ProblemInstance = this.problemInstanceMap.get(problemDto._id);
    if(foundProblemInstance){
      foundProblemInstance.updateTimer(problemDto);
    }
    // else{
    //   //과거에 타이머가 끝나서 인스턴스화되지 않은 경우임.
    //   //이 경우, 새 인스턴스를 만든다
    //   let newProblemInstance:ProblemInstance = new ProblemInstance(problemDto);
    //   this.problemInstanceMap.set(problemDto._id, newProblemInstance);
    //   newProblemInstance.start();
    // }
  }
  deleteProblemInstance(problemDto:ProblemDto){
    console.log("problemSessionMgr >> deleteProblemInstance >> 호출됨");
    let foundProblemInstance:ProblemInstance = this.problemInstanceMap.get(problemDto._id);
    if(foundProblemInstance){
      foundProblemInstance.delete();
      this.problemInstanceMap.delete(problemDto._id);
    }
  }
  async startProblemInstance(problemDto:ProblemDto){
    let foundProblemDto:ProblemDto = await this.problemDao.findOne(problemDto._id);
    let foundProblemInstance:ProblemInstance = this.problemInstanceMap
      .get(this.getProblemDtoId(problemDto));
    if(!foundProblemInstance){
      return;
    }
    foundProblemInstance.start(foundProblemDto);
  }
  getProblemDtoId(problemDto:ProblemDto){
    let key = "";
    if(problemDto._id instanceof ObjectId){
      key = problemDto._id.toString();
    }else key = problemDto._id;
  }
  async deleteSentMsg(problemDto:ProblemDto){
    //출제된 문제의 메세지가 서버에 저장되어 있는지 확인한다.
    //있다면, 해당 메세지를 지워준다.
    let sentMsg:Discord.Message = this.sentMessageMap.get(this.getProblemDtoId(problemDto));
    if(sentMsg){
      await sentMsg.delete();
    }
  }
}


