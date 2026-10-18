import React, { memo } from 'react';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import { Alert } from '@/components/elements/alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faServer, faCopy } from '@fortawesome/free-solid-svg-icons';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { ip } from '@/lib/formatters';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const node = ServerContext.useStoreState((state) => state.server.data!.node);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
    const status = ServerContext.useStoreState((state) => state.status.value);

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);
        return !match ? null : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    return (
        <ServerContentBlock title={'Console'}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? 'The node of this server is currently under maintenance and all actions are unavailable.'
                        : isInstalling
                        ? 'This server is currently running its installation process and most actions are unavailable.'
                        : 'This server is currently being transferred to another node and all actions are unavailable.'}
                </Alert>
            )}

            {/* Premium Server Hero Island */}
            <div
                className={'w-full rounded-2xl p-5 mb-5 transition-all duration-300'}
                style={{
                    background: 'linear-gradient(135deg, rgba(16, 27, 54, 0.85) 0%, rgba(10, 18, 38, 0.95) 100%)',
                    border: '1px solid rgba(56, 189, 248, 0.22)',
                    boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.65), 0 0 25px rgba(14, 165, 233, 0.12)',
                    backdropFilter: 'blur(16px)',
                }}
            >
                <div className={'flex flex-col lg:flex-row lg:items-center justify-between gap-4'}>
                    <div className={'flex items-start sm:items-center gap-4'}>
                        <div
                            className={'w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white transition-all duration-500'}
                            style={{
                                background: status === 'running'
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : status === 'starting'
                                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                    : status === 'stopping'
                                    ? 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)'
                                    : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                                boxShadow: status === 'running'
                                    ? '0 0 24px rgba(16, 185, 129, 0.55)'
                                    : status === 'starting'
                                    ? '0 0 24px rgba(245, 158, 11, 0.55)'
                                    : '0 0 15px rgba(0, 0, 0, 0.5)',
                            }}
                        >
                            <FontAwesomeIcon icon={faServer} className={'text-xl'} />
                        </div>
                        <div>
                            <div className={'flex flex-wrap items-center gap-2.5'}>
                                <h1 className={'font-header font-bold text-2xl text-white tracking-wide'}>
                                    {name}
                                </h1>
                                <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase ${
                                        status === 'running'
                                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                            : status === 'starting'
                                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                            : status === 'stopping'
                                            ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                            : 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                                    }`}
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            status === 'running'
                                                ? 'bg-emerald-400 animate-pulse'
                                                : status === 'starting'
                                                ? 'bg-amber-400 animate-ping'
                                                : status === 'stopping'
                                                ? 'bg-orange-400 animate-pulse'
                                                : 'bg-slate-500'
                                        }`}
                                    />
                                    {status ? status : 'Offline'}
                                </span>
                            </div>
                            <div className={'flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-neutral-400'}>
                                {description && (
                                    <span className={'line-clamp-1 max-w-md text-neutral-300'}>{description}</span>
                                )}
                                {node && (
                                    <span className={'px-2 py-0.5 rounded-md bg-slate-800/80 text-cyan-300 border border-cyan-500/20 font-mono text-[11px]'}>
                                        Node: {node}
                                    </span>
                                )}
                                {allocation && (
                                    <CopyOnClick text={allocation}>
                                        <button
                                            type={'button'}
                                            className={'flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950/40 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-400 transition-colors font-mono text-[11px]'}
                                        >
                                            <FontAwesomeIcon icon={faCopy} className={'text-[10px]'} />
                                            <span>{allocation}</span>
                                        </button>
                                    </CopyOnClick>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={'flex-shrink-0'}>
                        <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                            <PowerButtons className={'flex space-x-2.5'} />
                        </Can>
                    </div>
                </div>
            </div>

            {/* Main Console & Stats Bento Layout */}
            <div className={'grid grid-cols-1 lg:grid-cols-4 gap-4 mb-5 items-stretch'}>
                <div className={'lg:col-span-3 flex flex-col'}>
                    <Spinner.Suspense>
                        <Console />
                    </Spinner.Suspense>
                </div>
                <div className={'lg:col-span-1 flex flex-col h-full'}>
                    <ServerDetailsBlock className={'h-full'} />
                </div>
            </div>

            {/* Stat Graphs Section */}
            <div className={'grid grid-cols-1 md:grid-cols-3 gap-4'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </div>
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
