import { TRPCError, initTRPC } from '@trpc/server';
import {Context} from '@server/context'
export const t = initTRPC.context<Context>().create();
export const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});