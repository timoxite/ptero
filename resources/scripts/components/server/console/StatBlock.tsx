import React, { useState } from 'react';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy } from '@fortawesome/free-solid-svg-icons';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
    progress?: number | null;
    gradient?: string;
}

export default ({ title, copyOnClick, icon, color, className, children, progress, gradient }: StatBlockProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (copyOnClick) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const blockContent = (
        <div
            className={classNames(
                'group relative flex flex-col justify-between rounded-xl p-2.5 px-3.5 transition-all duration-300 hover:border-cyan-400/40',
                copyOnClick ? 'cursor-pointer' : '',
                className
            )}
            style={{
                background: 'linear-gradient(145deg, rgba(16, 27, 54, 0.78) 0%, rgba(10, 18, 38, 0.92) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.16)',
                boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(16px)',
            }}
            onClick={handleCopy}
        >
            <div className={'flex items-center justify-between w-full mb-1'}>
                <div className={'flex items-center gap-2 overflow-hidden'}>
                    <div
                        className={'w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0 transition-transform duration-300 group-hover:scale-105'}
                        style={{
                            background: gradient || 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
                            boxShadow: '0 0 10px rgba(14, 165, 233, 0.3)',
                        }}
                    >
                        <FontAwesomeIcon icon={icon} className={'text-[11px]'} />
                    </div>
                    <span className={'text-[11px] font-semibold text-neutral-400 tracking-wider uppercase truncate'}>
                        {title}
                    </span>
                </div>

                {copyOnClick && (
                    <span
                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                            copied
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-800 text-neutral-400 border border-slate-700/50 group-hover:text-cyan-300'
                        }`}
                    >
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className={'text-[8px]'} />
                        {copied ? 'Copied' : 'Copy'}
                    </span>
                )}
            </div>

            <div className={'w-full font-bold text-sm sm:text-base text-white tracking-tight truncate my-0.5'}>
                {children}
            </div>

            {typeof progress === 'number' && (
                <div className={'w-full bg-slate-800/80 rounded-full h-1 mt-1.5 overflow-hidden border border-slate-700/40'}>
                    <div
                        className={'h-full rounded-full transition-all duration-500'}
                        style={{
                            width: `${Math.max(0, Math.min(100, progress))}%`,
                            background: progress > 90
                                ? 'linear-gradient(90deg, #f43f5e, #e11d48)'
                                : progress > 75
                                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                : 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                            boxShadow: progress > 90
                                ? '0 0 6px rgba(244, 63, 94, 0.6)'
                                : '0 0 6px rgba(6, 182, 212, 0.6)',
                        }}
                    />
                </div>
            )}
        </div>
    );

    if (copyOnClick) {
        return <CopyOnClick text={copyOnClick}>{blockContent}</CopyOnClick>;
    }

    return blockContent;
};
