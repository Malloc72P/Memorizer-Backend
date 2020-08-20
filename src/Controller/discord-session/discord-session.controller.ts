import { Body, Controller, HttpStatus, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ErrorHandlerService } from '../../Model/error-handler/error-handler.service';
import { DiscordUsersDaoService } from '../../Model/DAO/discord-users-dao/discord-users-dao.service';
import { AuthGuard } from '@nestjs/passport';
import { DiscordUsersDto } from '../../Model/DTO/DiscordUsersDto/discord-users.dto';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { Response } from 'express';
import { DiscordMsgSenderService } from '../../Model/session-manager/discord-session-mgr/discord-msg-sender/discord-msg-sender.service';
import {
  DiscordReplyMsgEnum,
  DiscordReplyMsgMgrService,
} from '../../Model/session-manager/discord-session-mgr/discord-reply-msg-mgr/discord-reply-msg-mgr.service';
import { DiscordMsg } from '../../Model/session-manager/discord-session-mgr/discord-utility/discord-msg/discord-msg';

@Controller('discord')
export class DiscordSessionController {
  constructor(
    private userDao:UserDaoService,
    private discordUsersDao:DiscordUsersDaoService,
    private errorHandlerService:ErrorHandlerService,
    private discordBotMsgSender:DiscordMsgSenderService,
    private replyMsgMgr:DiscordReplyMsgMgrService,
  ){
  }
  @Patch()
  @UseGuards(AuthGuard('jwt'))
  async onLinkDiscordAccountRequest(@Req() req, @Res() res, @Body() paramDiscordUserDto:DiscordUsersDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;
      let userDto:UserDto = await this.userDao.findOne(thirdPartId);
      let discordUserDto:DiscordUsersDto = await this.discordUsersDao.findOne(paramDiscordUserDto._id);

      //유효성 검사
      if(!this.testOnLinkDiscordAccountRequestValidation(res, paramDiscordUserDto, discordUserDto, userDto)){
        return ;
      }
      //디코계정의 필드를 채우고 활성화해줘야 함
      discordUserDto.isAvail = true;
      discordUserDto.owner = userDto.idToken;

      let updateRes = await this.discordUsersDao.update(discordUserDto._id, discordUserDto);
      if(updateRes.ok !== 1){
        //업데이트 실패
        this.errorHandlerService.onErrorState(res, "update failed");
        return ;
      }
      //활성화 결과를 반환함
      res.status(HttpStatus.CREATED).send(discordUserDto);
      let replyMsg:DiscordMsg = this.replyMsgMgr.getKrReplyMsg(DiscordReplyMsgEnum.onRegisterSuccess);
      replyMsg.embedFields[2].value = userDto.userName;
      replyMsg.embedFields[3].value = userDto.email;
      replyMsg.embedFields[4].value = userDto.regDate.toDateString();

      await this.discordBotMsgSender.sendMsgWithChannelId(discordUserDto.channelId, replyMsg);
    } catch (e) {
      console.log("ProblemController >> getProblemList >> e : ",e);
      this.errorHandlerService.onErrorState(res, e);
    }
  }
  testOnLinkDiscordAccountRequestValidation(res:Response, paramDiscordUserDto:DiscordUsersDto, discordUserDto:DiscordUsersDto, userDto:UserDto){
    //discordUserDto를 안가져왔으면 수행 안함
    if(!paramDiscordUserDto){
      this.errorHandlerService.onBadRequestState(res, "!discordUserDto");
      return false;
    }
    //디코유저데이터의 OID와 연동암호가 없으면 수행 안함
    if(!paramDiscordUserDto._id || !paramDiscordUserDto.activationKey){
      this.errorHandlerService.onBadRequestState(res, "invalid discordUserDto value");
      return false;
    }
    if(!userDto){
      this.errorHandlerService.onBadRequestState(res, "!userDto");
      return false;
    }
    if(!discordUserDto){
      this.errorHandlerService.onBadRequestState(res, "!discordUserDto");
      return false;
    }
    if(paramDiscordUserDto.activationKey !== discordUserDto.activationKey){
      this.errorHandlerService.onBadRequestState(res, "invalid activationKey");
      return false;
    }
    return true;
  }

}
