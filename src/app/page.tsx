import { getDictionary, getLocale } from "@/lib/dictionary";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);

  return <HomeClient dict={dict} />;
}
