import { Prisma, User } from "@prisma/client";
import { getPrismaClient } from "../utils/prisma";
const prisma = getPrismaClient();
export const createUser = async (input: Prisma.UserCreateInput) => {
  return (await prisma.user.create({
    data: input,
  })) as User;
};

export const findUser = async (
  where: Partial<Prisma.UserWhereUniqueInput>,
  select?: Prisma.UserSelect
) => {
  return (await prisma.user.findFirst({
    where,
    select,
  })) as User;
};

export const findUniqueUser = async (
  where: Prisma.UserWhereUniqueInput,
  select?: Prisma.UserSelect
) => {
  return (await prisma.user.findUnique({
    where,
    select,
  })) as User;
};

export const updateUser = async (
  where: Partial<Prisma.UserWhereUniqueInput>,
  data: Prisma.UserUpdateInput,
  select?: Prisma.UserSelect
) => {
  return (await prisma.user.update({ where, data, select })) as User;
};
