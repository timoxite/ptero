import React, { useEffect, useState } from 'react';
import { Server } from '@/api/server/getServer';
import getServers from '@/api/getServers';
import ServerRow from '@/components/dashboard/ServerRow';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import useFlash from '@/plugins/useFlash';
import { useStoreState } from 'easy-peasy';
import { usePersistedState } from '@/plugins/usePersistedState';
import Switch from '@/components/elements/Switch';
import tw from 'twin.macro';
import useSWR from 'swr';
import { PaginatedResult } from '@/api/http';
import Pagination from '@/components/elements/Pagination';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faSearch } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const { search } = useLocation();
    const defaultPage = Number(new URLSearchParams(search).get('page') || '1');

    const [page, setPage] = useState(!isNaN(defaultPage) && defaultPage > 0 ? defaultPage : 1);
    const [filter, setFilter] = useState('');
    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const uuid = useStoreState((state) => state.user.data!.uuid);
    const user = useStoreState((state) => state.user.data);
    const rootAdmin = user?.rootAdmin ?? false;
    const [showOnlyAdmin, setShowOnlyAdmin] = usePersistedState(`${uuid}:show_all_servers`, false);

    const { data: servers, error } = useSWR<PaginatedResult<Server>>(
        ['/api/client/servers', showOnlyAdmin && rootAdmin, page],
        () => getServers({ page, type: showOnlyAdmin && rootAdmin ? 'admin' : undefined })
    );

    useEffect(() => {
        setPage(1);
    }, [showOnlyAdmin]);

    useEffect(() => {
        if (!servers) return;
        if (servers.pagination.currentPage > 1 && !servers.items.length) {
            setPage(1);
        }
    }, [servers?.pagination.currentPage]);

    useEffect(() => {
        // Don't use react-router to handle changing this part of the URL, otherwise it
        // triggers a needless re-render. We just want to track this in the URL incase the
        // user refreshes the page.
        window.history.replaceState(null, document.title, `/${page <= 1 ? '' : `?page=${page}`}`);
    }, [page]);

    useEffect(() => {
        if (error) clearAndAddHttpError({ key: 'dashboard', error });
        if (!error) clearFlashes('dashboard');
    }, [error]);

    const totalServers = servers?.pagination.total ?? 0;

    return (
        <PageContentBlock title={'Dashboard'} showFlashKey={'dashboard'}>
            {/* Bento Dashboard Header */}
            <div
                className={'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl mb-5'}
                style={{
                    background: 'linear-gradient(135deg, rgba(13, 22, 44, 0.75) 0%, rgba(10, 18, 38, 0.85) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.18)',
                    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
            >
                <div>
                    <div className={'flex items-center gap-3'}>
                        <h2 className={'text-xl sm:text-2xl font-bold font-header text-white tracking-tight'}>
                            Infrastructure &amp; Servers
                        </h2>
                        {servers && (
                            <span
                                className={'px-2.5 py-0.5 rounded-full text-xs font-semibold text-cyan-300'}
                                style={{
                                    background: 'rgba(14, 165, 233, 0.15)',
                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                }}
                            >
                                {totalServers} {totalServers === 1 ? 'instance' : 'instances'}
                            </span>
                        )}
                    </div>
                    <p className={'text-xs sm:text-sm text-neutral-400 mt-1'}>
                        Real-time telemetry, resources, and node monitoring for your game servers and applications
                    </p>
                </div>

                {rootAdmin && (
                    <div
                        className={'flex items-center gap-2.5 self-start sm:self-auto px-3.5 py-1.5 rounded-xl'}
                        style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(56, 189, 248, 0.2)',
                        }}
                    >
                        <span className={'text-xs font-medium text-neutral-300'}>
                            {showOnlyAdmin ? "Others' Servers" : 'My Servers'}
                        </span>
                        <Switch
                            name={'show_all_servers'}
                            defaultChecked={showOnlyAdmin}
                            onChange={() => setShowOnlyAdmin((s) => !s)}
                        />
                    </div>
                )}
            </div>

            {!servers ? (
                <Spinner centered size={'large'} />
            ) : (
                <Pagination data={servers} onPageSelect={setPage}>
                    {({ items }) => {
                        const filteredItems = items.filter((server) => {
                            if (!filter.trim()) return true;
                            const q = filter.toLowerCase().trim();
                            const nameMatch = server.name.toLowerCase().includes(q);
                            const descMatch = (server.description || '').toLowerCase().includes(q);
                            const allocMatch = server.allocations.some((alloc) =>
                                (alloc.alias || alloc.ip).toLowerCase().includes(q) || alloc.port.toString().includes(q)
                            );
                            return nameMatch || descMatch || allocMatch;
                        });

                        return items.length > 0 ? (
                            <>
                                {/* Instant Search & Filter Bar */}
                                <div className={'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5'}>
                                    <div className={'relative max-w-md w-full'}>
                                        <div className={'absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400'}>
                                            <FontAwesomeIcon icon={faSearch} className={'text-xs'} />
                                        </div>
                                        <input
                                            type={'text'}
                                            placeholder={'Search servers by name, description, or IP...'}
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            className={'w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm text-neutral-100 placeholder-neutral-500 transition-all duration-200 outline-none'}
                                            style={{
                                                background: 'rgba(15, 23, 42, 0.75)',
                                                border: '1px solid rgba(56, 189, 248, 0.2)',
                                            }}
                                        />
                                        {filter && (
                                            <button
                                                onClick={() => setFilter('')}
                                                className={'absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-neutral-400 hover:text-white'}
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                    <div className={'text-xs text-neutral-400 font-medium'}>
                                        Showing <span className={'text-cyan-300 font-semibold'}>{filteredItems.length}</span> of {items.length} servers
                                    </div>
                                </div>

                                {filteredItems.length > 0 ? (
                                    <div className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'}>
                                        {filteredItems.map((server) => (
                                            <ServerRow key={server.uuid} server={server} />
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        className={'flex flex-col items-center justify-center p-10 text-center rounded-2xl'}
                                        style={{
                                            background: 'rgba(13, 22, 44, 0.6)',
                                            border: '1px dashed rgba(56, 189, 248, 0.25)',
                                        }}
                                    >
                                        <p className={'text-sm text-neutral-300 mb-2'}>
                                            No servers match your search &ldquo;{filter}&rdquo;
                                        </p>
                                        <button
                                            onClick={() => setFilter('')}
                                            className={'px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-400 border border-cyan-800/60 bg-cyan-950/40 hover:bg-cyan-900/50'}
                                        >
                                            Clear Filter
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div
                                className={'flex flex-col items-center justify-center p-12 text-center rounded-2xl mt-4'}
                                style={{
                                    background: 'rgba(13, 22, 44, 0.6)',
                                    border: '1px dashed rgba(56, 189, 248, 0.25)',
                                }}
                            >
                                <div
                                    className={'w-14 h-14 rounded-2xl flex items-center justify-center text-cyan-400 text-2xl mb-4'}
                                    style={{
                                        background: 'rgba(14, 165, 233, 0.12)',
                                        border: '1px solid rgba(56, 189, 248, 0.25)',
                                    }}
                                >
                                    <FontAwesomeIcon icon={faServer} />
                                </div>
                                <h4 className={'text-lg font-bold text-white mb-1'}>No Servers Found</h4>
                                <p className={'text-sm text-neutral-400 max-w-sm'}>
                                    {showOnlyAdmin
                                        ? 'There are no other servers available on the system to display.'
                                        : 'There are currently no active servers associated with your account.'}
                                </p>
                            </div>
                        );
                    }}
                </Pagination>
            )}
        </PageContentBlock>
    );
};
