import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Customer, PaymentType } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react';

const CustomerForm: React.FC<{ customer?: Customer; onSave: (customer: Partial<Customer>) => void; onClose: () => void }> = ({ customer, onSave, onClose }) => {
    const [formData, setFormData] = useState({ name: customer?.name || '', phone: customer?.phone || '', address: customer?.address || '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Mijoz nomi</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Telefon raqami</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Manzil</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Saqlash</button>
            </div>
        </form>
    );
};

const DebtPaymentForm: React.FC<{ customer: Customer; onClose: () => void }> = ({ customer, onClose }) => {
    const { payDebt } = useAppContext();
    const [amount, setAmount] = useState<number>(0);
    const [paymentType, setPaymentType] = useState<PaymentType.CASH | PaymentType.CARD | PaymentType.TRANSFER>(PaymentType.CASH);
    const customerDebt = Number(customer.debt);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0 || amount > customerDebt) { alert("Noto'g'ri summa kiritildi."); return; }
        try { await payDebt(customer.id, amount, paymentType); onClose(); } catch (error) { alert("To'lovni amalga oshirishda xatolik"); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <p>Mijoz: <span className="font-semibold">{customer.name}</span></p>
                <p>Joriy qarz: <span className="font-semibold text-red-500">{customerDebt.toLocaleString()} so'm</span></p>
            </div>
             <div>
                <label className="block text-sm font-medium">To'lov summasi</label>
                <input type="number" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} max={customerDebt} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
            </div>
             <div>
                <label className="block text-sm font-medium">To'lov turi</label>
                <select value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType.CASH)} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700">
                    <option value={PaymentType.CASH}>Naqd</option>
                    <option value={PaymentType.CARD}>Plastik</option>
                    <option value={PaymentType.TRANSFER}>O'tkazma</option>
                </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">To'lovni qabul qilish</button>
            </div>
        </form>
    );
}

const CustomerDetailsModal: React.FC<{ customer: Customer; onClose: () => void; onOpenPayment: () => void; }> = ({ customer, onClose, onOpenPayment }) => {
    const { sales, debtPayments } = useAppContext();
    const customerSalesWithDebt = sales.filter(s => s.customerId === customer.id && s.payments.some(p => p.type === PaymentType.DEBT));
    const customerPayments = debtPayments.filter(dp => dp.customerId === customer.id);
    
    type HistoryItem = { date: string; type: 'nasiya' | 'tulov'; amount: number; };
    
    const history: HistoryItem[] = [
        ...customerSalesWithDebt.map(s => {
            const debtAmount = s.payments.filter(p => p.type === PaymentType.DEBT).reduce((sum, p) => sum + p.amount, 0);
            return ({ date: s.date, type: 'nasiya' as const, amount: debtAmount });
        }),
        ...customerPayments.map(p => ({ date: p.date, type: 'tulov' as const, amount: Number(p.amount) }))
    ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
                 <h4 className="font-bold text-lg">{customer.name}</h4>
                 <p>Telefon: {customer.phone}</p>
                 <p>Manzil: {customer.address}</p>
                 <p className="mt-2 text-xl">Joriy qarz: <span className="font-bold text-red-500">{Number(customer.debt).toLocaleString()} so'm</span></p>
            </div>
            <div className="flex justify-end mb-4">
                <button onClick={onOpenPayment} className="px-4 py-2 bg-green-600 text-white rounded-md">Qarz to'lovini qabul qilish</button>
            </div>
            <h5 className="font-semibold mb-2">Qarz tarixi</h5>
            <div className="max-h-64 overflow-y-auto space-y-2">
                {history.map((item, index) => (
                    <div key={`${item.date}-${index}`} className={`flex justify-between p-2 rounded-md ${item.type === 'nasiya' ? 'bg-red-50 dark:bg-red-900/50' : 'bg-green-50 dark:bg-green-900/50'}`}>
                        <div>
                            <p className="font-medium">{item.type === 'nasiya' ? "Nasiyaga savdo" : "Qarz to'lovi"}</p>
                            <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString('uz-UZ')}</p>
                        </div>
                        <p className={`font-semibold ${item.type === 'nasiya' ? 'text-red-600' : 'text-green-600'}`}>
                            {item.type === 'nasiya' ? '+' : '-'} {item.amount.toLocaleString()} so'm
                        </p>
                    </div>
                ))}
            </div>
             <div className="flex justify-end pt-4 mt-4 border-t dark:border-gray-600">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Yopish</button>
            </div>
        </div>
    );
};

const Mijozlar = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useAppContext();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenFormModal = (customer?: Customer) => { setSelectedCustomer(customer); setFormModalOpen(true); };
    const handleOpenDetailsModal = (customer: Customer) => { setSelectedCustomer(customer); setDetailsModalOpen(true); };
    const handleOpenPaymentModal = () => { setDetailsModalOpen(false); setPaymentModalOpen(true); };
    const handleCloseAllModals = () => { setSelectedCustomer(undefined); setFormModalOpen(false); setDetailsModalOpen(false); setPaymentModalOpen(false); };

    const handleSaveCustomer = async (customerData: Partial<Customer>) => {
        try {
            if (selectedCustomer) { await updateCustomer(selectedCustomer.id, customerData); } else { await addCustomer(customerData); }
            handleCloseAllModals();
        } catch (error) { alert("Mijozni saqlashda xatolik"); }
    };

    const handleDeleteCustomer = async (id: string) => {
        if (window.confirm("Haqiqatan ham bu mijozni o'chirmoqchimisiz?")) {
            try { await deleteCustomer(id); } catch (error) { alert("Mijozni o'chirishda xatolik yuz berdi. Bu mijozning qarzi yoki savdo tarixi bo'lishi mumkin."); }
        }
    };

    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <input type="text" placeholder="Mijoz qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600" />
                <button onClick={() => handleOpenFormModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusCircle size={18} className="mr-2" />
                    Yangi mijoz
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Mijoz</th>
                            <th scope="col" className="px-6 py-3">Telefon</th>
                            <th scope="col" className="px-6 py-3">Qarzdorlik</th>
                            <th scope="col" className="px-6 py-3 text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(c => (
                            <tr key={c.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{c.name}</td>
                                <td className="px-6 py-4">{c.phone}</td>
                                <td className={`px-6 py-4 font-bold ${Number(c.debt) > 0 ? 'text-red-500' : 'text-green-500'}`}>{Number(c.debt).toLocaleString()} so'm</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleOpenDetailsModal(c)} className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-800"><Eye size={18} /></button>
                                    <button onClick={() => handleOpenFormModal(c)} className="p-1 text-blue-600 hover:text-blue-800 ml-2"><Edit size={18} /></button>
                                    <button onClick={() => handleDeleteCustomer(c.id)} className="p-1 text-red-600 hover:text-red-800 ml-2"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isFormModalOpen} onClose={handleCloseAllModals} title={selectedCustomer ? "Mijozni tahrirlash" : "Yangi mijoz qo'shish"} size="md">
                <CustomerForm customer={selectedCustomer} onSave={handleSaveCustomer} onClose={handleCloseAllModals} />
            </Modal>
             <Modal isOpen={isDetailsModalOpen && !!selectedCustomer} onClose={handleCloseAllModals} title="Mijoz ma'lumotlari" size="lg">
                {selectedCustomer && <CustomerDetailsModal customer={selectedCustomer} onClose={handleCloseAllModals} onOpenPayment={handleOpenPaymentModal} />}
            </Modal>
            <Modal isOpen={isPaymentModalOpen && !!selectedCustomer} onClose={handleCloseAllModals} title="Qarz to'lovini qabul qilish" size="sm">
                {selectedCustomer && <DebtPaymentForm customer={selectedCustomer} onClose={handleCloseAllModals} />}
            </Modal>
        </div>
    );
};

export default Mijozlar;