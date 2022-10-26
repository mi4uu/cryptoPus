import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const periods = []
    await prisma.period.deleteMany({where:{}})
    periods.push( await prisma.period.create(
      { data: { value: '1m'}}
     ));
   periods.push( await prisma.period.create(
        { data: { value: '5m'}}
       ));
       periods.push( await prisma.period.create(
   { data: { value: '15m'}}
  ));
  periods.push( await prisma.period.create(
    { data: { value: '30m'}}
   ));
   periods.push( await prisma.period.create(
    { data: { value: '1h'}}
   ));
   periods.push( await prisma.period.create(
    { data: { value: '2h'}}
   ));
   periods.push( await prisma.period.create(
    { data: { value: '4h'}}
   ));
   periods.push( await prisma.period.create(
    { data: { value: '1d'}}
   ));
   console.log(periods)
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
