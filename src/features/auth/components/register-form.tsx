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
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const registerSchema = z.object({
    email: z.email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string().min(8, { message: "Confirm password must be at least 8 characters long" }),
}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
})

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const router = useRouter();
    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    });
    const onSubmit = async (values: RegisterFormValues) => {
        await authClient.signUp.email(
            {
                name: values.email.split("@")[0],
                email: values.email,
                password: values.password,
                callbackURL: "/",
            },
            {
                onSuccess: () => {
                    toast.success("Registration successful");
                    router.push("/");
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message);
                },
            }
        )
};
    const isPending = form.formState.isSubmitting;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6">
            <Card className="w-[400px] text-center">
                <CardHeader className="w-[350px] text-center">
                    <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
                    <CardDescription className="text-center">
                        Create your account to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <Button variant="outline" className="w-full">
                                Continue with GitHub
                            </Button>
                            <Button variant="outline" className="w-full">
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
                            <FormField
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input 
                                            {...field} 
                                            type="password" 
                                            placeholder="Confirm your password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isPending}>
                                {isPending ? "Registering..." : "Register"}
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="underline">
                                    Sign in
                                </Link>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div> 
    );
}