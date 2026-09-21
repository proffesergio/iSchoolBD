import { Controller, Get, Param, Query, ParseIntPipe, DefaultValuePipe, NotFoundException } from '@nestjs/common';
import { LearnService, MVP_LETTERS } from './learn.service';

@Controller('learn')
export class LearnController {
  constructor(private readonly learn: LearnService) {}

  @Get('letters')
  letters() {
    return { letters: MVP_LETTERS };
  }

  @Get('talking-letter/:letter')
  talkingLetter(
    @Param('letter') letter: string,
    @Query('progress', new DefaultValuePipe(10), ParseIntPipe) progress: number,
  ) {
    try {
      return this.learn.talkingLetter(decodeURIComponent(letter), progress);
    } catch {
      throw new NotFoundException({ message: `Unknown letter: ${letter}`, letters: MVP_LETTERS });
    }
  }

  @Get('quiz/tier2')
  tier2() {
    return this.learn.tier2Quiz();
  }

  @Get('socratic/tier3')
  tier3() {
    return this.learn.tier3Socratic();
  }
}
