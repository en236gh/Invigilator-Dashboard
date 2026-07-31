"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { loginAction, type AuthActionState } from "@/lib/actions/auth";

const initialState: AuthActionState = {};

const loginInputClass =
  "w-full rounded-none border border-black/20 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-black/40 focus:border-black focus:ring-1 focus:ring-black";

export function LoginForm({ nextPath = "/dashboard" }: { nextPath?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-5">
      <input type="hidden" name="next" value={nextPath} />

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-black">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue="invigilator@unza.zm"
          placeholder="invigilator@unza.zm"
          className={loginInputClass}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-black"
          >
            Password
          </label>
          <Link
            href="/login"
            className="text-sm font-medium text-black hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          defaultValue="Invig@2026"
          placeholder="••••••••"
          className={loginInputClass}
        />
      </div>

      {state.error ? (
        <p className="text-sm text-unza-red">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-none bg-black text-sm font-medium text-white transition hover:bg-black/90 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function LoginPage({ nextPath = "/dashboard" }: { nextPath?: string }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Black mould half — logo centered */}
      <div className="relative flex min-h-[220px] items-center justify-center bg-black lg:min-h-screen">
        <div className="relative h-40 w-40 sm:h-52 sm:w-52 lg:h-64 lg:w-64">
          <Image
            src="/UNZA.png"
            alt="University of Zambia"
            fill
            className="object-contain"
            priority
            sizes="256px"
          />
        </div>
      </div>

      {/* Form half — no card, sits on the page */}
      <div className="flex min-h-[calc(100vh-220px)] items-center justify-center bg-white px-8 py-12 sm:px-12 lg:min-h-screen lg:px-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Sign in As invigilator
          </h1>

          <div className="mt-8">
            <LoginForm nextPath={nextPath} />
          </div>
        </div>
      </div>
    </div>
  );
}
