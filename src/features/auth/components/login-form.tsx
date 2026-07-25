"use client"

import { zodResolver } from "@hookform/resolvers/zod"; 
import Image from "next/image"; 
import Link from "next/link"; 
import { useRouter } from "next/navigation"; 
import { useForm } from "react-hook-form"; 
import { toast } from "sonner"; 
import { z } from "zod"; 
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { authClient } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
    email: z.email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
    const router = useRouter();
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const onSubmit = async (values: LoginFormValues) => {
        try {
            await authClient.signIn.email(values);
            toast.success("Logged in successfully");
            router.push("/");
        } catch (error) {
            toast.error("Failed to log in");
        }
    };
    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6">
            <Card>
                <CardHeader className="w-[350px] text-center">
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Login to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <Button variant="outline" className="w-full">
                                <Image 
                                src="/logos/github.svg" 
                                alt="GitHub" 
                                width={20} 
                                height={20} 
                                className="mr-2"
                                />
                                Continue with GitHub
                            </Button>
                            <Button variant="outline" className="w-full">
                                <Image 
                                src="/logos/google.svg" 
                                alt="Google" 
                                width={20} 
                                height={20} 
                                className="mr-2"
                                />
                                Continue with Google
                            </Button>
                            <FormField
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                            {...field} 
                                            placeholder="Enter your email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input 
                                            {...field} 
                                            type="password" 
                                            placeholder="Enter your password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Logging in..." : "Login"}
                            </Button>
                            <div className="text-sm text-muted-foreground text-center">
                                Don&apos;t have an account?{" "}
                                <Link href="/signup" className="underline">
                                    Sign up
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div> 
    );
}