import { getDictionary } from "@/lib/dictionary";
import RegisterClient from "./RegisterClient";

export default async function RegisterPage() {
  const dict = await getDictionary();
  return <RegisterClient dict={dict} />;
}
