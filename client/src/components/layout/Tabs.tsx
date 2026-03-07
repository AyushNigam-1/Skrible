import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  Users,
  Info,
  Maximize,
  Settings,
  LucideIcon,
} from "lucide-react";

// 1. Added 'tab' to the interface
interface TabsProps {
  setTab?: (tab: string) => void;
  tab?: string; // <-- This fixes the error!
  scriptId?: string;
}

interface TabItem {
  icon: LucideIcon;
  name: string;
  pathMatch: string;
  route: string;
  isRight?: boolean;
}

// 2. Destructure 'tab' here (even if we mainly use location for active states)
const Tabs = ({ setTab, tab, scriptId }: TabsProps) => {
  const location = useLocation();

  const tabs: TabItem[] = [
    {
      icon: FileText,
      name: "Timeline",
      pathMatch: "/timeline",
      route: `timeline/${scriptId}`,
    },
    {
      icon: MessageSquare,
      name: "Requests",
      pathMatch: "/requests",
      route: `requests/${scriptId}`,
    },
    {
      icon: Users,
      name: "Contributors",
      pathMatch: "/contributors",
      route: `contributors/${scriptId}`,
    },
    {
      icon: Info,
      name: "About",
      pathMatch: "/about",
      route: `about/${scriptId}`,
    },
    {
      icon: Maximize,
      name: "Zen Mode",
      pathMatch: "/zen",
      route: `zen/${scriptId}`,
    },
    {
      icon: Settings,
      name: "Settings",
      pathMatch: "/settings",
      route: `settings/${scriptId}`,
      isRight: true,
    },
  ];

  useEffect(() => {
    const currentTab = tabs.find((t) =>
      location.pathname.includes(t.pathMatch),
    );
    if (currentTab && setTab) {
      setTab(currentTab.name);
    }
  }, [location.pathname, setTab, tabs]);

  return (
    <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar font-mono text-sm font-bold uppercase tracking-widest w-full">
      {tabs.map((t, i) => {
        const Icon = t.icon;
        const isActive = location.pathname.includes(t.pathMatch);

        return (
          <div
            key={i}
            className={`flex items-center ${
              t.isRight ? "ml-auto pl-2 border-l border-white/10" : ""
            }`}
          >
            <Link
              to={t.route}
              className={`
              group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 active:scale-95 whitespace-nowrap
              ${
                isActive
                  ? "bg-white/5 border border-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                  : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
              }
              `}
            >
              <Icon
                className={`w-4 h-4 transition-transform duration-300 ${
                  isActive
                    ? "scale-110"
                    : "group-hover:scale-110 group-hover:-rotate-3"
                }`}
              />
              <span>{t.name}</span>
            </Link>
          </div>
        );
      })}
    </nav>
  );
};

export default Tabs;
