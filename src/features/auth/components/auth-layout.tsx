import Image from "next/image";
import Link from "next/link";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="bg-muted flex flex-col min-h-svh items-center
                justify-center gap-6 p-6 md:p-10">
                    <div className="flex w-full max-w-sm flex-col">
                        <Link href="/" className="flex items-center gap-2 self-center font-medium">
                            <Image src="/logos/logo.svg" alt="Knit" width={40} height={40} />
                        </Link>
            {children}
            </div>
        </div>
    );
};
export default AuthLayout;