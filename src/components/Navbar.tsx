import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  PlusIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const NAV_LINKS = [
  { path: "/", label: "Home", icon: HomeIcon },
  { path: "/loop/new", label: "New Loop", icon: PlusIcon },
  { path: "/about", label: "About", icon: InformationCircleIcon },
];

export default function Navbar() {
  const { pathname } = useLocation();

  const linkClasses = (isActive: boolean) =>
    [
      "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
      isActive
        ? "bg-gray-800/50 text-white"
        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30",
    ].join(" ");

  return (
    <nav className="bg-gray-900/50 border-b border-gray-800/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="px-4 text-lg font-medium text-white transition-colors hover:text-gray-200"
          >
            LoopBack
          </Link>

          <div className="flex space-x-1">
            {NAV_LINKS.map(({ path, label, icon: Icon }) => {
              const isActive = pathname === path;

              return (
                <Link
                  key={path}
                  to={path}
                  aria-current={isActive ? "page" : undefined}
                  className={linkClasses(isActive)}
                >
                  <Icon className="mr-2 h-4 w-4" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
