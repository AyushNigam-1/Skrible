import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, MessageSquare, Users, Info, Maximize, Settings } from 'lucide-react';

const Tabs = ({ setTab, scriptId }) => {
    // 1. Get the current URL location
    const location = useLocation();

    const tabs = [
        { icon: FileText, name: 'Timeline', pathMatch: '/timeline', route: `timeline/${scriptId}` },
        { icon: MessageSquare, name: 'Requests', pathMatch: '/requests', route: `requests/${scriptId}` },
        { icon: Users, name: 'Contributors', pathMatch: '/contributors', route: `contributors/${scriptId}` },
        { icon: Info, name: 'About', pathMatch: '/about', route: `about/${scriptId}` },
        { icon: Maximize, name: 'Zen Mode', pathMatch: '/zen', route: `zen/${scriptId}` },
        { icon: Settings, name: 'Settings', pathMatch: '/settings', route: `settings/${scriptId}`, isRight: true },
    ];

    useEffect(() => {
        const currentTab = tabs.find(t => location.pathname.includes(t.pathMatch));
        if (currentTab && setTab) {
            setTab(currentTab.name);
        }
    }, [location.pathname, setTab]);

    return (
        <div className="w-full border-b border-gray-200 dark:border-gray-800">
            <nav className="flex w-full gap-2 overflow-x-auto">
                {tabs.map((t, i) => {
                    const Icon = t.icon;
                    const isActive = location.pathname.includes(t.pathMatch);
                    return (
                        <Link
                            to={t.route}
                            key={i}
                            className={`
                                flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap
                                ${t.isRight ? 'ml-auto' : ''} 
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