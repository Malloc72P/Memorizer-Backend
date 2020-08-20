import { Injectable } from '@nestjs/common';
import { ServerSetting } from '../../../Config/server-setting';
import * as Discord from 'discord.js';
import { DiscordUsersDaoService } from '../../DAO/discord-users-dao/discord-users-dao.service';
import { DiscordMsgSenderService } from './discord-msg-sender/discord-msg-sender.service';
import { DiscordBotControllerService } from './discord-bot-controller/discord-bot-controller.service';
import {EventEmitter} from "events";

//디스코드 봇 초기화 과정을 담당하는 서비스
@Injectable()
export class DiscordSessionMgrService {
  public readonly discordClient:Discord.Client = null;
  private discordBotInfo:Discord.User = null;
  public discordBotEventEmitter:EventEmitter = new EventEmitter();

  constructor(
    private discordUsersDao:DiscordUsersDaoService,
    private msgSender:DiscordMsgSenderService,
    private botController:DiscordBotControllerService,
  ){
    //discord 클라이언트 생성
    this.discordClient = new Discord.Client();
    this.initDiscordBot().then(()=>{
      this.discordBotEventEmitter.emit("ready", this.discordClient);
    });
  }
  async initDiscordBot(){
    if(!this.isAvail()){
      return;
    }
    try {
      this.onReady();
      this.onMsg();
      await this.onLogin();

      this.discordBotInfo = await this.discordClient.users.fetch(ServerSetting.discordClientId);
      //메세지 전송 서비스 초기화
      this.msgSender.initDiscordMsgSender(this.discordClient, this.discordBotInfo);
      //봇 요청 컨트롤러 서비스 초기화
      this.botController.initDiscordBotController(this.discordClient, this.discordBotInfo);
    } catch (e) {
      console.log("DiscordSessionMgrService >> initDiscordBot >> e : ",e);
    }

  }

  async onLogin(){
    await this.discordClient.login(ServerSetting.discordToken);
    console.log("DiscordSessionMgrService >> onLogin >> 메모라이저 디코봇 작업 시작");
  }
  onReady(){
    this.discordClient.on("ready", ()=>{
    });
  }
  onMsg(){
    this.discordClient.on("message", (msg:Discord.Message)=>{
      this.botController.processBotRequest(msg);
    });
  }

  isAvail(){
    if(!this.discordClient){
      console.log("DiscordSessionMgrService >> isAvail >> 에러 발생");
      return false;
    }
    return true
  }
}
