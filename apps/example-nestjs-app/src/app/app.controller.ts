import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { config } from '../config';

@Controller(config.get('controllerPrefix'))
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }
}
