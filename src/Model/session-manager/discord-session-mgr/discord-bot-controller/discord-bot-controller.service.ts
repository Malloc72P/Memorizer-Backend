import { Injectable } from '@nestjs/common';
import { DiscordUsersDaoService } from '../../../DAO/discord-users-dao/discord-users-dao.service';
import * as Discord from 'discord.js';
import { DiscordUsersDto } from '../../../DTO/DiscordUsersDto/discord-users.dto';
import { ServerSetting } from '../../../../Config/server-setting';
import { BotCommand } from '../discord-utility/bot-command';
import { DiscordMsgSenderService } from '../discord-msg-sender/discord-msg-sender.service';
import { MsgParser } from '../discord-utility/msg-parser';
import { DiscordReplyMsgEnum, DiscordReplyMsgMgrService } from '../discord-reply-msg-mgr/discord-reply-msg-mgr.service';
import { DiscordMsg } from '../discord-utility/discord-msg/discord-msg';
import { UserDto } from '../../../DTO/UserDto/user-dto';
import { UserDaoService } from '../../../DAO/user-dao/user-dao.service';

//디스코드 봇에 대한 사용자 요청을 처리하는 컨트롤러 서비스
@Injectable()
export class DiscordBotControllerService {
  private discordClient:Discord.Client = null;

  constructor(
    private discordUsersDao:DiscordUsersDaoService,
    private userDao:UserDaoService,
    private msgSender:DiscordMsgSenderService,
    private replyMsgMgr:DiscordReplyMsgMgrService,
  ){

  }
  private botInfo:Discord.User = null;
  initDiscordBotController(discordClient:Discord.Client, botInfo:Discord.User){
    this.discordClient = discordClient;
    this.botInfo = botInfo;
  }

  //요청에 맞는 컨트롤러를 실행시켜주는 메서드
  public async processBotRequest(msg:Discord.Message){
    console.log("DiscordBotControllerService >> processBotRequest >> msg : ",msg);
    let botCommand:BotCommand = MsgParser.parseMsg(msg);
    if(botCommand === null){
      return;
    }
    switch (botCommand.command) {
      case "register" :
        this.onRegisterCommand(msg, botCommand).then(()=>{});
        break;
      case "whoami" :
        this.onWhoAmI(msg, botCommand).then(()=>{});
        break;
      case "test" :
        // this.onErrorHandler(msg).then(()=>{});
        await msg.reply("IWS2000의 탄종은?");
        break;
      default :
        this.onUndefinedRequest(msg).then(()=>{});
    }
  }

  //디코 명령 컨트롤러
  private async onUndefinedRequest(msg:Discord.Message, customReplyMsg?:DiscordMsg){
    let replyMsg = (customReplyMsg) ? customReplyMsg : this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.requestHelp);
    await this.msgSender.replyMsg(msg, replyMsg);
  }
  private async onErrorHandler(msg:Discord.Message, errMsg?:DiscordMsg){
    let replyMsg = (errMsg) ? errMsg : this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.onError);
    console.log("DiscordBotControllerService >> onErrorHandler >> replyMsg : ",replyMsg);
    await this.msgSender.replyMsg(msg, replyMsg);
  }

  /* *************************************************** */
  /* Discord Bot Controller Main START */
  /* *************************************************** */


  //DM채널에서 디코봇한테 계정연동을 요청하는 경우를 처리함
  private async onRegisterCommand(msg:Discord.Message, botCommand:BotCommand){
    try {
      //해당 개체에 저장된 디코유저를 DB에 저장하거나, 이 개체를 통해 디코유저정보를 불러옴
      let discordUserDto:DiscordUsersDto = await this.validateRegisterCommand(msg, botCommand);

      if(!discordUserDto){
        //에러발생
        this.onErrorHandler(msg);
        return ;
      }

      let replyMsg:DiscordMsg = this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.requestRegister);
      replyMsg.embedFields[0].value = `${ServerSetting.ngUrl}/discord/linking/${discordUserDto._id}`;
      replyMsg.embedFields[2].value = discordUserDto.activationKey;

      await this.msgSender.sendMsgWithDiscordId(discordUserDto.discordUserId, replyMsg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> onRegisterCommand >> e : ",e);
    }
  }//onRegisterCommand
  validateRegisterCommand(msg:Discord.Message, botCommand:BotCommand):Promise<DiscordUsersDto>{
    return new Promise<DiscordUsersDto>(async (resolve, reject)=>{
      try { //패러미터 길이가 올바르지 않다면 false return
        if (botCommand.params.length < 1) {
          this.onUndefinedRequest(msg, this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.onInvalidRequest));
          reject('invalid params');
        }
        let discordUserId = msg.author.id;
        let activationKey = botCommand.params[0];
        let discordUserDto = await this.discordUsersDao.findOneByDiscordId(discordUserId);
        if (discordUserDto && discordUserDto.isAvail) {
          //이미 연동된 경우
          await this.onErrorHandler(msg, this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.alreadyLinkedAccount));
          reject("already linked")
        } else if (discordUserDto && !discordUserDto.isAvail) {
          //연동시도를 해서 데이터는 있으나 활성화는 안된상태
          if (activationKey !== discordUserDto.activationKey) {
            //연동암호가 바뀌었다면 업데이트해준다
            discordUserDto.activationKey = activationKey;
            await this.discordUsersDao.update(discordUserDto._id, discordUserDto);
          }
        } else {
          console.log('DiscordSessionMgrService >> onRegisterCommand >> 연동요청이 없었던 경우');
          //연동요청이 없었던 경우엔 discordUserDto 생성
          let newDiscordUserDto: DiscordUsersDto = new DiscordUsersDto();
          newDiscordUserDto.isAvail = false;
          newDiscordUserDto.owner = null;//아직 연동된게 아니므로 일단 null값으로  초기화함
          //향후 웹앱에서 연동해서 해당 필드도 채우고 isAvail값도 true로 바꿀 수 있음.
          newDiscordUserDto.discordUserId = discordUserId;
          newDiscordUserDto.activationKey = activationKey;

          discordUserDto = await this.discordUsersDao.create(newDiscordUserDto);
        }
        resolve(discordUserDto);
      } catch (e) {
        console.log("DiscordBotControllerService >> validateRegisterCommand >> e : ",e);
        reject(e);
      }
    });
  }//validateRegisterCommand

  //자신의 디코계정과 연동된 메모라이저 계정의 정보를 불러옵니다
  private async onWhoAmI(msg:Discord.Message, botCommand:BotCommand){
    try {
      //해당 개체에 저장된 디코유저를 DB에 저장하거나, 이 개체를 통해 디코유저정보를 불러옴
      let discordUserDto:DiscordUsersDto = await this.verifyDiscordUser(msg, botCommand);
      if(!discordUserDto){
        return ;
      }
      let memorizerUserDto:UserDto = await this.validateWhoAmI(msg, botCommand, discordUserDto);
      if(!memorizerUserDto){
        return ;
      }
      let replyMsg:DiscordMsg = this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.requestWhoAmI);
      console.log("DiscordBotControllerService >> onWhoAmI >> replyMsg : ",replyMsg);
      replyMsg.embedFields[1].value = memorizerUserDto.userName;
      replyMsg.embedFields[2].value = memorizerUserDto.email;
      replyMsg.embedFields[3].value = memorizerUserDto.regDate.toDateString();

      // await this.msgSender.sendMsgWithDiscordId(discordUserDto.discordUserId, replyMsg);
      await this.msgSender.replyMsg(msg, replyMsg);
    } catch (e) {
      console.log("DiscordSessionMgrService >> onWhoAmI >> e : ",e);
    }
  }//onRequestMemorizerAccountInfo

  validateWhoAmI(msg:Discord.Message, botCommand:BotCommand, discordUserDto:DiscordUsersDto):Promise<UserDto>{
    return new Promise<UserDto>(async (resolve, reject)=>{
      try { //패러미터 길이가 올바르지 않다면 false return
        let memorizerUserDto:UserDto = await this.userDao.findOne(discordUserDto.owner);
        if(!memorizerUserDto){
          this.onErrorHandler(msg, this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.resignedMemorizerAccount));
          reject("resigned memorizer user");
        }
        else resolve(memorizerUserDto);
      } catch (e) {
        console.log("DiscordBotControllerService >> validateRegisterCommand >> e : ",e);
        reject(e);
        this.onErrorHandler(msg, this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.notYetLinked));
      }
    });

  }
  //연동되었는지 검사함
  verifyDiscordUser(msg:Discord.Message, botCommand:BotCommand):Promise<DiscordUsersDto>{
    return new Promise<DiscordUsersDto>(async (resolve, reject)=>{
      try { //패러미터 길이가 올바르지 않다면 false return
        let discordUserId = msg.author.id;
        let discordUserDto = await this.discordUsersDao.findOneByDiscordId(discordUserId);
        if(!discordUserDto){
          this.onErrorHandler(msg, this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.notYetLinked));
          reject("invalid user");//메모라이저에 연동요청도 안한 유저인 경우.
        }
        if(discordUserDto && !discordUserDto.isAvail){
          this.onErrorHandler(msg, this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.notYetLinked));
          reject("deactivated user");//연동요청은 했으나 아직 활성화되지 않은 상태
        }
        resolve(discordUserDto);
      } catch (e) {
        console.log("DiscordBotControllerService >> validateRegisterCommand >> e : ",e);
        reject(e);
      }
    });
  }
  async deleteMultipleMessages(msg:Discord.Message){
    msg.channel.messages.fetch({limit : 90}).then(async (res:Discord.Collection<string,Discord.Message>)=>{
      for(let currMsg of res){
        currMsg[1].delete();
      }
    });
  }
  /* **************************************************** */
  /* Discord Bot Controller Main END */
  /* **************************************************** */
}
