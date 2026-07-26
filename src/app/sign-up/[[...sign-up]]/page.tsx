import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <SignUp />
    </div>
  );
}
