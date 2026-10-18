import React, { useEffect, useState } from 'react';
import Can from '@/components/elements/Can';
import { ServerContext } from '@/state/server';
import { PowerAction } from '@/components/server/console/ServerConsoleContainer';
import { Dialog } from '@/components/elements/dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faSyncAlt, faSkull } from '@fortawesome/free-solid-svg-icons';

interface PowerButtonProps {
    className?: string;
}

export default ({ className }: PowerButtonProps) => {
    const [open, setOpen] = useState(false);
    const status = ServerContext.useStoreState((state) => state.status.value);
    const instance = ServerContext.useStoreState((state) => state.socket.instance);

    const killable = status === 'stopping';
    const onButtonClick = (
        action: PowerAction | 'kill-confirmed',
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ): void => {
        e.preventDefault();
        if (action === 'kill') {
            return setOpen(true);
        }

        if (instance) {
            setOpen(false);
            instance.send('set state', action === 'kill-confirmed' ? 'kill' : action);
        }
    };

    useEffect(() => {
        if (status === 'offline') {
            setOpen(false);
        }
    }, [status]);

    return (
        <div className={className}>
            <Dialog.Confirm
                open={open}
                hideCloseIcon
                onClose={() => setOpen(false)}
                title={'Forcibly Stop Process'}
                confirm={'Continue'}
                onConfirmed={onButtonClick.bind(this, 'kill-confirmed')}
            >
                Forcibly stopping a server can lead to data corruption.
            </Dialog.Confirm>
            <Can action={'control.start'}>
                <button
                    type={'button'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm tracking-wide transition-all duration-300 ${
                        status !== 'offline'
                            ? 'opacity-40 cursor-not-allowed bg-slate-800/80 text-slate-500 border border-slate-700/40'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_28px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    disabled={status !== 'offline'}
                    onClick={onButtonClick.bind(this, 'start')}
                >
                    <FontAwesomeIcon icon={faPlay} className={'text-xs'} />
                    <span>Start</span>
                </button>
            </Can>
            <Can action={'control.restart'}>
                <button
                    type={'button'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm tracking-wide transition-all duration-300 ${
                        !status
                            ? 'opacity-40 cursor-not-allowed bg-slate-800/80 text-slate-500 border border-slate-700/40'
                            : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(14,165,233,0.35)] hover:shadow-[0_0_28px_rgba(14,165,233,0.6)] hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    disabled={!status}
                    onClick={onButtonClick.bind(this, 'restart')}
                >
                    <FontAwesomeIcon icon={faSyncAlt} className={'text-xs'} />
                    <span>Restart</span>
                </button>
            </Can>
            <Can action={'control.stop'}>
                <button
                    type={'button'}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm tracking-wide transition-all duration-300 ${
                        status === 'offline'
                            ? 'opacity-40 cursor-not-allowed bg-slate-800/80 text-slate-500 border border-slate-700/40'
                            : killable
                            ? 'bg-gradient-to-r from-amber-600 to-red-700 hover:from-amber-500 hover:to-red-600 text-white shadow-[0_0_24px_rgba(239,68,68,0.5)] animate-pulse'
                            : 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:shadow-[0_0_28px_rgba(244,63,94,0.6)] hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    disabled={status === 'offline'}
                    onClick={onButtonClick.bind(this, killable ? 'kill' : 'stop')}
                >
                    <FontAwesomeIcon icon={killable ? faSkull : faStop} className={'text-xs'} />
                    <span>{killable ? 'Kill' : 'Stop'}</span>
                </button>
            </Can>
        </div>
    );
};
