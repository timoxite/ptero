import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthernet, faHdd, faMemory, faMicrochip, faServer, faExternalLinkAlt, faCopy } from '@fortawesome/free-solid-svg-icons';
import copy from 'copy-to-clipboard';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import tw from 'twin.macro';
import Spinner from '@/components/elements/Spinner';
import styled from 'styled-components/macro';

// Determines if the current value is in an alarm threshold (>= 90%)
const isAlarmState = (current: number, limit: number): boolean => limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const CardWrapper = styled(Link)<{ $status?: ServerPowerState | string }>`
    ${tw`relative flex flex-col justify-between rounded-2xl p-5 no-underline transition-all duration-300 overflow-hidden group`};
    background: linear-gradient(145deg, rgba(16, 27, 54, 0.9) 0%, rgba(10, 18, 38, 0.96) 100%);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(56, 189, 248, 0.16);
    box-shadow: 0 10px 25px -8px rgba(0, 0, 0, 0.5), 0 0 15px rgba(14, 165, 233, 0.05);

    &:hover {
        transform: translateY(-4px);
        border-color: rgba(56, 189, 248, 0.45);
        box-shadow: 0 18px 35px -8px rgba(0, 0, 0, 0.65), 0 0 25px rgba(14, 165, 233, 0.22);
    }
`;

const GlowAccent = styled.div<{ $status?: ServerPowerState | string }>`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${({ $status }) => {
        if ($status === 'running') return 'linear-gradient(90deg, #10b981, #38bdf8)';
        if ($status === 'starting') return 'linear-gradient(90deg, #f59e0b, #eab308)';
        if ($status === 'stopping') return 'linear-gradient(90deg, #ef4444, #f59e0b)';
        return 'linear-gradient(90deg, rgba(100, 116, 139, 0.4), rgba(71, 85, 105, 0.4))';
    }};
    box-shadow: ${({ $status }) =>
        $status === 'running'
            ? '0 0 12px rgba(16, 185, 129, 0.6)'
            : $status === 'starting'
            ? '0 0 12px rgba(245, 158, 11, 0.6)'
            : 'none'};
`;

type Timer = ReturnType<typeof setInterval>;

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats] = useState<ServerStats | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyIp = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        copy(defaultAllocation);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended || server.isNodeUnderMaintenance) return;

        getStats().then(() => {
            interval.current = setInterval(() => getStats(), 30000);
        });

        return () => {
            interval.current && clearInterval(interval.current);
        };
    }, [isSuspended, server.isNodeUnderMaintenance]);

    const alarms = { cpu: false, memory: false, disk: false };
    if (stats) {
        alarms.cpu = server.limits.cpu === 0 ? false : stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk = server.limits.disk === 0 ? false : isAlarmState(stats.diskUsageInBytes, server.limits.disk);
    }

    const diskLimitBytes = mbToBytes(server.limits.disk);
    const diskLimitStr = server.limits.disk !== 0 ? bytesToString(diskLimitBytes) : 'Unlimited';
    const diskPercent = stats && diskLimitBytes > 0
        ? Math.min(100, Math.max(0, (stats.diskUsageInBytes / diskLimitBytes) * 100))
        : 0;

    const memoryLimitBytes = mbToBytes(server.limits.memory);
    const memoryLimitStr = server.limits.memory !== 0 ? bytesToString(memoryLimitBytes) : 'Unlimited';
    const memoryPercent = stats && memoryLimitBytes > 0
        ? Math.min(100, Math.max(0, (stats.memoryUsageInBytes / memoryLimitBytes) * 100))
        : 0;

    const cpuLimitStr = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : 'Unlimited';
    const cpuPercent = stats
        ? server.limits.cpu > 0
            ? Math.min(100, Math.max(0, (stats.cpuUsagePercent / server.limits.cpu) * 100))
            : Math.min(100, stats.cpuUsagePercent)
        : 0;

    const defaultAllocation = server.allocations
        .filter((alloc) => alloc.isDefault)
        .map((allocation) => `${allocation.alias || ip(allocation.ip)}:${allocation.port}`)[0] || 'No IP Assigned';

    return (
        <CardWrapper to={`/server/${server.id}`} className={className} $status={stats?.status}>
            <GlowAccent $status={stats?.status} />
            
            {/* Top row: Icon & Status */}
            <div>
                <div className={'flex items-center justify-between mb-3'}>
                    <div
                        className={'w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-transform duration-300 group-hover:scale-105'}
                        style={{
                            background: stats?.status === 'running' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(30, 41, 59, 0.8)',
                            border: stats?.status === 'running' ? '1px solid rgba(56, 189, 248, 0.35)' : '1px solid rgba(71, 85, 105, 0.4)',
                            color: stats?.status === 'running' ? '#38bdf8' : '#94a3b8',
                            boxShadow: stats?.status === 'running' ? '0 0 12px rgba(14, 165, 233, 0.25)' : 'none',
                        }}
                    >
                        <FontAwesomeIcon icon={faServer} />
                    </div>

                    <div>
                        {isSuspended ? (
                            <span
                                className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-red-300'}
                                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)' }}
                            >
                                <span className={'w-1.5 h-1.5 rounded-full bg-red-400'} />
                                {server.status === 'suspended' ? 'SUSPENDED' : 'ERROR'}
                            </span>
                        ) : server.isNodeUnderMaintenance ? (
                            <span
                                className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-300'}
                                style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)' }}
                            >
                                <span className={'w-1.5 h-1.5 rounded-full bg-amber-400'} />
                                MAINTENANCE
                            </span>
                        ) : server.isTransferring || server.status ? (
                            <span
                                className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-300'}
                                style={{ background: 'rgba(100, 116, 139, 0.2)', border: '1px solid rgba(100, 116, 139, 0.4)' }}
                            >
                                {server.isTransferring ? 'TRANSFERRING' : server.status?.toUpperCase() || 'BUSY'}
                            </span>
                        ) : !stats ? (
                            <span className={'flex items-center text-xs text-neutral-400'}>
                                <Spinner size={'small'} />
                            </span>
                        ) : stats.status === 'running' ? (
                            <span
                                className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-300'}
                                style={{
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
                                }}
                            >
                                <span className={'w-2 h-2 rounded-full bg-emerald-400 animate-pulse'} />
                                ONLINE
                            </span>
                        ) : stats.status === 'starting' ? (
                            <span
                                className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-300'}
                                style={{
                                    background: 'rgba(245, 158, 11, 0.15)',
                                    border: '1px solid rgba(245, 158, 11, 0.4)',
                                }}
                            >
                                <span className={'w-2 h-2 rounded-full bg-amber-400 animate-ping'} />
                                STARTING
                            </span>
                        ) : stats.status === 'stopping' ? (
                            <span
                                className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-red-300'}
                                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)' }}
                            >
                                <span className={'w-2 h-2 rounded-full bg-red-400'} />
                                STOPPING
                            </span>
                        ) : (
                            <span
                                className={'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-400'}
                                style={{ background: 'rgba(51, 65, 85, 0.35)', border: '1px solid rgba(71, 85, 105, 0.4)' }}
                            >
                                <span className={'w-1.5 h-1.5 rounded-full bg-neutral-500'} />
                                OFFLINE
                            </span>
                        )}
                    </div>
                </div>

                {/* Server Title & Info */}
                <h3 className={'text-lg font-bold text-neutral-100 group-hover:text-cyan-300 transition-colors truncate mb-1'}>
                    {server.name}
                </h3>
                {!!server.description && (
                    <p className={'text-xs text-neutral-400 line-clamp-1 mb-2'}>{server.description}</p>
                )}

                {/* Interactive Click-to-Copy Connection Tag */}
                <div
                    onClick={handleCopyIp}
                    title={'Click to copy address to clipboard'}
                    className={'inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all duration-200'}
                    style={{
                        background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.85)',
                        border: isCopied ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(56, 189, 248, 0.2)',
                        color: isCopied ? '#34d399' : '#cbd5e1',
                        boxShadow: isCopied ? '0 0 10px rgba(16, 185, 129, 0.35)' : 'none',
                    }}
                >
                    <FontAwesomeIcon icon={isCopied ? faCopy : faEthernet} className={isCopied ? 'text-emerald-400 text-xs' : 'text-cyan-400 text-xs'} />
                    <span>{isCopied ? 'Copied to clipboard!' : defaultAllocation}</span>
                </div>
            </div>

            {/* Middle: Gauges */}
            <div className={'space-y-2.5 my-4 pt-3 border-t border-neutral-800'}>
                {/* CPU */}
                <div>
                    <div className={'flex justify-between items-center text-xs mb-1'}>
                        <span className={'flex items-center gap-1.5 text-neutral-400'}>
                            <FontAwesomeIcon icon={faMicrochip} className={alarms.cpu ? 'text-red-400' : 'text-cyan-400'} />
                            <span>CPU</span>
                        </span>
                        <span className={'font-mono text-xs text-neutral-200'}>
                            {stats ? `${stats.cpuUsagePercent.toFixed(1)}%` : '0%'}
                            <span className={'text-neutral-500 ml-1 font-sans'}>/ {cpuLimitStr}</span>
                        </span>
                    </div>
                    <div className={'h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden'}>
                        <div
                            className={'h-full rounded-full transition-all duration-500'}
                            style={{
                                width: `${cpuPercent}%`,
                                background: alarms.cpu
                                    ? 'linear-gradient(90deg, #f87171, #ef4444)'
                                    : 'linear-gradient(90deg, #38bdf8, #2563eb)',
                                boxShadow: alarms.cpu ? '0 0 8px rgba(239, 68, 68, 0.6)' : '0 0 8px rgba(14, 165, 233, 0.4)',
                            }}
                        />
                    </div>
                </div>

                {/* Memory */}
                <div>
                    <div className={'flex justify-between items-center text-xs mb-1'}>
                        <span className={'flex items-center gap-1.5 text-neutral-400'}>
                            <FontAwesomeIcon icon={faMemory} className={alarms.memory ? 'text-red-400' : 'text-indigo-400'} />
                            <span>RAM</span>
                        </span>
                        <span className={'font-mono text-xs text-neutral-200'}>
                            {stats ? bytesToString(stats.memoryUsageInBytes) : '0 MB'}
                            <span className={'text-neutral-500 ml-1 font-sans'}>/ {memoryLimitStr}</span>
                        </span>
                    </div>
                    <div className={'h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden'}>
                        <div
                            className={'h-full rounded-full transition-all duration-500'}
                            style={{
                                width: `${memoryPercent}%`,
                                background: alarms.memory
                                    ? 'linear-gradient(90deg, #f87171, #ef4444)'
                                    : 'linear-gradient(90deg, #818cf8, #6366f1)',
                                boxShadow: alarms.memory ? '0 0 8px rgba(239, 68, 68, 0.6)' : '0 0 8px rgba(99, 102, 241, 0.4)',
                            }}
                        />
                    </div>
                </div>

                {/* Disk */}
                <div>
                    <div className={'flex justify-between items-center text-xs mb-1'}>
                        <span className={'flex items-center gap-1.5 text-neutral-400'}>
                            <FontAwesomeIcon icon={faHdd} className={alarms.disk ? 'text-red-400' : 'text-emerald-400'} />
                            <span>Disk</span>
                        </span>
                        <span className={'font-mono text-xs text-neutral-200'}>
                            {stats ? bytesToString(stats.diskUsageInBytes) : '0 MB'}
                            <span className={'text-neutral-500 ml-1 font-sans'}>/ {diskLimitStr}</span>
                        </span>
                    </div>
                    <div className={'h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden'}>
                        <div
                            className={'h-full rounded-full transition-all duration-500'}
                            style={{
                                width: `${diskPercent}%`,
                                background: alarms.disk
                                    ? 'linear-gradient(90deg, #f87171, #ef4444)'
                                    : 'linear-gradient(90deg, #34d399, #059669)',
                                boxShadow: alarms.disk ? '0 0 8px rgba(239, 68, 68, 0.6)' : '0 0 8px rgba(16, 185, 129, 0.4)',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Footer: Server identifier & CTA */}
            <div className={'flex items-center justify-between pt-2.5 border-t border-neutral-800 text-xs'}>
                <span className={'text-neutral-500 font-mono text-[11px]'}>
                    ID: {server.id.slice(0, 8)}
                </span>
                <span className={'flex items-center gap-1.5 text-cyan-400 font-medium group-hover:text-cyan-300 transition-colors'}>
                    <span>Manage</span>
                    <FontAwesomeIcon icon={faExternalLinkAlt} className={'text-[10px] group-hover:translate-x-0.5 transition-transform'} />
                </span>
            </div>
        </CardWrapper>
    );
};
