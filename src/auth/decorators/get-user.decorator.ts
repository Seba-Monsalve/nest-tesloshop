import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();
  if (!user) {
    throw new InternalServerErrorException('User not found in request');
  }
  
  if (data) return user[data];
  return user;
});
