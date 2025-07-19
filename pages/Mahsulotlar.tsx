import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Product } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';

const ProductForm: React.FC<{ product?: Product; onSave: (product: Partial<Product>) => void; onClose: () => void }> = ({ product, onSave, onClose }) => {
    const { units, addUnit } = useAppContext();
    const [isUnitModalOpen, setUnitModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        name: product?.name || '',
        barcode: product?.barcode || '',
        unit: product?.unit || (units.length ? units[0].name : 'dona'),
        purchasePrice: product?.purchasePrice || 0,
        salePrice: product?.salePrice || 0,
        stock: product?.stock || 0,
        minStock: product?.minStock || 10,
        status: product?.status || 'active',
        description: product?.description || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumber = e.target.type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? (value ? parseFloat(value) : 0) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const handleSaveNewUnit = async (newUnitName: string) => {
        if (newUnitName.trim() && !units.some(u => u.name.toLowerCase() === newUnitName.trim().toLowerCase())) {
            try {
                const newUnit = await addUnit({ name: newUnitName.trim() });
                setFormData(prev => ({ ...prev, unit: newUnit.name }));
                setUnitModalOpen(false);
            } catch (error) { alert("Birlik qo'shishda xatolik"); }
        } else { alert("Bunday birlik mavjud yoki nom kiritilmadi."); }
    };

    if (!units) return null;
    return (
        <>
        <Modal isOpen={isUnitModalOpen} onClose={() => setUnitModalOpen(false)} title="Yangi o'lchov birligi">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveNewUnit(e.currentTarget.querySelector('input')!.value); }} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Birlik nomi</label>
                    <input type="text" required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={() => setUnitModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Bekor qilish</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Saqlash</button>
                </div>
            </form>
        </Modal>
        <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mahsulot nomi</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shtrix-kod</label>
                    <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">O'lchov birligi</label>
                    <div className="flex items-center space-x-2">
                        <select name="unit" value={formData.unit} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700">
                             {units.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                        <button type="button" onClick={() => setUnitModalOpen(true)} className="p-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-1">
                           <PlusCircle size={16}/>
                        </button>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Holati</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700">
                        <option value="active">Aktiv</option>
                        <option value="archived">Arxivlangan</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sotib olish narxi</label>
                    <input type="number" step="any" name="purchasePrice" value={String(formData.purchasePrice)} onChange={handleChange} required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sotish narxi</label>
                    <input type="number" step="any" name="salePrice" value={String(formData.salePrice)} onChange={handleChange} required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Ombordagi qoldiq</label>
                    <input type="number" step="any" name="stock" value={formData.stock} onChange={handleChange} required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimal qoldiq</label>
                    <input type="number" step="any" name="minStock" value={formData.minStock} onChange={handleChange} required className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tavsif</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Saqlash</button>
            </div>
        </form>
        </>
    );
};

const Mahsulotlar = () => {
    const { products, addProduct, updateProduct, deleteProduct, settings } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpenModal = (product?: Product) => {
        setEditingProduct(product);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingProduct(undefined);
        setModalOpen(false);
    };

    const handleSaveProduct = async (productData: Partial<Product>) => {
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, productData);
            } else {
                await addProduct(productData);
            }
            handleCloseModal();
        } catch (error) { alert("Mahsulotni saqlashda xatolik yuz berdi"); }
    };

    const handleDeleteProduct = async (id: string) => {
        if (window.confirm("Haqiqatan ham bu mahsulotni o'chirmoqchimisiz?")) {
            try {
                await deleteProduct(id);
            } catch (error) { alert("Mahsulotni o'chirishda xatolik yuz berdi. Bu mahsulot savdolarda ishlatilgan bo'lishi mumkin."); }
        }
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!settings) return <div>Yuklanmoqda...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <input
                    type="text"
                    placeholder="Mahsulot qidirish..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="p-2 border rounded-md dark:bg-gray-800 dark:border-gray-600"
                />
                <button onClick={() => handleOpenModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <PlusCircle size={18} className="mr-2" />
                    Yangi mahsulot
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nomi</th>
                            <th scope="col" className="px-6 py-3">Sotish narxi</th>
                            <th scope="col" className="px-6 py-3">Olish narxi</th>
                            <th scope="col" className="px-6 py-3">Qoldiq</th>
                            <th scope="col" className="px-6 py-3">Holati</th>
                            <th scope="col" className="px-6 py-3 text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{p.name}</td>
                                <td className="px-6 py-4">{Number(p.salePrice).toLocaleString()} {settings.currency}</td>
                                <td className="px-6 py-4">{Number(p.purchasePrice).toLocaleString()} {settings.currency}</td>
                                <td className="px-6 py-4 flex items-center">
                                    {p.stock <= p.minStock && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />}
                                    <span className={p.stock <= p.minStock ? 'text-red-500 font-bold' : ''}>{p.stock} {p.unit}</span>
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded-full text-xs ${p.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`}>
                                        {p.status === 'active' ? "Aktiv" : "Arxivda"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleOpenModal(p)} className="p-1 text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-1 text-red-600 hover:text-red-800 ml-2"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"} size="lg">
                <ProductForm product={editingProduct} onSave={handleSaveProduct} onClose={handleCloseModal} />
            </Modal>
        </div>
    );
};

export default Mahsulotlar;