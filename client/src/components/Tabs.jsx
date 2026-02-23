import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, MessageSquare, Users, Info, Maximize } from 'lucide-react';

const Tabs = ({ tab, setTab, scriptId }) => {
    const tabs = [
        { icon: FileText, name: 'Timeline', route: `timeline/${scriptId}` },
        { icon: MessageSquare, name: 'Requests', route: `requests/${scriptId}` },
        { icon: Users, name: 'Contributors', route: `contributors/${scriptId}` },
        { icon: Info, name: 'About', route: `about/${scriptId}` },
        { icon: Maximize, name: 'Zen Mode', route: `zen/${scriptId}` },
    ];

    return (
        <div className="w-full border-b border-gray-200 dark:border-gray-800 mb-6">
            <nav className="flex gap-2 overflow-x-auto pb-[-1px]">
                {tabs.map((t, i) => {
                    const Icon = t.icon;
                    const isActive = tab === t.name;

                    return (
                        <Link
                            to={t.route}
                            key={i}
                            onClick={() => setTab(t.name)}
                            className={`
                                flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap
                                ${isActive
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                                }
                            `}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`} />
                            {t.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default Tabs;