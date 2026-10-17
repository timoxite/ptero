const colors = require('tailwindcss/colors');

const gray = {
    50: 'hsl(212, 100%, 97%)',
    100: 'hsl(213, 90%, 93%)',
    200: 'hsl(213, 75%, 85%)',
    300: 'hsl(212, 60%, 72%)',
    400: 'hsl(214, 45%, 58%)',
    500: 'hsl(216, 40%, 42%)',
    600: 'hsl(219, 45%, 28%)',
    700: 'hsl(221, 50%, 19%)',
    800: 'hsl(223, 56%, 13%)',
    900: 'hsl(226, 62%, 8%)',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#040814',
                primary: colors.blue,
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                250: '250ms',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
            animation: {
                'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
                'float': 'floatSlow 4s ease-in-out infinite',
            },
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 15px rgba(56, 189, 248, 0.35)' },
                    '50%': { boxShadow: '0 0 25px rgba(56, 189, 248, 0.65)' },
                },
                floatSlow: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-3px)' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
