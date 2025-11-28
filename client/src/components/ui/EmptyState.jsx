import React from 'react';

function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-surface border border-white/5 rounded-xl">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                {Icon && <Icon className="w-8 h-8 text-slate-400" />}
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
            <p className="text-slate-400 max-w-sm mb-6">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}

export { EmptyState };
