import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { PaymentType, Permission } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, TrendingUp, DollarSign, ShoppingCart, Receipt, AlertCircle } from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#f97316', '#ef4444', '#8b5cf6'];

const paymentTypeLabels: { [key in PaymentType]: string } = {
    [PaymentType.CASH]: "Naqd",
    [PaymentType.CARD]: "Plastik",
    [PaymentType.TRANSFER]: "O'tkazma",
    [PaymentType.DEBT]: "Nasiya"
};

const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
        alert("Yuklab olish uchun ma'lumot yo'q.");
        return;
    };
    const BOM = '\uFEFF';
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => JSON.stringify(row[header], (key, value) => value === null ? '' : value)).join(','))
    ].join('\n');

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; color: string; }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg flex items-center space-x-4">
    <div className={`rounded-full p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white"/>
    </div>
    <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ReportCard: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        {children}
    </div>
)

const Hisobotlar = () => {
  const { sales, products, customers, settings, employees, roles } = useAppContext();
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedSellerId, setSelectedSellerId] = useState('');

  const sellers = useMemo(() => {
    return employees.filter(e => {
        const role = roles.find(r => r.id === e.roleId);
        return role?.permissions.includes(Permission.USE_SALES_TERMINAL);
    });
  }, [employees, roles]);

  const setDatePreset = (preset: 'today' | 'week' | 'month' | 'year') => {
    const end = new Date();
    let start = new Date();
    if (preset === 'today') {} 
    else if (preset === 'week') { start.setDate(end.getDate() - (end.getDay() === 0 ? 6 : end.getDay() - 1)); }
    else if (preset === 'month') { start.setDate(1); }
    else if (preset === 'year') { start.setMonth(0, 1); }
    setDateRange({ start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
  };

  const filteredSales = useMemo(() => {
    const startDate = new Date(dateRange.start);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); 
    
    return sales.filter(sale => {
      const saleDate = new Date(sale.date);
      const isDateInRange = saleDate >= startDate && saleDate <= endDate;
      const isSellerMatch = !selectedSellerId || sale.seller?.id === selectedSellerId;
      return isDateInRange && isSellerMatch;
    });
  }, [sales, dateRange, selectedSellerId]);
  
  const lowStockProducts = useMemo(() => products.filter(p => p.stock <= p.minStock && p.status === 'active'), [products]);

  const stats = useMemo(() => {
    let totalSales = 0, totalCost = 0;
    filteredSales.forEach(sale => {
      totalSales += Number(sale.total) || 0;
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) totalCost += (Number(product.purchasePrice) || 0) * (item.quantity || 0);
      });
    });
    const totalDebt = customers.reduce((acc, c) => acc + (Number(c.debt) || 0), 0);
    const averageCheck = filteredSales.length > 0 ? totalSales / filteredSales.length : 0;
    return { totalSales, profit: totalSales - totalCost, saleCount: filteredSales.length, totalDebt, averageCheck };
  }, [filteredSales, products, customers]);

  const salesByPaymentType = useMemo(() => {
    const data: {[key: string]: number} = {};
    Object.values(PaymentType).forEach(pt => { data[paymentTypeLabels[pt]] = 0 });
    
    filteredSales.forEach(sale => {
        sale.payments.forEach(p => {
            const label = paymentTypeLabels[p.type];
            if (label) {
                data[label] = (data[label] || 0) + p.amount;
            }
        })
    });
    return Object.entries(data).map(([name, value]) => ({name, value})).filter(d => d.value > 0);
  }, [filteredSales]);

  const salesByDay = useMemo(() => {
    const data: { [key: string]: { date: string, savdo: number, foyda: number } } = {};
    filteredSales.forEach(sale => {
        const day = new Date(sale.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' });
        if(!data[day]) data[day] = { date: day, savdo: 0, foyda: 0 };
        const saleTotal = Number(sale.total) || 0;
        data[day].savdo += saleTotal;
        let cost = 0;
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) cost += (Number(product.purchasePrice) || 0) * (item.quantity || 0);
        });
        data[day].foyda += (saleTotal - cost);
    });
    return Object.values(data).sort((a,b) => new Date(a.date.split('.').reverse().join('-')).getTime() - new Date(b.date.split('.').reverse().join('-')).getTime());
  }, [filteredSales, products]);
  
  const topProducts = useMemo(() => {
    const productSales: { [key: string]: { name: string; quantity: number, revenue: number } } = {};
    filteredSales.forEach(sale => {
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                if(!productSales[product.id]) productSales[product.id] = { name: product.name, quantity: 0, revenue: 0 };
                productSales[product.id].quantity += item.quantity || 0;
                productSales[product.id].revenue += (item.quantity || 0) * (item.price || 0);
            }
        });
    });
    return Object.values(productSales).sort((a,b) => b.revenue - a.revenue).slice(0, 10);
  }, [filteredSales, products]);
  
  const salesBySeller = useMemo(() => {
      const sellerSales: { [key: string]: { name: string, total: number } } = {};
      filteredSales.forEach(sale => {
          if (sale.seller) {
              if(!sellerSales[sale.seller.id]) sellerSales[sale.seller.id] = { name: sale.seller.name, total: 0 };
              sellerSales[sale.seller.id].total += Number(sale.total) || 0;
          }
      });
      return Object.values(sellerSales).sort((a,b) => b.total - a.total).slice(0,10);
  }, [filteredSales, employees]);

  const handleDownloadGeneralReport = () => downloadCSV(filteredSales.flatMap(sale => sale.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    const customer = customers.find(c => c.id === sale.customerId);
    const seller = employees.find(e => e.id === sale.seller?.id);
    return { "Chek_ID": sale.id, "Sana": new Date(sale.date).toLocaleString('uz-UZ'), "Mijoz": customer?.name || "Umumiy", "Sotuvchi": seller?.name || "Noma'lum", "Mahsulot": product?.name || "Noma'lum", "Miqdori": item.quantity, "Narxi": item.price, "Summa": item.quantity * item.price, "Umumiy_Chegirma": sale.discount, "Jami_To'lov": sale.total };
  })), `hisobot-${dateRange.start}-dan-${dateRange.end}-gacha.csv`);

  if (!settings) return <div>Yuklanmoqda...</div>;

  return (
    <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <label className="font-medium">Sana:</label>
                <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/>
                <span>-</span>
                <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/>
                <div className="h-6 border-l dark:border-gray-600 mx-2"></div>
                 <select value={selectedSellerId} onChange={e => setSelectedSellerId(e.target.value)} className="p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                    <option value="">Barcha sotuvchilar</option>
                    {sellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button onClick={() => setDatePreset('today')} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-lg">Bugun</button>
                <button onClick={() => setDatePreset('month')} className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-lg">Bu oy</button>
            </div>
            <button onClick={handleDownloadGeneralReport} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download size={18} className="mr-2" />
                <span>Hisobotni yuklash</span>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <StatCard title="Umumiy savdo" value={`${stats.totalSales.toLocaleString()}`} icon={TrendingUp} color="bg-sky-500" />
            <StatCard title="Sof foyda" value={`${stats.profit.toLocaleString()}`} icon={DollarSign} color="bg-green-500" />
            <StatCard title="Savdolar soni" value={stats.saleCount.toLocaleString()} icon={ShoppingCart} color="bg-orange-500" />
            <StatCard title="O'rtacha chek" value={`${stats.averageCheck.toLocaleString(undefined, {maximumFractionDigits: 0})}`} icon={Receipt} color="bg-indigo-500" />
            <StatCard title="Mijozlar qarzi" value={`${stats.totalDebt.toLocaleString()}`} icon={AlertCircle} color="bg-red-500" />
        </div>

        <ReportCard title="Kunlik Savdo va Foyda Dinamikasi">
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={salesByDay} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value: number) => new Intl.NumberFormat('uz-UZ').format(value)} />
                    <Tooltip formatter={(value: number, name) => [`${value.toLocaleString()} ${settings.currency}`, name === 'savdo' ? 'Savdo' : 'Foyda']} />
                    <Legend />
                    <Line type="monotone" dataKey="savdo" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="foyda" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 8 }}/>
                </LineChart>
            </ResponsiveContainer>
        </ReportCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <ReportCard title="Eng Ko'p Sotilgan Mahsulotlar">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis type="number" tickFormatter={(value: number) => new Intl.NumberFormat('uz-UZ').format(value)} />
                        <YAxis type="category" dataKey="name" width={100} interval={0} tick={{fontSize: 12}} />
                        <Tooltip formatter={(value: number) => `${value.toLocaleString()} ${settings.currency}`} />
                        <Bar dataKey="revenue" fill="#22c55e" name="Tushum" />
                    </BarChart>
                </ResponsiveContainer>
            </ReportCard>
            <ReportCard title="Sotuvchilar Bo'yicha Savdo">
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesBySeller} layout="vertical" margin={{ top: 0, right: 30, left: 50, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis type="number" tickFormatter={(value: number) => new Intl.NumberFormat('uz-UZ').format(value)} />
                        <YAxis type="category" dataKey="name" width={80} interval={0} tick={{fontSize: 12}} />
                        <Tooltip formatter={(value: number) => `${value.toLocaleString()} ${settings.currency}`} />
                        <Bar dataKey="total" fill="#8b5cf6" name="Jami savdo" />
                    </BarChart>
                </ResponsiveContainer>
            </ReportCard>
        </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportCard title="To'lov Turlari Bo'yicha">
                 <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={salesByPaymentType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} labelLine={false} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                             {salesByPaymentType.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toLocaleString()} ${settings.currency}`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </ReportCard>
            <ReportCard title="Minimal Qoldiqdan Kam Mahsulotlar">
                 <div className="max-h-[250px] overflow-y-auto">
                    {lowStockProducts.length > 0 ? (
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2">Nomi</th>
                                    <th className="px-4 py-2 text-right">Qoldiq / Minimal</th>
                                </tr>
                            </thead>
                            <tbody>{lowStockProducts.map(p => (
                                <tr key={p.id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-2 font-medium">{p.name}</td>
                                    <td className="px-4 py-2 text-right">
                                        <span className="font-bold text-red-500">{p.stock}</span>
                                        <span className="text-gray-500"> / {p.minStock} {p.unit}</span>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="text-center py-4 text-gray-500 dark:text-gray-400">Kam qolgan mahsulotlar yo'q.</p>}
                </div>
            </ReportCard>
        </div>
    </div>
  );
};

export default Hisobotlar;