import { getDictionary } from "@/lib/dictionary";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const dict = await getDictionary();
  return <LoginClient dict={dict} />;
}