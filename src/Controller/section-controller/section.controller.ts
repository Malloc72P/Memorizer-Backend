import { Body, Controller, Delete, Get, HttpStatus, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SectionDaoService } from '../../Model/DAO/section-dao/section-dao.service';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { SectionDto } from '../../Model/DTO/SectionDto/section.dto';
import {Response} from 'express'

@Controller('section')
export class SectionController {

  constructor(
    private sectionDao:SectionDaoService,
    private userDao:UserDaoService,
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
      this.onErrorState(res);
    }
  }
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async saveSectionList(@Req() req, @Res() res, @Body() sectionDto:SectionDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //sectionDto 검사
      if(!this.isValidSectionDto(sectionDto)){
        this.onErrorState(res);
        return ;
      }

      //section 생성 후, 생성된 개체 응답하기
      sectionDto.owner = thirdPartId;
      let createdSection:SectionDto = await this.sectionDao.create(sectionDto);
      res.status(HttpStatus.CREATED).send(createdSection);
    } catch (e) {
      console.log("SectionController >> saveSectionList >> e : ",e);
      this.onErrorState(res);
    }
  }
  @Patch()
  @UseGuards(AuthGuard('jwt'))
  async updateSectionList(@Req() req, @Res() res, @Body() sectionDto:SectionDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //sectionDto 검사
      if(!this.isValidSectionDto(sectionDto)){
        this.onErrorState(res);
        return ;
      }

      //section 업데이트 후, 반영된 개체 응답하기
      let updatedSection:SectionDto = await this.sectionDao.update(sectionDto._id, sectionDto);
      res.status(HttpStatus.CREATED).send(updatedSection);
    } catch (e) {
      console.log("SectionController >> updateSectionList >> e : ",e);
      this.onErrorState(res);
    }
  }
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async deleteSectionList(@Req() req, @Res() res, @Body() sectionDto:SectionDto)
  {
    try { //idToken 획득
      let thirdPartId = req.user;

      //section 삭제 후 성공메세지 응답
      await this.sectionDao.deleteOne(sectionDto._id);
      res.status(HttpStatus.CREATED).send();
    } catch (e) {
      console.log("SectionController >> deleteSectionList >> e : ",e);
      this.onErrorState(res);
    }
  }

  onErrorState(res:Response){
    console.log("SectionController >> onErrorState >> 진입함");
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
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

}
