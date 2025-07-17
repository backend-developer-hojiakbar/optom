import React from 'react';
import { HashRouter, Route, Routes, Navigate, useLocation, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext.tsx';
import { LayoutDashboard, Terminal, History, Package, Barcode, Users, Truck, BarChart2, UsersRound, Settings, Lock } from 'lucide-react';
import Savdo from './pages/Savdo.tsx';
import Dashboard from './pages/Dashboard.tsx';
import SavdolarTarixi from './pages/SavdolarTarixi.tsx';
import Mahsulotlar from './pages/Mahsulotlar.tsx';
import Ombor from './pages/Ombor.tsx';
import Mijozlar from './pages/Mijozlar.tsx';
import YetkazibBeruvchilar from './pages/YetkazibBeruvchilar.tsx';
import Hisobotlar from './pages/Hisobotlar.tsx';
import Sozlamalar from './pages/Sozlamalar.tsx';
import LoginPage from './pages/LoginPage.tsx';
import Hodimlar from './pages/Hodimlar.tsx';
import { Permission } from './types.ts';

const navLinks = [
  { path: '/', label: "Boshqaruv Paneli", icon: LayoutDashboard, permission: Permission.VIEW_DASHBOARD },
  { path: '/savdo', label: "Savdo Terminali", icon: Terminal, permission: Permission.USE_SALES_TERMINAL },
  { path: '/savdo-tarixi', label: "Savdolar Tarixi", icon: History, permission: Permission.VIEW_SALES_HISTORY },
  { path: '/mahsulotlar', label: "Mahsulotlar", icon: Package, permission: Permission.MANAGE_PRODUCTS },
  { path: '/ombor', label: "Ombor", icon: Barcode, permission: Permission.MANAGE_WAREHOUSE },
  { path: '/mijozlar', label: "Mijozlar", icon: Users, permission: Permission.MANAGE_CUSTOMERS },
  { path: '/yetkazib-beruvchilar', label: "Yetkazib Beruvchilar", icon: Truck, permission: Permission.MANAGE_SUPPLIERS },
  { path: '/hisobotlar', label: "Hisobotlar", icon: BarChart2, permission: Permission.VIEW_REPORTS },
  { path: '/hodimlar', label: "Xodimlar", icon: UsersRound, permission: Permission.MANAGE_EMPLOYEES },
  { path: '/sozlamalar', label: "Sozlamalar", icon: Settings, permission: Permission.MANAGE_SETTINGS },
];

const Sidebar = () => {
  const { currentUser, logout, roles } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  }
  
  const currentUserRoleName = currentUser?.role?.name || 'Noma\'lum rol';

  return (
    <div className="w-72 bg-white dark:bg-gray-800 shadow-lg flex flex-col h-screen fixed">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">Optom POS</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Savdo boshqaruv tizimi</p>
      </div>
      <div className="p-4 border-b dark:border-gray-700">
        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{currentUser?.name}</p>
        <p className="text-sm text-blue-500 dark:text-blue-400">{currentUserRoleName}</p>
      </div>
      <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
        {navLinks.filter(link => {
            const { hasPermission } = useAppContext();
            return hasPermission(link.permission);
        }).map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`
            }
          >
            <link.icon className="w-6 h-6 mr-4" />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center">
        <button onClick={handleLogout} className="flex items-center justify-center w-full px-4 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/50">
          <Lock className="w-6 h-6 mr-2" />
          Chiqish
        </button>
      </div>
    </div>
  );
};

const PageHeader = () => {
    const location = useLocation();
    const { hasPermission } = useAppContext();
    
    const currentLink = navLinks.find(link => {
        if (!hasPermission(link.permission)) return false;
        if (link.path === '/') return location.pathname === '/';
        const isSavdoPage = location.pathname === '/savdo' || location.pathname.startsWith('/savdo/');
        if (isSavdoPage) {
            return link.path === '/savdo';
        }
        return location.pathname.startsWith(link.path);
    });

    const title = currentLink ? currentLink.label : 'Boshqaruv Paneli';

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm p-6 sticky top-0 z-20">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        </header>
    )
}

const DefaultLayout = () => {
    return (
        <div className="flex bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-72 flex flex-col">
                <main className="flex-1">
                    <PageHeader />
                    <div className="p-8">
                        <Outlet />
                    </div>
                </main>
                <footer className="text-center py-4 px-8 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                    © 2025 optom POS | BARCHA HUQUQLAR HIMOYALANGAN | CDCGroup TOMONIDAN ISHLAB CHIQILDI | CraDev COMPANY TEXNOLOGIK HAMKORLIGIDA
                </footer>
            </div>
        </div>
    );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, isDataLoading } = useAppContext();
    const location = useLocation();

    if (isDataLoading) {
        return <div className="flex justify-center items-center h-screen bg-gray-900 text-white text-xl">Yuklanmoqda...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const PermissionRoute: React.FC<{ permission: Permission, children: React.ReactNode }> = ({ permission, children }) => {
    const { hasPermission } = useAppContext();
    if (!hasPermission(permission)) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<PermissionRoute permission={Permission.VIEW_DASHBOARD}><Dashboard /></PermissionRoute>} />
        <Route path="/savdo-tarixi" element={<PermissionRoute permission={Permission.VIEW_SALES_HISTORY}><SavdolarTarixi /></PermissionRoute>} />
        <Route path="/mahsulotlar" element={<PermissionRoute permission={Permission.MANAGE_PRODUCTS}><Mahsulotlar /></PermissionRoute>} />
        <Route path="/ombor" element={<PermissionRoute permission={Permission.MANAGE_WAREHOUSE}><Ombor /></PermissionRoute>} />
        <Route path="/mijozlar" element={<PermissionRoute permission={Permission.MANAGE_CUSTOMERS}><Mijozlar /></PermissionRoute>} />
        <Route path="/yetkazib-beruvchilar" element={<PermissionRoute permission={Permission.MANAGE_SUPPLIERS}><YetkazibBeruvchilar /></PermissionRoute>} />
        <Route path="/hisobotlar" element={<PermissionRoute permission={Permission.VIEW_REPORTS}><Hisobotlar /></PermissionRoute>} />
        <Route path="/hodimlar" element={<PermissionRoute permission={Permission.MANAGE_EMPLOYEES}><Hodimlar /></PermissionRoute>} />
        <Route path="/sozlamalar" element={<PermissionRoute permission={Permission.MANAGE_SETTINGS}><Sozlamalar /></PermissionRoute>} />
      </Route>
      
      <Route path="/savdo" element={<PermissionRoute permission={Permission.USE_SALES_TERMINAL}><Savdo /></PermissionRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};


const MainApp = () => {
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/*" element={<ProtectedRoute><AppRoutes /></ProtectedRoute>} />
      </Routes>
    </HashRouter>
  );
};

const App = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;