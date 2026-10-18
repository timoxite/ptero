import React, { useEffect, useMemo, useState } from 'react';
import {
    faClock,
    faCloudDownloadAlt,
    faCloudUploadAlt,
    faHdd,
    faMemory,
    faMicrochip,
    faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import UptimeDuration from '@/components/server/UptimeDuration';
import StatBlock from '@/components/server/console/StatBlock';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import classNames from 'classnames';
import { capitalize } from '@/lib/strings';

type Stats = Record<'memory' | 'cpu' | 'disk' | 'uptime' | 'rx' | 'tx', number>;

const Limit = ({ limit, children }: { limit: string | null; children: React.ReactNode }) => (
    <div className={'flex items-baseline truncate'}>
        <span className={'truncate'}>{children}</span>
        <span className={'ml-1.5 text-neutral-400 font-normal text-xs select-none'}>/ {limit || <>&infin;</>}</span>
    </div>
);

const ServerDetailsBlock = ({ className }: { className?: string }) => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, tx: 0, rx: 0 });

    const status = ServerContext.useStoreState((state) => state.status.value);
    const connected = ServerContext.useStoreState((state) => state.socket.connected);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);
    const limits = ServerContext.useStoreState((state) => state.server.data!.limits);

    const textLimits = useMemo(
        () => ({
            cpu: limits?.cpu ? `${limits.cpu}%` : null,
            memory: limits?.memory ? bytesToString(mbToBytes(limits.memory)) : null,
            disk: limits?.disk ? bytesToString(mbToBytes(limits.disk)) : null,
        }),
        [limits]
    );

    const cpuPercent = useMemo(() => {
        if (!limits?.cpu || status === 'offline') return null;
        return Math.min(100, (stats.cpu / limits.cpu) * 100);
    }, [stats.cpu, limits?.cpu, status]);

    const memoryPercent = useMemo(() => {
        if (!limits?.memory || status === 'offline') return null;
        return Math.min(100, (stats.memory / mbToBytes(limits.memory)) * 100);
    }, [stats.memory, limits?.memory, status]);

    const diskPercent = useMemo(() => {
        if (!limits?.disk) return null;
        return Math.min(100, (stats.disk / mbToBytes(limits.disk)) * 100);
    }, [stats.disk, limits?.disk]);

    const allocation = ServerContext.useStoreState((state) => {
        const match = state.server.data!.allocations.find((allocation) => allocation.isDefault);
        return !match ? 'n/a' : `${match.alias || ip(match.ip)}:${match.port}`;
    });

    useEffect(() => {
        if (!connected || !instance) {
            return;
        }

        instance.send(SocketRequest.SEND_STATS);
    }, [instance, connected]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        let stats: any = {};
        try {
            stats = JSON.parse(data);
        } catch (e) {
            return;
        }

        setStats({
            memory: stats.memory_bytes,
            cpu: stats.cpu_absolute,
            disk: stats.disk_bytes,
            tx: stats.network.tx_bytes,
            rx: stats.network.rx_bytes,
            uptime: stats.uptime || 0,
        });
    });

    return (
        <div className={classNames('flex flex-col gap-2', className)}>
            <StatBlock
                icon={faWifi}
                title={'Address'}
                copyOnClick={allocation}
                gradient={'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)'}
            >
                <span className={'font-mono text-xs tracking-wide text-cyan-200'}>{allocation}</span>
            </StatBlock>

            <StatBlock
                icon={faClock}
                title={'Uptime'}
                gradient={'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'}
            >
                {status === null || status === 'offline' ? (
                    <span className={'text-slate-400 font-medium text-sm'}>Offline</span>
                ) : stats.uptime > 0 ? (
                    <span className={'text-emerald-300 font-medium text-sm'}>
                        <UptimeDuration uptime={stats.uptime / 1000} />
                    </span>
                ) : (
                    <span className={'text-amber-300 font-medium text-sm'}>{capitalize(status)}</span>
                )}
            </StatBlock>

            <StatBlock
                icon={faMicrochip}
                title={'CPU Load'}
                progress={cpuPercent}
                gradient={'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}
            >
                {status === 'offline' ? (
                    <span className={'text-slate-400 font-medium text-sm'}>Offline</span>
                ) : (
                    <Limit limit={textLimits.cpu}>{stats.cpu.toFixed(2)}%</Limit>
                )}
            </StatBlock>

            <StatBlock
                icon={faMemory}
                title={'Memory'}
                progress={memoryPercent}
                gradient={'linear-gradient(135deg, #10b981 0%, #059669 100%)'}
            >
                {status === 'offline' ? (
                    <span className={'text-slate-400 font-medium text-sm'}>Offline</span>
                ) : (
                    <Limit limit={textLimits.memory}>{bytesToString(stats.memory)}</Limit>
                )}
            </StatBlock>

            <StatBlock
                icon={faHdd}
                title={'Disk Storage'}
                progress={diskPercent}
                gradient={'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}
            >
                <Limit limit={textLimits.disk}>{bytesToString(stats.disk)}</Limit>
            </StatBlock>

            <div className={'grid grid-cols-2 gap-2'}>
                <StatBlock
                    icon={faCloudDownloadAlt}
                    title={'Inbound'}
                    gradient={'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'}
                >
                    {status === 'offline' ? (
                        <span className={'text-slate-400 font-medium text-xs'}>Offline</span>
                    ) : (
                        <span className={'text-xs font-mono'}>{bytesToString(stats.rx)}</span>
                    )}
                </StatBlock>

                <StatBlock
                    icon={faCloudUploadAlt}
                    title={'Outbound'}
                    gradient={'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)'}
                >
                    {status === 'offline' ? (
                        <span className={'text-slate-400 font-medium text-xs'}>Offline</span>
                    ) : (
                        <span className={'text-xs font-mono'}>{bytesToString(stats.tx)}</span>
                    )}
                </StatBlock>
            </div>
        </div>
    );
};

export default ServerDetailsBlock;
