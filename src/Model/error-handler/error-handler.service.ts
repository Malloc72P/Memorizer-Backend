import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ErrorHandlerService {
  onErrorState(res:Response){
    console.log("ErrorHandlerService >> onErrorState >> 진입함");
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }
  onForbiddenRequest(res:Response){
    console.log("ErrorHandlerService >> onForbiddenRequest >> 진입함");
    res.status(HttpStatus.FORBIDDEN).send();
  }
}
