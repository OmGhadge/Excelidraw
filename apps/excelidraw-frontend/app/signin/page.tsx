"use client";
import { AuthPage } from "@/components/AuthPage";
import { useSearchParams } from "next/navigation";

export default function Signin(){
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || undefined;
    return(
        <AuthPage isSignIn={true} redirect={redirect}/>
    )
}