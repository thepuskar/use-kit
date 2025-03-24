import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import { useRouter } from "next/router";

const config: DocsThemeConfig = {
  logo: (
    <div className="use-kit-logo">
      <svg
        width="32"
        height="32"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="120" height="120" rx="24" fill="#1E1E1E" />
        <g transform="translate(20, 20)">
          <path
            d="M40 10C40 20 30 25 30 35C30 45 40 50 50 50C60 50 70 45 70 35"
            stroke="#61DAFB"
            stroke-width="6"
            stroke-linecap="round"
          />
          <circle cx="70" cy="35" r="5" fill="#61DAFB" />

          <path
            d="M26 60L38 72"
            stroke="#FFFFFF"
            stroke-width="6"
            stroke-linecap="round"
          />
          <path
            d="M42 76L48 70C50 68 54 70 56 72L58 74C60 76 62 78 60 80L54 86"
            stroke="#FFFFFF"
            stroke-width="6"
            stroke-linecap="round"
          />
        </g>
      </svg>
      use-kit
    </div>
  ),
  project: {
    link: "https://github.com/thepuskar/use-kit",
  },
  docsRepositoryBase: "https://github.com/thepuskar/use-kit/tree/main/docs",
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== "/") {
      return {
        titleTemplate: "%s | use-kit",
      };
    }
  },
  footer: {
    text: "use-kit",
  },
  editLink: {
    text: "Edit this page on GitHub →",
  },
};

export default config;
