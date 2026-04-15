import {getDictionary, getLocale} from "@/lib/dictionary";
import SupportClient from "./SupportClient";

export default async function SupportPage() {
    const locale = await getLocale();
    const dict = await getDictionary(locale);
    return <SupportClient dict = {dict} />
}