import { Controller, Get, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('courses')
  courses() {
    return this.catalog.listCourses();
  }

  @Get('courses/:id')
  course(@Param('id') id: string) {
    return this.catalog.courseTree(decodeURIComponent(id));
  }

  @Get('video-courses')
  videoCourses() {
    return this.catalog.listVideoCourses();
  }

  @Get('video-courses/:id')
  videoCourse(@Param('id') id: string) {
    return this.catalog.videoCourseTree(decodeURIComponent(id));
  }

  @Get('custom-books')
  customBooks() {
    return this.catalog.listCustomBooks();
  }
}
