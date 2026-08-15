import { RegisterForm } from "@/features/auth/components/register-form";
import { getEnabledSocialProviders } from "@/features/auth/lib/social-providers";
import { requireUnauth } from "@/lib/auth-utils";

const Page = async () => {
    await requireUnauth();

    return <RegisterForm socialProviders={getEnabledSocialProviders()} />;
};

export default Page;
