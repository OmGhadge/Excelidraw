"use client";
import { AuthPage } from "@/components/AuthPage";
import { useSearchParams } from "next/navigation";

export default function Signup(){
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || undefined;
    return(
        <AuthPage isSignIn={false} redirect={redirect}/>
    )
}