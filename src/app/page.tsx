import { getDictionary } from "@/lib/dictionary";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  const dict = await getDictionary();

  return <HomeClient dict={dict} />;
}
