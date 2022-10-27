import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { Context } from './context';
import { isAuthed } from './middlewares/auth.middleware';

//const t = initTRPC.create();
export const t = initTRPC.context<Context>().create();

export const protectedProcedure = t.procedure.use(isAuthed);

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
    profile: t.procedure
    .input(z.string().nullish())
    .query(({ input, ctx }) => ctx.user),
});

// only export *type signature* of router!
// to avoid accidentally importing your API
// into client-side code
export type AppRouter = typeof appRouter;