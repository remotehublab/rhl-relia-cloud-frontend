import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    backend: {
        // for when using Flask, make sure Flask serves your translation files under this path
        loadPath: `${process.env.REACT_APP_API_BASE_URL}/locales/{{lng}}/{{ns}}.json`
    },
    lng: "en",
    fallbackLng: 'en',
    returnNull: false,
    returnEmptyString: false,
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export const t = i18n.t.bind(i18n);

  export default i18n;