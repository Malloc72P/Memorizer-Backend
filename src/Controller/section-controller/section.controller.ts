import { Body, Controller, Delete, Get, HttpStatus, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SectionDaoService } from '../../Model/DAO/section-dao/section-dao.service';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { SectionDto } from '../../Model/DTO/SectionDto/section.dto';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { ErrorHandlerService } from '../../Model/error-handler/error-handler.service';

@Controller('section')
export class SectionController {

  constructor(
    private sectionDao:SectionDaoService,
    private userDao:UserDaoService,
    private errorHandlerService:ErrorHandlerService,
  ){
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getSectionList(@Req() req, @Res() res)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //획득한 idToken으로 섹션목록 가져오기
      let sectionList: Array<SectionDto> = await this.sectionDao.findAllByOwner(thirdPartId);

      //sectionList 응답하기.
      res.status(HttpStatus.CREATED).send(sectionList);
    } catch (e) {
      console.log("SectionController >> getSectionList >> e : ",e);
      this.errorHandlerService.onErrorState(res);
    }
  }
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async saveSection(@Req() req, @Res() res, @Body() sectionDto:SectionDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //sectionDto 검사
      if(!this.isValidSectionDto(sectionDto)){
        this.errorHandlerService.onErrorState(res);
        return ;
      }

      //section 생성 후, 생성된 개체 응답하기
      sectionDto.owner = thirdPartId;
      let createdSection:SectionDto = await this.sectionDao.create(sectionDto);
      res.status(HttpStatus.CREATED).send(createdSection);
    } catch (e) {
      console.log("SectionController >> saveSectionList >> e : ",e);
      this.errorHandlerService.onErrorState(res);
    }
  }
  @Patch()
  @UseGuards(AuthGuard('jwt'))
  async updateSection(@Req() req, @Res() res, @Body() sectionDto:SectionDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //sectionDto 검사
      if(!this.isValidSectionDto(sectionDto)){
        this.errorHandlerService.onErrorState(res);
        return ;
      }
      //권한 검사
      if(!await this.isValidAccess(thirdPartId, sectionDto)){
        this.errorHandlerService.onForbiddenRequest(res);
        return ;
      }

      //section 업데이트 후, 반영된 개체 응답하기
      let updatedSection:SectionDto = await this.sectionDao.update(sectionDto._id, sectionDto);
      res.status(HttpStatus.CREATED).send(updatedSection);
    } catch (e) {
      console.log("SectionController >> updateSectionList >> e : ",e);
      this.errorHandlerService.onErrorState(res);
    }
  }
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async deleteSection(@Req() req, @Res() res, @Body() sectionDto:SectionDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //권한 검사
      if(!await this.isValidAccess(thirdPartId, sectionDto)){
        this.errorHandlerService.onForbiddenRequest(res);
        return;
      }

      //section 삭제 후 성공메세지 응답
      await this.sectionDao.deleteOne(sectionDto._id);
      res.status(HttpStatus.CREATED).send();
    } catch (e) {
      console.log("SectionController >> deleteSectionList >> e : ",e);
      this.errorHandlerService.onErrorState(res);
    }
  }

  isValidSectionDto(sectionDto:SectionDto) :boolean{
    if(!sectionDto){
      return false;
    }
    else if(!sectionDto.title){
      return false;
    }
    return true
  }
  private async isValidAccess(idToken, sectionDto:SectionDto){
    //수행하기에 권한이 충분한지 검사하는 메서드
    //여기선 수정,삭제하려는 섹션의 소유자가 요청자와 동일한지 검사함.
    try {
      let userDto:UserDto = await this.userDao.findOne(idToken);
      let foundSectionDto:SectionDto = await this.sectionDao.findOne(sectionDto._id);
      //요청자의 idToken이 찾은 섹션의 소유자와 같은지를 반환함.
      return userDto.idToken === foundSectionDto.owner;
    }catch (e) {
      console.log("SectionController >> isValidAccess >> e : ",e);
    }
  }

}
