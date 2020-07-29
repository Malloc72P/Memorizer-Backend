import { Module } from '@nestjs/common';
import { ErrorHandlerService } from './error-handler.service';

@Module({
  imports : [

  ],
  providers : [
    /* *************************************************** */
    /* Handler Service START */
    /* *************************************************** */
    ErrorHandlerService,
  ],
  exports : [
    ErrorHandlerService,
  ],
})
export class ErrorHandlerModule {}
