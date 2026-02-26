import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Compass,
    User,
    Heart,
    Award,
    LogOut,
    PanelRightOpen
} from 'lucide-react';

const Sidebar = () => {

    const location = useLocation();
    const userData = JSON.parse(localStorage.getItem('user'));
    const username = userData?.username || 'guest';

    const menuItems = [
        { name: 'Home', icon: Home, route: '/' },
        { name: 'Explore', icon: Compass, route: "/explore" },
        { name: 'My Profile', icon: User, route: `/profile/${username}` },
        { name: 'My Favorites', icon: Heart, route: "/favourites" },
        { name: 'My Contributions', icon: Award, route: "/my-contributions" },
        { name: 'Logout', icon: LogOut, route: '/logout', isDanger: true }
    ];

    return (
        <div className="col-span-1 flex flex-col h-full min-h-screen p-4 bg-white/5 backdrop-blur-xl border-r border-white/10 transition-all duration-300 font-['Inter']">
            <div className='flex justify-between items-center py-4 px-2'>
                <img src="/logo.png" alt="Logo" className='dark:invert w-28 brightness-110' />
                <PanelRightOpen size="20" className="text-gray-500 hover:text-white cursor-pointer transition-colors" />
            </div>

            <div className="my-4 px-2">
                <hr className="border-white/10" />
            </div>

            <div className='flex flex-col gap-1.5 flex-1'>
                {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.route;

                    return (
                        <Link
                            to={item.route}
                            key={index}
                            className={`
                                flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300
                                text-[15px] font-semibold tracking-tight
                                ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 translate-x-1'
                                    : item.isDanger
                                        ? 'text-red-500 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent'
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

            {/* Bottom Section: User Preview */}
            <div className='mt-auto p-2'>
                <div className='flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md shadow-sm'>
                    <div className='w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold'>
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex flex-col overflow-hidden'>
                        <span className='text-sm font-bold text-white truncate'>@{username}</span>
                        <span className='text-[10px] text-gray-500 font-bold uppercase tracking-widest'>Pro Member</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;