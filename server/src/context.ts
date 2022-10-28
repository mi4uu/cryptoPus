import { inferAsyncReturnType } from '@trpc/server';
import * as user from '@server/services/user.service'
import * as trpcExpress from '@trpc/server/adapters/express';
import * as _ from 'lodash'
export async function createContext({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) {

  const userFromOidc =  req.oidc.user
  const getOrCreateUser = async ()=>{
    if(!userFromOidc) return undefined
   let dbUser =  await user.findUniqueUser({email:userFromOidc.email})
   const diff = _.differenceWith(Object.entries(dbUser), Object.entries({
    id: undefined,
    name: userFromOidc.name,
    email: userFromOidc.email,
    photo: userFromOidc.photo,
    verified: userFromOidc.email_verified,
    enabled: false,
    password: "string",
    role: "user",
    provider: userFromOidc.sub
   }), (arr1,arr2)=>arr1[1]===arr2[1]  )
   .filter(arr=>arr[0] in ['createdAt', 'updatedAt', 'id', ])
   console.log({diff})
   if(diff.length>0){
    dbUser = await user.updateUser({id:dbUser.id},Object.fromEntries(diff))
   }
   console.log('user updated')
   if(!dbUser )
   dbUser = await user.createUser({
    name: userFromOidc.name,
    email: userFromOidc.email,
    photo: userFromOidc.photo,
    verified: userFromOidc.email_verified,
    enabled: false,
    password: "string",
    role: "user",
    provider: userFromOidc.sub
   })
   return dbUser
  }
  return {
    user: await getOrCreateUser() ,
  };
}
export type Context = inferAsyncReturnType<typeof createContext>;