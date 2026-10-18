import React from 'react';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

export default ({ title, legend, children }: ChartBlockProps) => (
    <div
        className={'group relative rounded-2xl p-4 transition-all duration-300 hover:border-cyan-400/30'}
        style={{
            background: 'linear-gradient(145deg, rgba(16, 27, 54, 0.78) 0%, rgba(10, 18, 38, 0.92) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.16)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(16px)',
        }}
    >
        <div className={'flex items-center justify-between pb-2 mb-2 border-b border-slate-700/40'}>
            <h3 className={'font-header font-bold text-sm tracking-wide text-neutral-200 group-hover:text-cyan-300 transition-colors'}>
                {title}
            </h3>
            {legend && <div className={'text-xs flex items-center'}>{legend}</div>}
        </div>
        <div className={'z-10'}>{children}</div>
    </div>
);
