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
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
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
                                {name}
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
