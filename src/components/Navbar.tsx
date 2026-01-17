import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  PlusIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/loop/new", label: "New Loop", icon: PlusIcon },
    { path: "/about", label: "About", icon: InformationCircleIcon },
  ];

  return (
    <nav className="bg-gray-900/50 border-b border-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to="/"
              className="flex items-center px-4 text-lg font-medium text-white hover:text-gray-200 transition-colors"
            >
              LoopBack
            </Link>
          </div>
          <div className="flex space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center px-3 py-2 text-sm font-normal rounded-md transition-colors
                    ${
                      isActive
                        ? "bg-gray-800/50 text-white"
                        : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/30"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
