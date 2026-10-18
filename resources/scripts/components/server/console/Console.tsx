import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ITerminalOptions, Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { SearchBarAddon } from 'xterm-addon-search-bar';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { Unicode11Addon } from 'xterm-addon-unicode11';
import { ScrollDownHelperAddon } from '@/plugins/XtermScrollDownHelperAddon';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ServerContext } from '@/state/server';
import { usePermissions } from '@/plugins/usePermissions';
import { theme as th } from 'twin.macro';
import useEventListener from '@/plugins/useEventListener';
import { debounce } from 'debounce';
import { usePersistedState } from '@/plugins/usePersistedState';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTerminal,
    faTrashAlt,
    faDownload,
    faExpand,
    faCompress,
    faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';
import Tooltip from '@/components/elements/tooltip/Tooltip';

import 'xterm/css/xterm.css';
import styles from './style.module.css';

const theme = {
    background: '#070c18',
    cursor: '#38bdf8',
    black: '#070c18',
    red: '#f43f5e',
    green: '#10b981',
    yellow: '#f59e0b',
    blue: '#38bdf8',
    magenta: '#c084fc',
    cyan: '#06b6d4',
    white: '#e2e8f0',
    brightBlack: 'rgba(255, 255, 255, 0.25)',
    brightRed: '#fb7185',
    brightGreen: '#34d399',
    brightYellow: '#fbbf24',
    brightBlue: '#60a5fa',
    brightMagenta: '#d8b4fe',
    brightCyan: '#22d3ee',
    brightWhite: '#ffffff',
    selection: 'rgba(56, 189, 248, 0.3)',
};

const terminalProps: ITerminalOptions = {
    disableStdin: true,
    cursorStyle: 'underline',
    allowTransparency: true,
    fontSize: 12,
    fontFamily: th('fontFamily.mono'),
    rows: 32,
    theme: theme,
};

const quickCommands = [
    { label: 'help', cmd: 'help' },
    { label: 'status', cmd: 'status' },
    { label: 'reload', cmd: 'reload' },
    { label: 'restart', cmd: 'restart' },
    { label: 'list', cmd: 'list' },
    { label: 'version', cmd: 'version' },
];

export default () => {
    const TERMINAL_PRELUDE = '\u001b[1m\u001b[36mcontainer@timoxpanel~ \u001b[0m';
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const terminal = useMemo(() => new Terminal({ ...terminalProps }), []);
    const fitAddon = useMemo(() => new FitAddon(), []);
    const searchAddon = useMemo(() => new SearchAddon(), []);
    const searchBar = useMemo(() => new SearchBarAddon({ searchAddon }), [searchAddon]);
    const webLinksAddon = useMemo(() => new WebLinksAddon(), []);
    const unicode11Addon = useMemo(() => new Unicode11Addon(), []);
    const scrollDownHelperAddon = useMemo(() => new ScrollDownHelperAddon(), []);

    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const [canSendCommands] = usePermissions(['control.console']);
    const serverId = ServerContext.useStoreState((state) => state.server.data!.id);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const [history, setHistory] = usePersistedState<string[]>(`${serverId}:command_history`, []);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const zIndex = `
    .xterm-search-bar__addon {
        z-index: 20;
    }`;

    const handleConsoleOutput = (line: string, prelude = false) =>
        terminal.writeln((prelude ? TERMINAL_PRELUDE : '') + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m');

    const handleTransferStatus = (status: string) => {
        switch (status) {
            case 'failure':
                terminal.writeln(TERMINAL_PRELUDE + 'Transfer has failed.\u001b[0m');
                return;
        }
    };

    const handleDaemonErrorOutput = (line: string) =>
        terminal.writeln(
            TERMINAL_PRELUDE + '\u001b[1m\u001b[41m' + line.replace(/(?:\r\n|\r|\n)$/im, '') + '\u001b[0m'
        );

    const handlePowerChangeEvent = (state: string) =>
        terminal.writeln(TERMINAL_PRELUDE + 'Server marked as ' + state + '...\u001b[0m');

    const sendCommand = (cmd?: string) => {
        const command = cmd ?? inputRef.current?.value ?? '';
        if (command.trim().length > 0 && instance && connected) {
            setHistory((prevHistory) => [command, ...prevHistory!].slice(0, 32));
            setHistoryIndex(-1);
            instance.send('send command', command);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    const handleCommandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            const newIndex = Math.min(historyIndex + 1, history!.length - 1);
            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';
            e.preventDefault();
        }

        if (e.key === 'ArrowDown') {
            const newIndex = Math.max(historyIndex - 1, -1);
            setHistoryIndex(newIndex);
            e.currentTarget.value = history![newIndex] || '';
        }

        if (e.key === 'Enter') {
            sendCommand();
        }
    };

    const clearConsole = () => {
        terminal.clear();
    };

    const downloadLogs = () => {
        let text = '';
        const buffer = terminal.buffer.active;
        for (let i = 0; i < buffer.length; i++) {
            const line = buffer.getLine(i);
            if (line) {
                text += line.translateToString(true) + '\n';
            }
        }
        const blob = new Blob([text || 'No console logs available.'], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `server-${serverId}-console.log`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleFullscreen = () => {
        setIsFullscreen((prev) => !prev);
        setTimeout(() => {
            if (terminal.element) {
                fitAddon.fit();
            }
        }, 150);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
                setTimeout(() => {
                    if (terminal.element) {
                        fitAddon.fit();
                    }
                }, 150);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    useEffect(() => {
        if (connected && ref.current && !terminal.element) {
            terminal.loadAddon(fitAddon);
            terminal.loadAddon(searchAddon);
            terminal.loadAddon(searchBar);
            terminal.loadAddon(webLinksAddon);
            terminal.loadAddon(unicode11Addon);
            terminal.loadAddon(scrollDownHelperAddon);

            terminal.open(ref.current);
            terminal.unicode.activeVersion = '11';

            fitAddon.fit();
            searchBar.addNewStyle(zIndex);

            terminal.attachCustomKeyEventHandler((e: KeyboardEvent) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    document.execCommand('copy');
                    return false;
                } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                    e.preventDefault();
                    searchBar.show();
                    return false;
                } else if (e.key === 'Escape') {
                    searchBar.hidden();
                }
                return true;
            });
        }
    }, [terminal, connected]);

    useEventListener(
        'resize',
        debounce(() => {
            if (terminal.element) {
                fitAddon.fit();
            }
        }, 100)
    );

    useEffect(() => {
        const listeners: Record<string, (s: string) => void> = {
            [SocketEvent.STATUS]: handlePowerChangeEvent,
            [SocketEvent.CONSOLE_OUTPUT]: handleConsoleOutput,
            [SocketEvent.INSTALL_OUTPUT]: handleConsoleOutput,
            [SocketEvent.TRANSFER_LOGS]: handleConsoleOutput,
            [SocketEvent.TRANSFER_STATUS]: handleTransferStatus,
            [SocketEvent.DAEMON_MESSAGE]: (line) => handleConsoleOutput(line, true),
            [SocketEvent.DAEMON_ERROR]: handleDaemonErrorOutput,
        };

        if (connected && instance) {
            if (!isTransferring) {
                terminal.clear();
            }

            Object.keys(listeners).forEach((key: string) => {
                instance.addListener(key, listeners[key]);
            });
            instance.send(SocketRequest.SEND_LOGS);
        }

        return () => {
            if (instance) {
                Object.keys(listeners).forEach((key: string) => {
                    instance.removeListener(key, listeners[key]);
                });
            }
        };
    }, [connected, instance]);

    const terminalContainer = (
        <div
            className={classNames(
                'flex flex-col w-full transition-all duration-300',
                isFullscreen
                    ? 'fixed inset-4 z-50 p-4 rounded-2xl bg-[#070c18]/95 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_80px_rgba(0,0,0,0.9)]'
                    : 'relative rounded-2xl overflow-hidden'
            )}
            style={{
                background: 'linear-gradient(180deg, rgba(12, 20, 38, 0.95) 0%, rgba(7, 12, 24, 0.98) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(14, 165, 233, 0.1)',
            }}
        >
            <SpinnerOverlay visible={!connected} size={'large'} />

            {/* Console Toolbar Header */}
            <div className={'flex flex-wrap items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60'}>
                <div className={'flex items-center gap-2.5'}>
                    <div className={'w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400'}>
                        <FontAwesomeIcon icon={faTerminal} className={'text-xs'} />
                    </div>
                    <span className={'text-xs font-bold text-white tracking-wide uppercase'}>
                        Live Console
                    </span>
                    <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                            connected
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        {connected ? 'Connected' : 'Connecting'}
                    </span>
                </div>

                <div className={'flex items-center gap-1.5 mt-2 sm:mt-0'}>
                    <Tooltip content={'Clear Terminal'}>
                        <button
                            type={'button'}
                            onClick={clearConsole}
                            className={'p-2 rounded-lg text-neutral-400 hover:text-rose-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-rose-500/40 transition-all text-xs'}
                        >
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                    </Tooltip>
                    <Tooltip content={'Download Console Logs'}>
                        <button
                            type={'button'}
                            onClick={downloadLogs}
                            className={'p-2 rounded-lg text-neutral-400 hover:text-cyan-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/40 transition-all text-xs'}
                        >
                            <FontAwesomeIcon icon={faDownload} />
                        </button>
                    </Tooltip>
                    <Tooltip content={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
                        <button
                            type={'button'}
                            onClick={toggleFullscreen}
                            className={'p-2 rounded-lg text-neutral-400 hover:text-cyan-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/40 transition-all text-xs'}
                        >
                            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} />
                        </button>
                    </Tooltip>
                </div>
            </div>

            {/* Quick Command Chips */}
            {canSendCommands && (
                <div className={'flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/50 bg-slate-950/40 overflow-x-auto text-xs'}>
                    <span className={'text-[10px] uppercase font-semibold text-neutral-500 mr-1 select-none'}>Quick:</span>
                    {quickCommands.map((q) => (
                        <button
                            key={q.cmd}
                            type={'button'}
                            onClick={() => sendCommand(q.cmd)}
                            disabled={!instance || !connected}
                            className={'px-2.5 py-0.5 rounded-full bg-slate-800/90 hover:bg-cyan-950/80 text-neutral-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/40 transition-all font-mono text-[11px] whitespace-nowrap active:scale-95'}
                        >
                            /{q.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Xterm Terminal Container */}
            <div className={classNames('p-2.5 bg-[#070c18] font-mono text-sm', isFullscreen ? 'flex-1 min-h-0' : 'min-h-[22rem]')}>
                <div className={'h-full'} style={{ minHeight: isFullscreen ? '100%' : '22rem' }}>
                    <div id={styles.terminal} ref={ref} className={'h-full'} />
                </div>
            </div>

            {/* Command Input Bar */}
            {canSendCommands && (
                <div className={'p-3 border-t border-slate-800/80 bg-slate-900/80'}>
                    <div className={'relative flex items-center w-full'}>
                        <div className={'absolute left-3 text-cyan-400 select-none font-mono text-sm font-bold flex items-center pointer-events-none'}>
                            <span>&gt;</span>
                        </div>
                        <input
                            ref={inputRef}
                            className={'w-full pl-7 pr-12 py-2.5 rounded-xl font-mono text-sm text-neutral-100 placeholder-neutral-500 bg-slate-950/80 border border-slate-700/60 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all shadow-inner'}
                            type={'text'}
                            placeholder={'Type a server command or /help...'}
                            aria-label={'Console command input.'}
                            disabled={!instance || !connected}
                            onKeyDown={handleCommandKeyDown}
                            autoCorrect={'off'}
                            autoCapitalize={'none'}
                        />
                        <button
                            type={'button'}
                            onClick={() => sendCommand()}
                            disabled={!instance || !connected}
                            className={'absolute right-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.4)] transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none'}
                        >
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            {isFullscreen && (
                <div
                    className={'fixed inset-0 bg-black/80 backdrop-blur-md z-40 transition-opacity'}
                    onClick={toggleFullscreen}
                />
            )}
            {terminalContainer}
        </>
    );
};
