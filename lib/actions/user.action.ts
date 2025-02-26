"use server"

import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";






export async function signInWithCredentials(user: { email: string; password: string }) {
    return await signIn('credentials', { ...user, redirect: false })
}
export const SignOut = async () => {
    const redirectTo = await signOut({ redirect: false })
    redirect(redirectTo.redirect)
}

export const SignInWithGoogle = async () => {
    await signIn('google')
}
