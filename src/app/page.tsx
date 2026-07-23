import prisma from "@/lib/db";

const Page = async () => {
  const users = await prisma.user.findMany();

  return (
    <div className="min-h-screen">
      {JSON.stringify(users)}
    </div>
  )
}

export default Page;