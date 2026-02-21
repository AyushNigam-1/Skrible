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
        <div className='col-span-1 flex flex-col h-full min-h-screen p-3  border-r border-gray-200 dark:border-gray-800 transition-colors duration-300 space-y-3'>

            {/* Logo Section */}
            <div className='flex justify-between items-center py-2.5'>
                <img src="/logo.png" alt="Logo" className='dark:invert w-32 px-2' />
                <span className=' text-gray-400 rounded-full bg-white/5 p-1.5 border border-gray-700' >
                    <PanelRightOpen size="20" />
                </span>
            </div>

            <hr className='border-gray-200 dark:border-gray-700 ' />

            {/* Navigation Links */}
            <div className='flex flex-col gap-2'>
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.route;

                    return (
                        <Link
                            to={item.route}
                            key={index}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700  dark:text-blue-400 shadow-sm'
                                    : item.isDanger
                                        ? 'text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20'
                                        : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800'
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