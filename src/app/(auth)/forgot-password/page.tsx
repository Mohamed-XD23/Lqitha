import { getDictionary, getLocale } from "@/lib/dictionary";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default async function ForgotPasswordPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return <ForgotPasswordClient dict={dict} />;
}
