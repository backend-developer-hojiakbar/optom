import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, AlertTriangle, Users, PackagePlus, UserPlus, Terminal } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, colorClass }: { icon: React.ElementType, title: string, value: string, colorClass: string }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex items-center space-x-6">
        <div className={`p-4 rounded-full ${colorClass}`}>
            <Icon className="h-8 w-8 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const QuickActionButton = ({ icon: Icon, title, to, colorClass }: { icon: React.ElementType, title: string, to: string, colorClass: string }) => (
    <Link to={to} className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg text-white transition-transform transform hover:scale-105 ${colorClass}`}>
        <Icon className="h-10 w-10 mb-2" />
        <span className="font-semibold text-lg">{title}</span>
    </Link>
);

const Dashboard = () => {
    const { sales, products, customers, settings, employees } = useAppContext();

    const stats = useMemo(() => {
        if (!sales || !products || !customers || !settings) return { totalSales: 0, profit: 0, saleCount: 0, totalDebt: 0 };
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const monthlySales = sales.filter(sale => new Date(sale.date) >= startOfMonth);

        let totalSales = 0;
        let totalCost = 0;
        
        monthlySales.forEach(sale => {
            totalSales += parseFloat(String(sale.total)) || 0;
            sale.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    totalCost += (parseFloat(String(product.purchasePrice)) || 0) * item.quantity;
                }
            });
        });
        
        const totalDebt = customers.reduce((acc, c) => acc + (parseFloat(String(c.debt)) || 0), 0);

        return {
            totalSales,
            profit: totalSales - totalCost,
            saleCount: monthlySales.length,
            totalDebt,
        };
    }, [sales, products, customers, settings]);

    const salesByDay = useMemo(() => {
        if (!sales || !settings) return [];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
        }).reverse();

        const data = last7Days.map(day => ({ date: day, savdo: 0 }));

        sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            const day = saleDate.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
            const dayData = data.find(d => d.date === day);
            if(dayData) {
                dayData.savdo += parseFloat(String(sale.total)) || 0;
            }
        });
        return data;
    }, [sales, settings]);

    const lowStockProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(p => p.stock <= p.minStock && p.status === 'active').slice(0, 5);
    }, [products]);
    
    const recentSales = useMemo(() => {
        if (!sales) return [];
        return sales.slice(0, 5);
    }, [sales]);

    if (!settings) return <div>Yuklanmoqda...</div>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickActionButton icon={Terminal} title="Yangi Savdo" to="/savdo" colorClass="bg-gradient-to-br from-green-500 to-green-600" />
                <QuickActionButton icon={PackagePlus} title="Mahsulot Qo'shish" to="/mahsulotlar" colorClass="bg-gradient-to-br from-blue-500 to-blue-600" />
                <QuickActionButton icon={UserPlus} title="Mijoz Qo'shish" to="/mijozlar" colorClass="bg-gradient-to-br from-purple-500 to-purple-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard icon={DollarSign} title="Oylik Savdo" value={`${stats.totalSales.toLocaleString()} ${settings.currency}`} colorClass="bg-green-500" />
                <StatCard icon={ShoppingBag} title="Sof Foyda" value={`${stats.profit.toLocaleString()} ${settings.currency}`} colorClass="bg-blue-500" />
                <StatCard icon={Users} title="Mijozlar Qarzi" value={`${stats.totalDebt.toLocaleString()} ${settings.currency}`} colorClass="bg-red-500" />
                <StatCard icon={AlertTriangle} title="Kam Qolganlar" value={lowStockProducts.length.toString()} colorClass="bg-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Oxirgi 7 kunlik savdo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesByDay}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(value: number) => new Intl.NumberFormat('uz-UZ').format(value)} />
                            <Tooltip formatter={(value: number) => `${value.toLocaleString()} ${settings.currency}`} />
                            <Legend />
                            <Line type="monotone" dataKey="savdo" stroke="#3b82f6" name="Savdo" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Omborda kam qolgan mahsulotlar</h3>
                    <div className="space-y-4">
                        {lowStockProducts.length > 0 ? lowStockProducts.map(p => (
                            <div key={p.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{p.name}</p>
                                    <p className="text-sm text-gray-500">{p.minStock} {p.unit} dan kam</p>
                                </div>
                                <span className="font-bold text-red-500">{p.stock} {p.unit}</span>
                            </div>
                        )) : <p className="text-center py-4 text-gray-500">Kam qolgan mahsulotlar yo'q.</p>}
                         <Link to="/hisobotlar" className="block text-center mt-4 text-blue-500 hover:underline">Barchasini ko'rish</Link>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Oxirgi savdolar</h3>
                <div className="space-y-2">
                     {recentSales.map(sale => {
                        const seller = employees.find(e => e.id === sale.seller?.id);
                        return (
                            <div key={sale.id} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg">
                                <p className="col-span-3 md:col-span-2 font-medium">{customers.find(c => c.id === sale.customerId)?.name || 'Umumiy mijoz'}</p>
                                <p className="col-span-5 md:col-span-3 text-gray-500">{new Date(sale.date).toLocaleString('uz-UZ')}</p>
                                <p className="col-span-4 md:col-span-2 text-gray-500">{sale.items.length} xil mahsulot</p>
                                <p className="col-span-8 md:col-span-2 text-gray-500">Sotuvchi: {seller?.name || 'Noma\'lum'}</p>
                                <p className="col-span-4 md:col-span-3 font-bold text-right text-lg text-green-600">{Number(sale.total).toLocaleString()} {settings.currency}</p>
                            </div>
                        )
                     })}
                     <Link to="/savdo-tarixi" className="block text-center pt-4 text-blue-500 hover:underline">Savdolar tarixiga o'tish</Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;