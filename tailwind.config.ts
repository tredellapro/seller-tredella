import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1800px',
        '2md': '890px',
        'xs': '375px',
        'xsm': '450px',
      },
      fontFamily: {
        poppins: ["var(--font-Poppins)", ...fontFamily.sans],
      },
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        gray: "var(--gray)",
        background: "var(--background)",
        black: "var(--black)",
        white: "var(--white)",
      },
      fontSize: {
        "10": "10px",
        "11": "11px",
        "12": "12px",
        "13": "13px",
        "14": "14px",
        "15": "15px",
        "16": "16px",
        "17": "17px",
        "18": "18px",
        "19": "19px",
        "20": "20px",
        "21": "21px",
        "22": "22px",
        "23": "23px",
        "24": "24px",
        "25": "25px",
        "26": "26px",
        "27": "27px",
        "28": "28px",
        "29": "29px",
        "30": "30px",
        "31": "31px",
        "32": "32px",
        "33": "33px",
        "34": "34px",
        "35": "35px",
        "36": "36px",
        "37": "37px",
      },
    },
  },
  plugins: [],
} satisfies Config;
