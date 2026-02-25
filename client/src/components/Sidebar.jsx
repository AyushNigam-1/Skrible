import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Compass,
    User,
    Heart,
    Award,
    Settings,
    LogOut,
    PanelRightOpen
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    // Safely parse local storage to prevent crashes if 'user' is null
    const userData = JSON.parse(localStorage.getItem('user'));
    const username = userData?.username || 'guest';

    const menuItems = [
        { name: 'Home', icon: Home, route: '/' },
        { name: 'Explore', icon: Compass, route: "/explore" },
        { name: 'My Profile', icon: User, route: `/profile/${username}` },
        { name: 'My Favorites', icon: Heart, route: "/favourites" },
        { name: 'My Contributions', icon: Award, route: "/my-contributions" },
        { name: 'Settings', icon: Settings, route: '/setting' },
        { name: 'Logout', icon: LogOut, route: '/logout', isDanger: true }
    ];

    return (
        <div className='col-span-1 flex flex-col h-full min-h-screen p-3 border-r bg-white/5 border-gray-200 dark:border-gray-800 transition-colors duration-300 space-y-3'>

            {/* Logo Section */}
            <div className='flex justify-between items-center py-2.5 text-gray-200'>
                <img src="/logo.png" alt="Logo" className='dark:invert w-32 px-2' />
                <PanelRightOpen size="22" className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors" />
            </div>

            <hr className="border-gray-200 dark:border-gray-800" />

            {/* Navigation Links */}
            <div className='flex flex-col gap-2 mt-2'>
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.route;

                    return (
                        <Link
                            to={item.route}
                            key={index}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                font-['Playfair_Display'] text-lg tracking-wide font-thin
                                ${isActive
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 shadow-sm'
                                    : item.isDanger
                                        ? 'text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60'
                                }
                            `}
                        >
                            <Icon
                                className={`size-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`}
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default Sidebar;