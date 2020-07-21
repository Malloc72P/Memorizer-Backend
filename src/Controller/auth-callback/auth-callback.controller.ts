import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { ServerSetting } from "../../Config/server-setting";

@Controller('auth')
export class AuthCallbackController {

  constructor(
    private userDao: UserDaoService
  ){

  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin()
  {
    // initiates the Google OAuth2 login flow
  }

  //구글 로그인 성공시, 해당 메서드가 수행됨.
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req, @Res() res)
  {
    // handles the Google OAuth2 callback
    //console.log("AuthCallbackController > googleLoginCallback > 호출됨");
    try {
      let usersDto: UserDto = req.user.usersDto;
      let resolveParam = await this.userDao.loginProcess(usersDto);
      this.redirectWithAccessToken(res, usersDto);
    } catch (e) {
      res.redirect(ServerSetting.ngRoutes.loginFailure);
    }
  }

  redirectWithAccessToken(res, usersDto:UserDto){
    res.redirect(
      ServerSetting.ngRoutes.loginSuccess
      + usersDto.accessToken
      + "/" + usersDto.idToken
      + "/" + usersDto.email
      + "/" + usersDto.userName
    );
  }


  @Post('protected')
  @UseGuards(AuthGuard('jwt'))
  async protectedResource(@Req() req, @Res() res)
  {
    let thirdPartId = req.user;
    let userDto = await this.userDao.findOne(thirdPartId);
    if(userDto){
      res.status(HttpStatus.CREATED).send({userDto});
    }
    else {
      return "unauthorized";
    }
  }

  @Post('signOut')
  @HttpCode(204)
  @UseGuards(AuthGuard('jwt'))
  signOut(@Req() req)
  {
    let usersDto:UserDto = req.user.usersDto;
    ////console.log("AuthCallbackController >> signOut >> usersDto.userName : ",usersDto.userName);
    return "success";
  }


}
