import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
        max-width: 700px;
    `};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const siteName = useStoreState((state: ApplicationStore) => state.settings.data?.name);
    const name = !siteName || siteName.toLowerCase() === 'pterodactyl' ? 'Timo X Panel' : siteName;

    return (
        <Container>
            {title && <h2 css={tw`text-3xl text-center text-neutral-100 font-medium py-4`}>{title}</h2>}
            <FlashMessageRender css={tw`mb-2 px-1`} />
            <Form {...props} ref={ref}>
                <div
                    css={tw`md:flex w-full rounded-2xl p-6 md:p-8 mx-1`}
                    style={{
                        background: 'linear-gradient(145deg, rgba(16, 27, 54, 0.95) 0%, rgba(10, 18, 38, 0.98) 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.22)',
                        boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(14, 165, 233, 0.15)',
                    }}
                >
                    <div css={tw`flex-none select-none mb-6 md:mb-0 self-center text-center px-4 md:mr-6`}>
                        <div
                            className={'w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-white mb-3'}
                            style={{
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                                boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)',
                            }}
                        >
                            <FontAwesomeIcon icon={faLayerGroup} className={'text-3xl'} />
                        </div>
                        <h1 className={'text-xl font-bold font-header text-white tracking-wide'}>
                            {name}
                        </h1>
                        <span
                            className={'inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase text-cyan-300'}
                            style={{
                                background: 'rgba(14, 165, 233, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                            }}
                        >
                            CLOUD HOSTING
                        </span>
                    </div>
                    <div css={tw`flex-1`}>{props.children}</div>
                </div>
            </Form>
            <p css={tw`text-center text-neutral-500 text-xs mt-4`}>
                &copy; {new Date().getFullYear()} {name}. All rights reserved.
            </p>
        </Container>
    );
});
