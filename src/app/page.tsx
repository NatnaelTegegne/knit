
import { requireAuth } from "@/lib/auth-utils";
import { caller } from "@/trpc/server";
import { LogoutButton } from "./logout";

const Page = async () => {
  await requireAuth(); //Just for the ui (shouldn't be the last layer of data protection)
  const data = await caller.getUsers(); 
  
  return (
    <div className="min-h-screen flex-col gap-y-6 min-w-screen flex items-center justify-center">
      protected server component
      {JSON.stringify(data, null, 2)}

      <LogoutButton />
    </div>
  );
}

export default Page;