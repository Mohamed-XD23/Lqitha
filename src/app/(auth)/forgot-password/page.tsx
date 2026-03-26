import { getDictionary } from "@/lib/dictionary";
import ForgotPasswordClient from "./ForgotPasswordClient";

export default async function ForgotPasswordPage() {
  const dict = await getDictionary();
  return <ForgotPasswordClient dict={dict} />;
}
