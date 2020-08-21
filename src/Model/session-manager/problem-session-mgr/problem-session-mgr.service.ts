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

import { DiscordUsersDto } from '../../DTO/DiscordUsersDto/discord-users.dto';
import { EventEmitter } from 'events';

import {ObjectId} from 'mongodb';
import { Subscription, timer } from 'rxjs';

@Injectable()
export class ProblemSessionMgrService {
  private discordClient:Discord.Client;
  private problemInstanceMap:Map<any, Array<ProblemInstance>> = new Map<any, Array<ProblemInstance>>();
  private pollingrate = 10 * 1000;
  //문제출제로 인해 전송된 메세지를 저장하는 맵.
  //사용자가 문제를 맞추는 경우, 해당하는 메세지를 지운다.
  private sentMessageMap:Map<any, any> = new Map<any, any>();
  public problemSessionMgrEventEmitter:EventEmitter = new EventEmitter();
  private problemTimer;
  private problemTimerSubscription:Subscription;
  constructor(
    private userDao:UserDaoService,
    private discordUsersDao:DiscordUsersDaoService,
    private problemDao:ProblemDaoService,
    private discordMsgSender:DiscordMsgSenderService,
    private replyMsgMgr:DiscordReplyMsgMgrService,
    private discordSessionMgr:DiscordSessionMgrService,
  ){
    this.discordSessionMgr.discordBotEventEmitter.addListener("ready", (discordClient:Discord.Client)=>{
      this.discordClient = discordClient;
      this.initProblemSessionMgrService();
      this.initTimer();
    });
    this.problemSessionMgrEventEmitter.addListener("problem-created",
      (problemDto:ProblemDto)=>{
        this.createProblemInstance(problemDto);
    });
    this.problemSessionMgrEventEmitter.addListener("problem-updated",
      (problemDtoArr:Array<ProblemDto>)=>{
        this.updateProblemInstance(problemDtoArr[0], problemDtoArr[1]);
      });
    this.problemSessionMgrEventEmitter.addListener("problem-deleted",
      (problemDto:ProblemDto)=>{
        this.deleteProblemInstance(problemDto);
      });
  }//constructor
  initTimer(){
    this.problemTimer = timer(this.pollingrate, this.pollingrate);
    this.problemTimerSubscription = this.problemTimer.subscribe((val)=>{
      this.onTick();
    });
  }
  private onTick(){
    let timeKey = ProblemInstance.BuildKeyTime(new Date());
    console.log("InstanceMap : ,",this.problemInstanceMap);
    console.log("sentMessageMap : ,",this.sentMessageMap);
    console.log(`timeKey : ${timeKey}`);
    if(this.problemInstanceMap.has(timeKey)){
      let instanceArr:Array<ProblemInstance> = this.problemInstanceMap.get(timeKey);
      this.problemInstanceMap.delete(timeKey);

      for (let currInstance of instanceArr){
        this.doProblemTest(currInstance.problemDto).then(()=>{
          //after Message Sending
        });
      }
    }
  }
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

      // console.log('ProblemSessionMgrService >> timer-terminated >> subscribe >> problemDto : ', problemDto);
      let problemMsg: DiscordMsg = this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.prepareTest);
      problemMsg.title += problemDto.title;
      problemMsg.description += problemDto.question;
      problemMsg.embedFields[0].value = problemDto.questionedCount;
      problemMsg.embedFields[1].value = problemDto.correctCount;
      problemMsg.embedFields[2].value = problemDto.incorrectCount;
      problemMsg.link = ServerSetting.ngUrl + '/problem/' + problemDto.belongingSectionId + '/' + problemDto._id;
      let sentMsg:Discord.Message = await this.discordMsgSender.sendMsgWithIdToken(problemDto.owner, problemMsg);
      // console.log("sentMsg : ", sentMsg);
      this.sentMessageMap.set(this.getProblemDtoId(problemDto), sentMsg.id);
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
    // console.log("problemList : ",this.problemInstanceMap);
  }
  createProblemInstance(problemDto:ProblemDto){
    let newProblemInstance:ProblemInstance = new ProblemInstance(problemDto);

    let remainTime = ProblemInstance.getQuestionWaitTime(problemDto);
    if(remainTime < 0){
      return;
    }
    let key = newProblemInstance.getTimerKey(problemDto);
    let instanceArr:Array<ProblemInstance> = this.problemInstanceMap.get(key);
    if(instanceArr){
      instanceArr.push(newProblemInstance);
    }else {
      instanceArr = new Array<ProblemInstance>();
      instanceArr.push(newProblemInstance);
      this.problemInstanceMap.set(key, instanceArr);
    }
  }
  updateProblemInstance( prevProblemDto:ProblemDto, updatedProblemDto:ProblemDto ){
    // console.log("problemSessionMgr >> updateProblemInstance >> 호출됨");
    let key = ProblemInstance.GetTimerKey(prevProblemDto);
    let instanceArr:Array<ProblemInstance> = this.problemInstanceMap.get(key);
    if(instanceArr){
      let idx = instanceArr.length;
      while (idx--){
        let currInstance:ProblemInstance = instanceArr[idx];
        if(currInstance.problemDto._id.toString() === prevProblemDto._id.toString()){
          instanceArr.splice(idx, 1);
        }
      }
    }
    this.createProblemInstance(updatedProblemDto);
    if(instanceArr && instanceArr.length <= 0){
      this.problemInstanceMap.delete(key);
    }
    // let foundProblemInstance:ProblemInstance = this.problemInstanceMap.get(problemDto._id);
    // if(foundProblemInstance){
    //   foundProblemInstance.updateTimer(problemDto);
    // }
  }
  deleteProblemInstance(problemDto:ProblemDto){
    let key = ProblemInstance.GetTimerKey(problemDto);
    let instanceArr:Array<ProblemInstance> = this.problemInstanceMap.get(key);
    if(instanceArr){
      let idx = instanceArr.length;
      while (idx--){
        let currInstance:ProblemInstance = instanceArr[idx];
        if(currInstance.problemDto._id === problemDto._id){
          instanceArr.splice(idx, 1);
        }
      }
      if(instanceArr.length <= 0){
        this.problemInstanceMap.delete(key);
      }
    }
  }

  getProblemDtoId(problemDto:ProblemDto){
    let key = "";
    if(problemDto._id instanceof ObjectId){
      key = problemDto._id.toString();
    }else key = problemDto._id;
    return key;
  }
  async deleteSentMsg(problemDto:ProblemDto){
    //출제된 문제의 메세지가 서버에 저장되어 있는지 확인한다.
    //있다면, 해당 메세지를 지워준다.
    try {
      let sentMsgId = this.sentMessageMap.get(this.getProblemDtoId(problemDto));
      if (sentMsgId) {
        let textChannel:Discord.TextChannel = await this.discordMsgSender.getTextChannelByIdToken(problemDto.owner);
        let message:Discord.Message = await textChannel.messages.fetch(sentMsgId);
        if(message){
          await message.delete();
        }
      }
    } catch (e) {
      console.log("problemSessionMgrService >>> deleteSentMsg >>> e : ",e);
    }
  }
}


