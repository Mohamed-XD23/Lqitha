// app/[locale]/new-item/page.tsx
import { getDictionary, getLocale } from "@/lib/dictionary";
import NewItemPage from "./NewItemClient";

export default async function NewItem() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  return <NewItemPage dict={dict} />;
}