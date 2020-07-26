import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ErrorHandlerService {
  onErrorState(res:Response, e){
    console.log("ErrorHandlerService >> onErrorState >> 진입함", e);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }
  onBadRequestState(res:Response, e){
    console.log("ErrorHandlerService >> onBadRequestState >> 진입함", e);
    res.status(HttpStatus.BAD_REQUEST).send();
  }
  onForbiddenRequest(res:Response, e){
    console.log("ErrorHandlerService >> onForbiddenRequest >> 진입함", e);
    res.status(HttpStatus.FORBIDDEN).send();
  }
}
