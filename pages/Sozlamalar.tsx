import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { StoreSettings } from '../types.ts';
import { Trash2 } from 'lucide-react';

const Sozlamalar = () => {
    const { settings, units, updateSettings, addUnit, deleteUnit } = useAppContext();
    const [formData, setFormData] = useState<Partial<StoreSettings>>({});
    const [newUnitName, setNewUnitName] = useState('');

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    if (!settings) {
        return <div>Yuklanmoqda...</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleAddUnit = async () => {
        if (newUnitName.trim() && !units.some(u => u.name.toLowerCase() === newUnitName.trim().toLowerCase())) {
            try {
                await addUnit({ name: newUnitName.trim() });
                setNewUnitName('');
            } catch (error) {
                alert("Birlik qo'shishda xatolik");
            }
        } else {
            alert("Bunday birlik mavjud yoki nom kiritilmadi.");
        }
    };

    const handleRemoveUnit = async (id: string) => {
        if (window.confirm("Haqiqatan ham bu birlikni o'chirmoqchimisiz?")) {
            try {
                await deleteUnit(id);
            } catch (error) {
                alert("Birlikni o'chirishda xatolik");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateSettings(formData);
            alert("Sozlamalar saqlandi!");
        } catch (error) {
            alert("Sozlamalarni saqlashda xatolik!");
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 dark:border-gray-600">Do'kon ma'lumotlari</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Do'kon nomi</label>
                            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Manzil</label>
                            <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon raqami</label>
                            <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Valyuta belgisi</label>
                            <input type="text" name="currency" value={formData.currency || ''} onChange={handleChange} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 dark:border-gray-600">Chekni sozlash</h2>
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chekning yuqori qismi</label>
                            <textarea name="receiptHeader" value={formData.receiptHeader || ''} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700" placeholder="Masalan: Xaridingiz uchun rahmat!"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chekning pastki qismi</label>
                            <textarea name="receiptFooter" value={formData.receiptFooter || ''} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700" placeholder="Masalan: Yana keling!"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="receiptShowStoreName" checked={!!formData.receiptShowStoreName} onChange={handleChange} className="rounded"/>
                                <span>Do'kon nomini ko'rsatish</span>
                            </label>
                             <label className="flex items-center space-x-2">
                                <input type="checkbox" name="receiptShowAddress" checked={!!formData.receiptShowAddress} onChange={handleChange} className="rounded"/>
                                <span>Manzilni ko'rsatish</span>
                            </label>
                             <label className="flex items-center space-x-2">
                                <input type="checkbox" name="receiptShowPhone" checked={!!formData.receiptShowPhone} onChange={handleChange} className="rounded"/>
                                <span>Telefonni ko'rsatish</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="receiptShowChekId" checked={!!formData.receiptShowChekId} onChange={handleChange} className="rounded"/>
                                <span>Chek ID sini ko'rsatish</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="receiptShowDate" checked={!!formData.receiptShowDate} onChange={handleChange} className="rounded"/>
                                <span>Sanani ko'rsatish</span>
                            </label>
                             <label className="flex items-center space-x-2">
                                <input type="checkbox" name="receiptShowSeller" checked={!!formData.receiptShowSeller} onChange={handleChange} className="rounded"/>
                                <span>Sotuvchini ko'rsatish</span>
                            </label>
                             <label className="flex items-center space-x-2">
                                <input type="checkbox" name="receiptShowCustomer" checked={!!formData.receiptShowCustomer} onChange={handleChange} className="rounded"/>
                                <span>Mijozni ko'rsatish</span>
                            </label>
                        </div>
                     </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 dark:border-gray-600">O'lchov Birliklari</h2>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {units.map((unit) => (
                            <div key={unit.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <span>{unit.name}</span>
                                <button type="button" onClick={() => handleRemoveUnit(unit.id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <input
                            type="text"
                            value={newUnitName}
                            onChange={(e) => setNewUnitName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddUnit(); } }}
                            placeholder="Yangi birlik nomi"
                            className="flex-grow p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"
                        />
                        <button type="button" onClick={handleAddUnit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Qo'shish
                        </button>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Saqlash</button>
                </div>
            </form>
        </div>
    );
};

export default Sozlamalar;