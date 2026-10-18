import * as React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCogs, faLayerGroup, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import SearchContainer from '@/components/dashboard/search/SearchContainer';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import http from '@/api/http';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Avatar from '@/components/Avatar';

const NavigationContainer = styled.header`
    ${tw`w-full pt-3 pb-2 px-3 sm:px-6 sticky top-0 z-40`};
`;

const GlassIsland = styled.div`
    ${tw`mx-auto w-full flex items-center justify-between px-3 sm:px-6 h-[4.2rem] rounded-2xl`};
    max-width: 1320px;
    background: rgba(13, 22, 44, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(56, 189, 248, 0.22);
    box-shadow: 0 12px 35px -8px rgba(0, 0, 0, 0.7), 0 0 20px rgba(14, 165, 233, 0.12);
`;

const RightNavigation = styled.div`
    ${tw`flex items-center gap-1.5 sm:gap-2 h-full`};

    & > a,
    & > button,
    & > .navigation-link {
        ${tw`flex items-center justify-center no-underline text-neutral-300 px-3 py-2 rounded-xl cursor-pointer text-sm font-medium transition-all duration-200 border border-transparent`};

        &:hover {
            ${tw`text-neutral-100 bg-neutral-800`};
            box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
        }

        &.active {
            ${tw`text-cyan-300 bg-neutral-800`};
            box-shadow: 0 0 16px rgba(56, 189, 248, 0.35);
            border-color: rgba(56, 189, 248, 0.4);
        }
    }
`;

export default () => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name);
    const displayName = !name || name.toLowerCase() === 'pterodactyl' ? 'Timo X Panel' : name;
    const user = useStoreState((state: ApplicationStore) => state.user.data);
    const rootAdmin = user?.rootAdmin ?? false;
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const onTriggerLogout = () => {
        setIsLoggingOut(true);
        http.post('/auth/logout').finally(() => {
            // @ts-expect-error this is valid
            window.location = '/';
        });
    };

    return (
        <NavigationContainer>
            <SpinnerOverlay visible={isLoggingOut} />
            <GlassIsland>
                <div id={'logo'} className={'flex items-center'}>
                    <Link to={'/'} className={'flex items-center gap-3 no-underline group'}>
                        <div
                            className={'w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105'}
                            style={{
                                background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                                boxShadow: '0 0 16px rgba(14, 165, 233, 0.45)',
                            }}
                        >
                            <FontAwesomeIcon icon={faLayerGroup} className={'text-sm'} />
                        </div>
                        <div className={'flex items-center'}>
                            <span className={'text-xl font-header font-bold text-neutral-100 tracking-wide group-hover:text-cyan-300 transition-colors'}>
                                {displayName}
                            </span>
                            <span
                                className={'ml-2.5 hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase text-cyan-300'}
                                style={{
                                    background: 'rgba(14, 165, 233, 0.15)',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                }}
                            >
                                CLOUD
                            </span>
                        </div>
                    </Link>
                </div>
                <RightNavigation>
                    <SearchContainer />
                    <Tooltip placement={'bottom'} content={'Dashboard'}>
                        <NavLink to={'/'} exact>
                            <FontAwesomeIcon icon={faLayerGroup} className={'mr-0 sm:mr-1.5'} />
                            <span className={'hidden md:inline'}>Dashboard</span>
                        </NavLink>
                    </Tooltip>
                    {rootAdmin && (
                        <Tooltip placement={'bottom'} content={'Admin Panel'}>
                            <a
                                href={'/admin'}
                                rel={'noreferrer'}
                                style={{
                                    background: 'rgba(245, 158, 11, 0.1)',
                                    borderColor: 'rgba(245, 158, 11, 0.3)',
                                    color: '#fbbf24',
                                }}
                            >
                                <FontAwesomeIcon icon={faCogs} className={'mr-0 sm:mr-1.5'} />
                                <span className={'hidden md:inline'}>Admin</span>
                            </a>
                        </Tooltip>
                    )}
                    <Tooltip placement={'bottom'} content={'Join Discord Community'}>
                        <a
                            href={'https://discord.gg/pnn9X5DyJ8'}
                            target={'_blank'}
                            rel={'noreferrer'}
                            style={{
                                background: 'rgba(99, 102, 241, 0.12)',
                                borderColor: 'rgba(99, 102, 241, 0.35)',
                                color: '#a5b4fc',
                            }}
                        >
                            <svg className={'w-4 h-4 mr-0 sm:mr-1.5'} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            <span className={'hidden md:inline'}>Discord</span>
                        </a>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Account Settings'}>
                        <NavLink to={'/account'}>
                            <span
                                className={'flex items-center w-6 h-6 rounded-full overflow-hidden mr-0 md:mr-2 border'}
                                style={{ borderColor: 'rgba(56, 189, 248, 0.4)' }}
                            >
                                <Avatar.User />
                            </span>
                            <span className={'hidden md:inline text-xs font-medium text-neutral-200'}>
                                {user?.username}
                            </span>
                        </NavLink>
                    </Tooltip>
                    <Tooltip placement={'bottom'} content={'Sign Out'}>
                        <button onClick={onTriggerLogout} title={'Sign Out'}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </button>
                    </Tooltip>
                </RightNavigation>
            </GlassIsland>
        </NavigationContainer>
    );
};
