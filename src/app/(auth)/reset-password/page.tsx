import { getDictionary } from "@/lib/dictionary";
import ResetPasswordClient from "./ResetPasswordClient";

export default async function ResetPasswordPage() {
  const dict = await getDictionary();
  return <ResetPasswordClient dict={dict} />;
}
