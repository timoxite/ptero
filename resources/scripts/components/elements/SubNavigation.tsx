import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.nav`
    ${tw`w-full mt-2 mb-4 px-3 sm:px-6 overflow-x-auto`};

    & > div {
        ${tw`flex items-center text-sm mx-auto p-1.5 rounded-2xl`};
        max-width: 1320px;
        background: rgba(13, 22, 44, 0.8);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(56, 189, 248, 0.18);
        box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.5);

        & > a,
        & > div {
            ${tw`inline-flex items-center py-2 px-3.5 rounded-xl text-neutral-300 font-medium no-underline whitespace-nowrap transition-all duration-200 border border-transparent`};

            &:not(:first-of-type) {
                ${tw`ml-1.5`};
            }

            &:hover {
                ${tw`text-white bg-neutral-800`};
                box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
            }

            &:active,
            &.active {
                ${tw`text-white font-semibold`};
                background: linear-gradient(135deg, rgba(14, 165, 233, 0.28), rgba(37, 99, 235, 0.35));
                border-color: rgba(56, 189, 248, 0.55);
                box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
            }
        }
    }
`;

export default SubNavigation;
