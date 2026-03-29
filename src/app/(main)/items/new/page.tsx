// app/[locale]/new-item/page.tsx
import { getDictionary } from "@/lib/dictionary";
import NewItemPage from "./NewItemClient";

export default async function NewItem() {
  const dict = await getDictionary();
  return <NewItemPage dict={dict} />;
}