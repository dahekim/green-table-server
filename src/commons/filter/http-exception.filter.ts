import { Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException) {
    const status = exception.getStatus();
    const message = exception.message;

    console.log('==========================');
    console.log('에러가 발생했습니다!');
    console.log('에러 내용:', message);
    console.log('에러 코드:', status);
    console.log('==========================');
  }
}
