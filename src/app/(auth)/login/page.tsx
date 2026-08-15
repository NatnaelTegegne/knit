import { LoginForm } from "@/features/auth/components/login-form";
import { getEnabledSocialProviders } from "@/features/auth/lib/social-providers";
import { requireUnauth } from "@/lib/auth-utils";

const Page = async () => {
    await requireUnauth();

    return <LoginForm socialProviders={getEnabledSocialProviders()} />;
};

export default Page;
