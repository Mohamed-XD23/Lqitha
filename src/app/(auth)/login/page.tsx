import { getDictionary, getLocale } from "@/lib/dictionary";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return <LoginClient dict={dict} />;
}