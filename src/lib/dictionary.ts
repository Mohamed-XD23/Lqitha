import "server-only";
import { cookies } from "next/headers";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  ar: () => import("./dictionaries/ar.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getLocale = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;
  if (locale && (locale === "en" || locale === "ar")) {
    return locale;
  }
  // Default fallback
  return "en";
};

export const getDictionary = async () => {
  const locale = await getLocale();
  return dictionaries[locale]();
};
