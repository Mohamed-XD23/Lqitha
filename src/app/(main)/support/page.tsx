import {getDictionary} from "@/lib/dictionary";
import SupportClient from "./SupportClient";

export default async function SupportPage() {
    const dict = await getDictionary();
    return <SupportClient dict = {dict} />
}