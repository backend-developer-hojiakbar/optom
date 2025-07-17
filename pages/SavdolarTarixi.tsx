import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Sale, PaymentType } from '../types.ts';
import Modal from '../components/Modal.tsx';
import PrintableReceipt from '../components/PrintableReceipt.tsx';
import { Eye, Printer } from 'lucide-react';

const paymentTypeLabels: { [key in PaymentType]: string } = {
    [PaymentType.CASH]: "Naqd",
    [PaymentType.CARD]: "Plastik",
    [PaymentType.TRANSFER]: "O'tkazma",
    [PaymentType.DEBT]: "Nasiya"
};

const SavdolarTarixi = () => {
    const { sales, customers, products, settings, employees } = useAppContext();
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        customerId: '',
        sellerId: '',
    });
    const receiptRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
      const printableContent = receiptRef.current?.innerHTML;
      if (printableContent) {
          const printWindow = window.open('', '', 'height=600,width=800');
          printWindow?.document.write('<html><head><title>Chek</title>');
          printWindow?.document.write('<style>@media print { body { margin: 0; } }</style>');
          printWindow?.document.write('</head><body >');
          printWindow?.document.write(printableContent);
          printWindow?.document.write('</body></html>');
          printWindow?.document.close();
          printWindow?.print();
      }
    };

    const filteredSales = useMemo(() => {
        return sales
            .filter(sale => {
                const saleDate = new Date(sale.date);
                if (filters.startDate) {
                    const startDate = new Date(filters.startDate);
                    startDate.setHours(0,0,0,0);
                    if (saleDate < startDate) return false;
                }
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23,59,59,999);
                    if (saleDate > endDate) return false;
                }
                if (filters.customerId && sale.customerId !== filters.customerId) {
                    return false;
                }
                if (filters.sellerId && sale.seller?.id !== filters.sellerId) {
                    return false;
                }
                return true;
            })
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, filters]);

    const handleViewReceipt = (sale: Sale) => {
        setSelectedSale(sale);
        setModalOpen(true);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    if (!settings) return <div>Yuklanmoqda...</div>;

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-wrap items-center gap-4">
                <h3 className="font-semibold">Filtrlar</h3>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                <select name="customerId" value={filters.customerId} onChange={handleFilterChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option value="">Barcha Mijozlar</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select name="sellerId" value={filters.sellerId} onChange={handleFilterChange} className="p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                    <option value="">Barcha Sotuvchilar</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
            </div>
             <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Chek #</th>
                            <th scope="col" className="px-6 py-3">Sana</th>
                            <th scope="col" className="px-6 py-3">Mijoz</th>
                            <th scope="col" className="px-6 py-3">Sotuvchi</th>
                            <th scope="col" className="px-6 py-3">Jami Summa</th>
                            <th scope="col" className="px-6 py-3">To'lov Turi</th>
                            <th scope="col" className="px-6 py-3 text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map(sale => (
                            <tr key={sale.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-mono text-xs">{sale.id.slice(-6)}</td>
                                <td className="px-6 py-4">{new Date(sale.date).toLocaleString('uz-UZ')}</td>
                                <td className="px-6 py-4 font-medium">{sale.customer?.name || 'Umumiy'}</td>
                                <td className="px-6 py-4">{sale.seller?.name || 'Noma\'lum'}</td>
                                <td className="px-6 py-4 font-bold">{Number(sale.total).toLocaleString()} {settings.currency}</td>
                                <td className="px-6 py-4">{sale.payments.map(p => paymentTypeLabels[p.type]).join(', ')}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleViewReceipt(sale)} className="p-1 text-blue-600 hover:text-blue-800"><Eye size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Savdo Cheki" size="sm">
                {selectedSale && (
                     <div className="space-y-4">
                        <div className="hidden">
                            <PrintableReceipt ref={receiptRef} sale={selectedSale} products={products} customer={selectedSale.customer || null} settings={settings} seller={selectedSale.seller} />
                        </div>
                        <PrintableReceipt sale={selectedSale} products={products} customer={selectedSale.customer || null} settings={settings} seller={selectedSale.seller} />
                         <div className="flex space-x-2 pt-4 border-t dark:border-gray-600">
                            <button onClick={() => setModalOpen(false)} className="w-full py-2 bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500">Yopish</button>
                            <button onClick={handlePrint} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center">
                                <Printer size={18} className="mr-2" />
                                Chop etish
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default SavdolarTarixi;