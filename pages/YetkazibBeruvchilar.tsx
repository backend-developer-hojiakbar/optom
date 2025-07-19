import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Supplier } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const SupplierForm: React.FC<{ supplier?: Supplier; onSave: (supplier: Partial<Supplier>) => void; onClose: () => void }> = ({ supplier, onSave, onClose }) => {
    const [formData, setFormData] = useState({ name: supplier?.name || '', contactPerson: supplier?.contactPerson || '', phone: supplier?.phone || '', address: supplier?.address || '', bankDetails: supplier?.bankDetails || '' });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Tashkilot nomi</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Mas'ul shaxs</label>
                    <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Telefon raqami</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium">Manzil</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Bank rekvizitlari</label>
                <textarea name="bankDetails" value={formData.bankDetails} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Saqlash</button>
            </div>
        </form>
    );
};

const YetkazibBeruvchilar = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (supplier?: Supplier) => { setEditingSupplier(supplier); setModalOpen(true); };
    const handleCloseModal = () => { setEditingSupplier(undefined); setModalOpen(false); };

    const handleSaveSupplier = async (supplierData: Partial<Supplier>) => {
        try {
            if (editingSupplier) { await updateSupplier(editingSupplier.id, supplierData); } else { await addSupplier(supplierData); }
            handleCloseModal();
        } catch (error) { alert("Yetkazib beruvchini saqlashda xatolik"); }
    };
    
    const handleDeleteSupplier = async (id: string) => {
        if (window.confirm("Haqiqatan ham bu yetkazib beruvchini o'chirmoqchimisiz?")) {
            try { await deleteSupplier(id); } catch (error) { alert("Yetkazib beruvchini o'chirishda xatolik yuz berdi. U kirim hujjatlarida ishlatilgan bo'lishi mumkin."); }
        }
    };

    const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <input type="text" placeholder="Yetkazib beruvchi qidirish..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"/>
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusCircle size={18} className="mr-2" />
                    Yangi yetkazib beruvchi
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Tashkilot nomi</th>
                            <th scope="col" className="px-6 py-3">Mas'ul shaxs</th>
                            <th scope="col" className="px-6 py-3">Telefon</th>
                            <th scope="col" className="px-6 py-3 text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSuppliers.map(s => (
                            <tr key={s.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{s.name}</td>
                                <td className="px-6 py-4">{s.contactPerson}</td>
                                <td className="px-6 py-4">{s.phone}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleOpenModal(s)} className="p-1 text-blue-600 hover:text-blue-800 ml-2"><Edit size={18} /></button>
                                    <button onClick={() => handleDeleteSupplier(s.id)} className="p-1 text-red-600 hover:text-red-800 ml-2"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSupplier ? "Yetkazib beruvchini tahrirlash" : "Yangi yetkazib beruvchi qo'shish"} size="lg">
                <SupplierForm supplier={editingSupplier} onSave={handleSaveSupplier} onClose={handleCloseModal} />
            </Modal>
        </div>
    );
};

export default YetkazibBeruvchilar;