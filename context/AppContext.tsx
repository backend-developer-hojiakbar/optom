import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Product, Customer, Supplier, Sale, Employee, Role, Permission, StoreSettings, DebtPayment, GoodsReceipt, Unit } from '../types.ts';
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
    reloadData: () => Promise<void>;
    createSale: (saleData: Omit<Sale, 'id' | 'date' | 'seller'>) => Promise<Sale>;
    addGoodsReceipt: (receiptData: Omit<GoodsReceipt, 'id' | 'date' | 'supplier'>) => Promise<GoodsReceipt>;
    payDebt: (customerId: string, amount: number, paymentType: any) => Promise<void>;
    updateSettings: (settingsData: Partial<StoreSettings>) => Promise<StoreSettings>;
    addEmployee: (data: Partial<Employee>) => Promise<Employee>;
    updateEmployee: (id: string, data: Partial<Employee>) => Promise<Employee>;
    addRole: (data: Partial<Role>) => Promise<Role>;
    updateRole: (id: string, data: Partial<Role>) => Promise<Role>;
    addProduct: (data: Partial<Product>) => Promise<Product>;
    updateProduct: (id: string, data: Partial<Product>) => Promise<Product>;
    addCustomer: (data: Partial<Customer>) => Promise<Customer>;
    updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer>;
    addSupplier: (data: Partial<Supplier>) => Promise<Supplier>;
    updateSupplier: (id: string, data: Partial<Supplier>) => Promise<Supplier>;
    addUnit: (data: { name: string }) => Promise<Unit>;
    deleteUnit: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<Employee | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [debtPayments, setDebtPayments] = useState<DebtPayment[]>([]);
    const [settings, setSettings] = useState<StoreSettings | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);

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
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('pos-auth-token');
        setCurrentUser(null);
    };
    
    const hasPermission = (permission: Permission): boolean => {
        return currentUser?.role?.permissions.includes(permission) || false;
    };

    const createSale = async (saleData: Omit<Sale, 'id' | 'date' | 'seller'>) => {
        const { data } = await api.post<Sale>('/sales/', saleData);
        await fetchInitialData();
        return data;
    };

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
        isDataLoading, currentUser, login, logout, hasPermission,
        employees, roles, products, customers, suppliers, sales,
        debtPayments, goodsReceipts, settings, units,
        reloadData: fetchInitialData,
        createSale, addGoodsReceipt, payDebt, updateSettings,
        addEmployee: (data) => addEntity('employees', data),
        updateEmployee: (id, data) => updateEntity('employees', id, data),
        addRole: (data) => addEntity('roles', data),
        updateRole: (id, data) => updateEntity('roles', id, data),
        addProduct: (data) => addEntity('products', data),
        updateProduct: (id, data) => updateEntity('products', id, data),
        addCustomer: (data) => addEntity('customers', data),
        updateCustomer: (id, data) => updateEntity('customers', id, data),
        addSupplier: (data) => addEntity('suppliers', data),
        updateSupplier: (id, data) => updateEntity('suppliers', id, data),
        addUnit: (data) => addEntity('units', data),
        deleteUnit: (id) => deleteEntity('units', id),
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};