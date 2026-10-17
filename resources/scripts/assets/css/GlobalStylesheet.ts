import tw from 'twin.macro';
import { createGlobalStyle } from 'styled-components/macro';
// @ts-expect-error untyped font file
import font from '@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2';

export default createGlobalStyle`
    @font-face {
        font-family: 'IBM Plex Sans';
        font-style: normal;
        font-display: swap;
        font-weight: 100 700;
        src: url(${font}) format('woff2-variations');
        unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
    }

    body {
        ${tw`font-sans bg-neutral-900 text-neutral-200`};
        letter-spacing: 0.015em;
        background-color: hsl(226, 62%, 8%);
        background-image: 
            radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.18) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(14, 165, 233, 0.15) 0px, transparent 50%),
            radial-gradient(at 50% 100%, rgba(29, 78, 216, 0.15) 0px, transparent 50%);
        background-attachment: fixed;
        min-height: 100vh;
    }

    h1, h2, h3, h4, h5, h6 {
        ${tw`font-medium tracking-normal font-header`};
    }

    p {
        ${tw`text-neutral-200 leading-snug font-sans`};
    }

    form {
        ${tw`m-0`};
    }

    textarea, select, input, button, button:focus, button:focus-visible {
        ${tw`outline-none`};
    }

    input:focus, textarea:focus, select:focus {
        box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.4), 0 0 16px rgba(14, 165, 233, 0.25) !important;
        border-color: #38bdf8 !important;
    }

    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
        -webkit-appearance: none !important;
        margin: 0;
    }

    input[type=number] {
        -moz-appearance: textfield !important;
    }

    /* Animated Card and Row Hover Micro-interactions */
    [class*="GreyRowBox"],
    [class*="TitledGreyBox"] {
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease !important;
    }

    [class*="GreyRowBox"]:hover,
    [class*="TitledGreyBox"]:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px -4px rgba(14, 165, 233, 0.25), 0 0 15px rgba(37, 99, 235, 0.15) !important;
    }

    #logo a {
        transition: text-shadow 0.2s ease;
    }

    #logo a:hover {
        text-shadow: 0 0 14px rgba(56, 189, 248, 0.6);
    }

    /* Glowing Blue Scroll Bar */
    ::-webkit-scrollbar {
        background: transparent;
        width: 10px;
        height: 10px;
    }

    ::-webkit-scrollbar-track {
        background: hsl(226, 62%, 7%);
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, hsl(199, 89%, 48%), hsl(221, 83%, 53%));
        border-radius: 6px;
        border: 2px solid hsl(226, 62%, 7%);
        box-shadow: 0 0 8px rgba(14, 165, 233, 0.4);
    }

    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, hsl(199, 89%, 60%), hsl(221, 83%, 65%));
        box-shadow: 0 0 14px rgba(56, 189, 248, 0.7);
    }

    ::-webkit-scrollbar-corner {
        background: transparent;
    }

    ::selection {
        background: rgba(14, 165, 233, 0.35);
        color: #ffffff;
    }
`;
