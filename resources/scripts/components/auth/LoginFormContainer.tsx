import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

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

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Container>
        {title && <h2 css={tw`text-3xl text-center text-neutral-100 font-medium py-4`}>{title}</h2>}
        <FlashMessageRender css={tw`mb-2 px-1`} />
        <Form {...props} ref={ref}>
            <div
                css={tw`md:flex w-full rounded-2xl p-6 md:p-8 mx-1`}
                style={{
                    background: 'rgba(15, 23, 42, 0.82)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(56, 189, 248, 0.08)',
                }}
            >
                <div css={tw`flex-none select-none mb-6 md:mb-0 self-center flex flex-col items-center justify-center p-4 md:pr-8 md:border-r border-neutral-800`}>
                    <div
                        style={{
                            width: '76px',
                            height: '76px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(14, 165, 233, 0.08) 100%)',
                            border: '1px solid rgba(56, 189, 248, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)',
                            marginBottom: '14px',
                        }}
                    >
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                        </svg>
                    </div>
                    <span
                        style={{
                            fontSize: '22px',
                            fontWeight: 800,
                            letterSpacing: '-0.025em',
                            background: 'linear-gradient(135deg, #ffffff 30%, #38bdf8 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Timox Panel
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
                        Cloud Management
                    </span>
                </div>
                <div css={tw`flex-1 md:pl-8`}>{props.children}</div>
            </div>
        </Form>
        <p css={tw`text-center text-neutral-500 text-xs mt-4`}>
            &copy; 2015 - {new Date().getFullYear()}&nbsp;
            <a
                href={'/'}
                css={tw`no-underline text-neutral-500 hover:text-neutral-300`}
            >
                Timox Panel
            </a>
        </p>
    </Container>
));
