import { getDictionary, getLocale } from "@/lib/dictionary";
import ResetPasswordClient from "./ResetPasswordClient";

export default async function ResetPasswordPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return <ResetPasswordClient dict={dict} />;
}
