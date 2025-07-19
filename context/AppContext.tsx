import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Product, Customer, Supplier, Sale, Employee, Role, Permission, StoreSettings, DebtPayment, GoodsReceipt, Unit } from '../types.ts';

import { CartItem } from '../types.ts';


import api from '../api.ts';

interface AppContextType {
    isDataLoading: boolean;
    currentUser: Employee | null;
    login: (pin: string) => Promise<boolean>;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
    employees: Employee[];
    roles: Role[];
    products: Product[];
    customers: Customer[];
    suppliers: Supplier[];
    sales: Sale[];
    debtPayments: DebtPayment[];
    goodsReceipts: GoodsReceipt[];
    units: Unit[];
    settings: StoreSettings | null;
    cart: CartItem[];
    searchResults: Product[];
    searchTerm: string;
    selectedCustomerId: string | null;
    isPaymentModalOpen: boolean;
    isReceiptModalOpen: boolean;
    lastSale: Sale | null;
    isAddCustomerModalOpen: boolean;
    addProductToCart: (product: Product, quantity: number) => void;
    removeProductFromCart: (productId: string) => void;
    updateCartItemQuantity: (productId: string, quantity: number) => void;
    saveSale: (sale: Sale) => Promise<Sale>;
    setSearchTerm: (term: string) => void;
    setSearchResults: (results: Product[]) => void;
    setSelectedCustomerId: (id: string | null) => void;
    setIsPaymentModalOpen: (open: boolean) => void;
    setIsReceiptModalOpen: (open: boolean) => void;
    setLastSale: (sale: Sale | null) => void;
    setIsAddCustomerModalOpen: (open: boolean) => void;
    reloadData: () => Promise<void>;
    createSale: (saleData: Omit<Sale, 'id' | 'date' | 'seller'>) => Promise<Sale>;
    addGoodsReceipt: (receiptData: Omit<GoodsReceipt, 'id' | 'date' | 'supplier'>) => Promise<GoodsReceipt>;
    payDebt: (customerId: string, amount: number, paymentType: any) => Promise<void>;
    updateSettings: (settingsData: Partial<StoreSettings>) => Promise<StoreSettings>;
    addEmployee: (data: Partial<Employee>) => Promise<Employee>;
    updateEmployee: (id: string, data: Partial<Employee>) => Promise<Employee>;
    deleteEmployee: (id: string) => Promise<void>;
    addRole: (data: Partial<Role>) => Promise<Role>;
    updateRole: (id: string, data: Partial<Role>) => Promise<Role>;
    deleteRole: (id: string) => Promise<void>;
    addProduct: (data: Partial<Product>) => Promise<Product>;
    updateProduct: (id: string, data: Partial<Product>) => Promise<Product>;
    deleteProduct: (id: string) => Promise<void>;
    addCustomer: (data: Partial<Customer>) => Promise<Customer>;
    updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer>;
    deleteCustomer: (id: string) => Promise<void>;
    addSupplier: (data: Partial<Supplier>) => Promise<Supplier>;
    updateSupplier: (id: string, data: Partial<Supplier>) => Promise<Supplier>;
    deleteSupplier: (id: string) => Promise<void>;
    addUnit: (data: Partial<Unit>) => Promise<Unit>;
    deleteUnit: (id: string) => Promise<void>;
    setIsDataLoading: (loading: boolean) => void;
    setCurrentUser: (user: Employee | null) => void;
    setProducts: (products: Product[]) => void;
    setCustomers: (customers: Customer[]) => void;
    setSuppliers: (suppliers: Supplier[]) => void;
    setSales: (sales: Sale[]) => void;
    setDebtPayments: (payments: DebtPayment[]) => void;
    setSettings: (settings: StoreSettings | null) => void;
    setUnits: (units: Unit[]) => void;
    setGoodsReceipts: (receipts: GoodsReceipt[]) => void;
    setRoles: (roles: Role[]) => void;
    setEmployees: (employees: Employee[]) => void;
    setCart: (cart: CartItem[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);

    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
    const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [lastSale, setLastSale] = useState<Sale | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

    const addProductToCart = useCallback((product: Product, quantity: number) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.product.id === product.id);
            if (existingItem) {
                return prev.map(item => 
                    item.product.id === product.id 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { productId: product.id, product, quantity, price: product.salePrice }];
        });
    }, []);

    const removeProductFromCart = useCallback((productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    }, []);

    const updateCartItemQuantity = useCallback((productId: string, quantity: number) => {
        setCart(prev => 
            prev.map(item => 
                item.product.id === productId 
                    ? { ...item, quantity }
                    : item
            )
        );
    }, []);

    const fetchInitialData = useCallback(async () => {
        setIsDataLoading(true);
        try {
            const { data } = await api.get('/data/initial/');
            setProducts(data.products);
            setCustomers(data.customers);
            setSuppliers(data.suppliers);
            setSales(data.sales);
            setDebtPayments(data.debtPayments);
            setSettings(data.settings);
            setUnits(data.units);
            setGoodsReceipts(data.goodsReceipts);
            setRoles(data.roles);
            setEmployees(data.employees);
            const meResponse = await api.get('/auth/me/');
            setCurrentUser(meResponse.data);
        } catch (error) {
            console.error("Failed to fetch initial data", error);
            logout();
        } finally {
            setIsDataLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('pos-auth-token');
        if (token) {
            fetchInitialData();
        } else {
            setIsDataLoading(false);
        }
    }, [fetchInitialData]);

    const login = async (pin: string): Promise<boolean> => {
        try {
            const { data } = await api.post('/auth/login/', { pin });
            localStorage.setItem('pos-auth-token', data.token);
            await fetchInitialData();
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('pos-auth-token');
        setCurrentUser(null);
        setProducts([]);
        setCustomers([]);
        setSuppliers([]);
        setSales([]);
        setDebtPayments([]);
        setSettings(null);
        setUnits([]);
        setGoodsReceipts([]);
        setRoles([]);
        setEmployees([]);
        setIsDataLoading(false);
    };

    const hasPermission = (permission: Permission) => {
        if (!currentUser) return false;
        return currentUser.role.permissions.includes(permission);
    };

    const saveSale = useCallback(async (sale: Sale) => {
        const response = await api.post('/sales/', sale);
        setSales(prev => [...prev, response.data]);
        setLastSale(response.data);
        return response.data;
    }, []);

    const createSale = useCallback(async (saleData: Omit<Sale, 'id' | 'date' | 'seller'>) => {
        const response = await api.post('/sales/', saleData);
        setSales(prev => [...prev, response.data]);
        setLastSale(response.data);
        return response.data;
    }, []);

    const addGoodsReceipt = async (receiptData: Omit<GoodsReceipt, 'id' | 'date' | 'supplier'>) => {
        const { data } = await api.post<GoodsReceipt>('/goods-receipts/', receiptData);
        await fetchInitialData();
        return data;
    };

    const payDebt = async (customerId: string, amount: number, paymentType: any) => {
        await api.post('/debt-payments/', { customerId, amount, paymentType });
        await fetchInitialData();
    };

    const updateSettings = async (settingsData: Partial<StoreSettings>) => {
        const { data } = await api.put('/settings/', settingsData);
        await fetchInitialData();
        return data;
    };

    const addEntity = async <T,>(entityName: string, entityData: Partial<T>) => {
        const { data } = await api.post<T>(`/${entityName}/`, entityData);
        await fetchInitialData();
        return data;
    }

    const updateEntity = async <T,>(entityName: string, id: string, entityData: Partial<T>) => {
        const { data } = await api.put<T>(`/${entityName}/${id}/`, entityData);
        await fetchInitialData();
        return data;
    }
    
    const deleteEntity = async (entityName: string, id: string) => {
        await api.delete(`/${entityName}/${id}/`);
        await fetchInitialData();
    }

    const value: AppContextType = {
        isDataLoading,
        currentUser,
        login,
        logout,
        hasPermission,
        employees,
        roles,
        products,
        customers,
        suppliers,
        sales,
        debtPayments,
        goodsReceipts,
        units,
        settings,
        cart,
        searchTerm,
        searchResults,
        selectedCustomerId,
        isPaymentModalOpen,
        isReceiptModalOpen,
        lastSale,
        isAddCustomerModalOpen,
        addProductToCart,
        removeProductFromCart,
        updateCartItemQuantity,
        saveSale,
        setSearchTerm,
        setSearchResults,
        setSelectedCustomerId,
        setIsPaymentModalOpen,
        setIsReceiptModalOpen,
        setLastSale,
        setIsAddCustomerModalOpen,
        setIsDataLoading,
        setCurrentUser,
        setProducts,
        setCustomers,
        setSuppliers,
        setSales,
        setDebtPayments,
        setSettings,
        setUnits,
        setGoodsReceipts,
        setRoles,
        setEmployees,
        setCart,
        reloadData: fetchInitialData,
        createSale,
        addGoodsReceipt,
        payDebt,
        updateSettings,
        addEmployee: (data: Partial<Employee>) => addEntity('employees', data),
        updateEmployee: (id: string, data: Partial<Employee>) => updateEntity('employees', id, data),
        deleteEmployee: (id: string) => deleteEntity('employees', id),
        addRole: (data: Partial<Role>) => addEntity('roles', data),
        updateRole: (id: string, data: Partial<Role>) => updateEntity('roles', id, data),
        deleteRole: (id: string) => deleteEntity('roles', id),
        addProduct: (data: Partial<Product>) => addEntity('products', data),
        updateProduct: (id: string, data: Partial<Product>) => updateEntity('products', id, data),
        deleteProduct: (id: string) => deleteEntity('products', id),
        addCustomer: (data: Partial<Customer>) => addEntity('customers', data),
        updateCustomer: (id: string, data: Partial<Customer>) => updateEntity('customers', id, data),
        deleteCustomer: (id: string) => deleteEntity('customers', id),
        addSupplier: (data: Partial<Supplier>) => addEntity('suppliers', data),
        updateSupplier: (id: string, data: Partial<Supplier>) => updateEntity('suppliers', id, data),
        deleteSupplier: (id: string) => deleteEntity('suppliers', id),
        addUnit: (data: Partial<Unit>) => addEntity('units', data),
        deleteUnit: (id: string) => deleteEntity('units', id)
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};