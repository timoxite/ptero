import React, { useEffect } from 'react';
import ContentContainer from '@/components/elements/ContentContainer';
import { CSSTransition } from 'react-transition-group';
import tw from 'twin.macro';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreState } from 'easy-peasy';

export interface PageContentBlockProps {
    title?: string;
    className?: string;
    showFlashKey?: string;
}

const PageContentBlock: React.FC<PageContentBlockProps> = ({ title, showFlashKey, className, children }) => {
    const siteName = useStoreState((state: any) => state.settings?.data?.name);
    const name = !siteName || siteName.toLowerCase() === 'pterodactyl' ? 'Timo X Panel' : siteName;

    useEffect(() => {
        if (title) {
            document.title = `${name} - ${title}`;
        }
    }, [title, name]);

    return (
        <CSSTransition timeout={150} classNames={'fade'} appear in>
            <>
                <ContentContainer css={tw`my-4 sm:my-10`} className={className}>
                    {showFlashKey && <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />}
                    {children}
                </ContentContainer>
                <ContentContainer css={tw`mb-4`}>
                    <p css={tw`text-center text-neutral-500 text-xs`}>
                        <span css={tw`text-neutral-400 font-medium`}>{name}</span>
                        &nbsp;&copy; {new Date().getFullYear()}
                    </p>
                </ContentContainer>
            </>
        </CSSTransition>
    );
};

export default PageContentBlock;
