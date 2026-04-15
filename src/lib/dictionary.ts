import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  ar: () => import("./dictionaries/ar.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getLocale = async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value;
  if (locale && hasLocale(locale)) {
    return locale;
  }
  // Default fallback
  return "en";
};

export const getDictionary = cache(async (locale: Locale) => {
  const localeToUse = locale || (await getLocale());
  return await dictionaries[localeToUse]();
});
