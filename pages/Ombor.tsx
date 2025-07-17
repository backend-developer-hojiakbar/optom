import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Product, GoodsReceipt, GoodsReceiptItem, Supplier } from '../types.ts';
import { Trash2, Search, Eye } from 'lucide-react';
import Modal from '../components/Modal.tsx';

const ProductSearchInput: React.FC<{
    products: Product[];
    addedProductIds: string[];
    onSelectProduct: (product: Product) => void;
}> = ({ products, addedProductIds, onSelectProduct }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const searchResults = useMemo(() => {
        if (!query) return [];
        const lowerCaseQuery = query.toLowerCase();
        return products.filter(p => 
            !addedProductIds.includes(p.id) &&
            (p.name.toLowerCase().includes(lowerCaseQuery) || (p.barcode && p.barcode.includes(lowerCaseQuery)))
        ).slice(0, 10);
    }, [query, products, addedProductIds]);

    const handleSelect = (product: Product) => {
        onSelectProduct(product);
        setQuery('');
        setIsFocused(false);
    };

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    placeholder="Nomi yoki shtrix-kod bo'yicha qidirish..."
                    className="w-full p-2 pl-10 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
            </div>
            {isFocused && searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => handleSelect(p)}
                            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700"
                        >
                            <p className="font-semibold">{p.name}</p>
                            <p className="text-sm text-gray-500">Qoldiq: {p.stock} {p.unit}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const KirimForm = () => {
    const { products, suppliers, addGoodsReceipt, settings } = useAppContext();
    const [supplierId, setSupplierId] = useState<string>('');
    const [items, setItems] = useState<GoodsReceiptItem[]>([]);
    const [docNumber, setDocNumber] = useState('');

    const handleSelectProduct = (product: Product) => {
        setItems(prev => [...prev, {
            productId: product.id,
            quantity: 1,
            purchasePrice: Number(product.purchasePrice)
        }]);
    };
    
    const handleItemChange = <K extends keyof GoodsReceiptItem>(index: number, field: K, value: GoodsReceiptItem[K]) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };
    
    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
    }, [items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId || items.length === 0) {
            alert("Yetkazib beruvchi va kamida bitta mahsulot tanlanishi kerak.");
            return;
        }
        
        try {
            await addGoodsReceipt({
                supplierId,
                items,
                docNumber,
                totalAmount
            });
            alert("Kirim muvaffaqiyatli amalga oshirildi!");
            setItems([]);
            setSupplierId('');
            setDocNumber('');
        } catch (error) {
            alert("Kirim qilishda xatolik yuz berdi");
        }
    };
    
    const getProduct = (id: string) => products.find(p => p.id === id);
    const addedProductIds = items.map(item => item.productId);

    if (!settings) return null;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Omborga Kirim Qilish</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium">Yetkazib beruvchi</label>
                    <select value={supplierId} onChange={e => setSupplierId(e.target.value)} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700">
                        <option value="">Tanlang...</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Hujjat raqami (ixtiyoriy)</label>
                    <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Mahsulot qo'shish</label>
                <ProductSearchInput products={products} addedProductIds={addedProductIds} onSelectProduct={handleSelectProduct} />
            </div>

            <div className="space-y-3">
                {items.length > 0 && <h4 className="text-md font-semibold">Qo'shilgan mahsulotlar</h4>}
                {items.map((item, index) => {
                    const product = getProduct(item.productId);
                    const itemTotal = item.quantity * item.purchasePrice;
                    return (
                    <div key={item.productId} className="grid grid-cols-12 gap-2 items-center p-2 border dark:border-gray-700 rounded-md">
                        <div className="col-span-12 md:col-span-4 font-semibold">{product?.name}</div>
                        <div className="col-span-6 md:col-span-2">
                            <input type="number" placeholder="Miqdori" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700" />
                        </div>
                        <div className="col-span-6 md:col-span-2">
                            <input type="number" placeholder="Olish narxi" value={item.purchasePrice} onChange={e => handleItemChange(index, 'purchasePrice', Number(e.target.value))} className="w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700" />
                        </div>
                        <div className="col-span-10 md:col-span-3 text-right font-medium">
                            {itemTotal.toLocaleString()} {settings.currency}
                        </div>
                        <div className="col-span-2 md:col-span-1 text-right">
                           <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Trash2 size={18} /></button>
                        </div>
                    </div>
                )})}
            </div>
            
            {items.length > 0 && (
                 <div className="text-right pt-4 border-t dark:border-gray-700 text-xl font-bold">
                    Jami summa: {totalAmount.toLocaleString()} {settings.currency}
                </div>
            )}
            
            <div className="text-right pt-4">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={items.length === 0 || !supplierId}>Kirimni saqlash</button>
            </div>
        </form>
    );
}

const KirimlarList = () => {
    const { goodsReceipts, settings } = useAppContext();
    const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceipt | null>(null);

    if (!settings) return null;

    return (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Sana</th>
                        <th scope="col" className="px-6 py-3">Hujjat #</th>
                        <th scope="col" className="px-6 py-3">Yetkazib Beruvchi</th>
                        <th scope="col" className="px-6 py-3">Mahsulotlar soni</th>
                        <th scope="col" className="px-6 py-3">Jami summa</th>
                        <th scope="col" className="px-6 py-3 text-right">Amallar</th>
                    </tr>
                </thead>
                <tbody>
                    {goodsReceipts.map(receipt => (
                        <tr key={receipt.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4">{new Date(receipt.date).toLocaleDateString('uz-UZ')}</td>
                            <td className="px-6 py-4">{receipt.docNumber || receipt.id.slice(-6)}</td>
                            <td className="px-6 py-4 font-medium">{receipt.supplier?.name || 'Noma\'lum'}</td>
                            <td className="px-6 py-4">{receipt.items.length}</td>
                            <td className="px-6 py-4 font-bold">{Number(receipt.totalAmount).toLocaleString()} {settings.currency}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => setSelectedReceipt(receipt)} className="p-1 text-blue-600 hover:text-blue-800"><Eye size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Modal isOpen={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} title="Kirim Hujjati Tafsilotlari" size="lg">
                {selectedReceipt && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p><strong>Sana:</strong> {new Date(selectedReceipt.date).toLocaleString('uz-UZ')}</p>
                            <p><strong>Yetkazib Beruvchi:</strong> {selectedReceipt.supplier?.name || 'Noma\'lum'}</p>
                            <p><strong>Hujjat #:</strong> {selectedReceipt.docNumber || selectedReceipt.id.slice(-6)}</p>
                            <p className="font-bold text-lg mt-2">Jami Summa: {Number(selectedReceipt.totalAmount).toLocaleString()} {settings.currency}</p>
                        </div>
                        <h4 className="font-semibold">Mahsulotlar ro'yxati</h4>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                             {selectedReceipt.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 p-2 border dark:border-gray-600 rounded-md">
                                    <div className="col-span-6 font-medium">{item.product?.name || 'Noma\'lum Mahsulot'}</div>
                                    <div className="col-span-3 text-center">{item.quantity} x {item.purchasePrice.toLocaleString()}</div>
                                    <div className="col-span-3 text-right font-semibold">{(item.quantity * item.purchasePrice).toLocaleString()} {settings.currency}</div>
                                </div>
                             ))}
                        </div>
                        <div className="flex justify-end pt-4 mt-4 border-t dark:border-gray-600">
                            <button onClick={() => setSelectedReceipt(null)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Yopish</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
};


const Ombor = () => {
    const [activeTab, setActiveTab] = useState('kirim');

    return (
        <div className="space-y-4">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveTab('kirim')} className={`px-4 py-2 font-medium ${activeTab === 'kirim' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Kirim Qilish</button>
                <button onClick={() => setActiveTab('royxat')} className={`px-4 py-2 font-medium ${activeTab === 'royxat' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Kirimlar Ro'yxati</button>
            </div>
            <div>
                {activeTab === 'kirim' && <KirimForm />}
                {activeTab === 'royxat' && <KirimlarList />}
            </div>
        </div>
    );
};

export default Ombor;