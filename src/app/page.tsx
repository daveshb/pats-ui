import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  // If the user already has an active session, send them to the dashboard
  const cookieStore = await cookies();
  if (cookieStore.get("vantage_auth")?.value === "1") {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
