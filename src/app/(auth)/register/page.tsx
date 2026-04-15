import { getDictionary, getLocale } from "@/lib/dictionary";
import RegisterClient from "./RegisterClient";

export default async function RegisterPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return <RegisterClient dict={dict} />;
}
