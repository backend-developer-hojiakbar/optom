import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.tsx';
import { Employee, Role, Permission, permissionLabels } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const RoleForm: React.FC<{ role?: Role; onSave: (role: Partial<Role>) => void; onClose: () => void }> = ({ role, onSave, onClose }) => {
    const [name, setName] = useState(role?.name || '');
    const [permissions, setPermissions] = useState<Permission[]>(role?.permissions || []);

    const handlePermissionChange = (permission: Permission, checked: boolean) => setPermissions(prev => checked ? [...prev, permission] : prev.filter(p => p !== permission));
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!name) return; onSave({ name, permissions }); };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium">Rol nomi</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Ruxsatlar</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                    {Object.values(Permission).map(p => (
                        <label key={p} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                            <input type="checkbox" checked={permissions.includes(p)} onChange={e => handlePermissionChange(p, e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                            <span className="text-gray-700 dark:text-gray-300">{permissionLabels[p]}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Saqlash</button>
            </div>
        </form>
    );
};

const EmployeeForm: React.FC<{ employee?: Employee; onSave: (employee: Partial<Employee>) => void; onClose: () => void }> = ({ employee, onSave, onClose }) => {
    const { roles } = useAppContext();
    const [formData, setFormData] = useState({ name: employee?.name || '', phone: employee?.phone || '', pin: '', roleId: employee?.roleId || (roles.length > 0 ? roles[0].id : '') });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, phone, pin, roleId } = formData;
        if (!name || !phone || !roleId) { alert("Ism, telefon va rol maydonlari to'ldirilishi shart."); return; }
        if (!employee && pin.length !== 4) { alert("Yangi xodim uchun 4 xonali PIN-kod kiritilishi shart."); return; }
        if (pin && (pin.length !== 4 || !/^\d{4}$/.test(pin))) { alert("PIN-kod 4 ta raqamdan iborat bo'lishi kerak."); return; }
        const dataToSave: Partial<Employee> = { name, phone, roleId };
        if (pin) { dataToSave.pin = pin; }
        onSave(dataToSave);
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Xodim ismi</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Telefon raqami</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Rol</label>
                    <select name="roleId" value={formData.roleId} onChange={handleChange} required className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700">
                        <option value="">Rolni tanlang</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">PIN-kod (4 raqam)</label>
                    <input type="password" name="pin" value={formData.pin} onChange={handleChange} placeholder={employee ? "O'zgartirish uchun kiriting" : ""} maxLength={4} pattern="\d{4}" className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700" />
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Bekor qilish</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Saqlash</button>
            </div>
        </form>
    );
};

const Hodimlar = () => {
    const { roles, addRole, updateRole, deleteRole, employees, addEmployee, updateEmployee, deleteEmployee } = useAppContext();
    const [activeTab, setActiveTab] = useState('employees');
    const [isRoleModalOpen, setRoleModalOpen] = useState(false);
    const [isEmployeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
    const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
    
    const handleOpenRoleModal = (role?: Role) => { setEditingRole(role); setRoleModalOpen(true); };
    const handleOpenEmployeeModal = (employee?: Employee) => { setEditingEmployee(employee); setEmployeeModalOpen(true); };
    const handleCloseModals = () => { setRoleModalOpen(false); setEmployeeModalOpen(false); setEditingRole(undefined); setEditingEmployee(undefined); };
    
    const handleSaveRole = async (roleData: Partial<Role>) => {
        try {
            if (editingRole) { await updateRole(editingRole.id, roleData); } else { await addRole(roleData); }
            handleCloseModals();
        } catch (error) { alert("Rolni saqlashda xatolik yuz berdi"); }
    };

    const handleSaveEmployee = async (employeeData: Partial<Employee>) => {
        try {
            if (editingEmployee) { await updateEmployee(editingEmployee.id, employeeData); } else { await addEmployee(employeeData); }
            handleCloseModals();
        } catch (error) { alert("Xodimni saqlashda xatolik yuz berdi"); }
    };
    
    const handleDeleteEmployee = async (id: string) => {
        if (window.confirm("Haqiqatan ham bu xodimni o'chirmoqchimisiz?")) {
            try { await deleteEmployee(id); } catch (error) { alert("Xodimni o'chirishda xatolik."); }
        }
    };

    const handleDeleteRole = async (id: string) => {
        if (window.confirm("Haqiqatan ham bu rolni o'chirmoqchimisiz? Bu rolga biriktirilgan xodimlar ishlay olmay qolishi mumkin.")) {
            try { await deleteRole(id); } catch (error) { alert("Rolni o'chirishda xatolik."); }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveTab('employees')} className={`px-4 py-2 font-medium ${activeTab === 'employees' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Xodimlar</button>
                <button onClick={() => setActiveTab('roles')} className={`px-4 py-2 font-medium ${activeTab === 'roles' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Rollar</button>
            </div>

            {activeTab === 'employees' && (
                <div className="space-y-4">
                    <div className="text-right">
                        <button onClick={() => handleOpenEmployeeModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ml-auto">
                            <PlusCircle size={18} className="mr-2" />
                            Yangi xodim
                        </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Ism</th>
                                    <th scope="col" className="px-6 py-3">Telefon</th>
                                    <th scope="col" className="px-6 py-3">Rol</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map(e => (
                                    <tr key={e.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{e.name}</td>
                                        <td className="px-6 py-4">{e.phone}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">{e.role?.name || 'Noma\'lum'}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenEmployeeModal(e)} className="p-1 text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                            <button onClick={() => handleDeleteEmployee(e.id)} className="p-1 text-red-600 hover:text-red-800 ml-2"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {activeTab === 'roles' && (
                 <div className="space-y-4">
                     <div className="text-right">
                        <button onClick={() => handleOpenRoleModal()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ml-auto">
                            <PlusCircle size={18} className="mr-2" />
                            Yangi rol
                        </button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Rol nomi</th>
                                    <th scope="col" className="px-6 py-3">Ruxsatlar soni</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amallar</th>
                                </tr>
                            </thead>
                             <tbody>
                                {roles.map(r => (
                                    <tr key={r.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{r.name}</td>
                                        <td className="px-6 py-4">{r.permissions.length} ta</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleOpenRoleModal(r)} className="p-1 text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                            <button onClick={() => handleDeleteRole(r.id)} className="p-1 text-red-600 hover:text-red-800 ml-2"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <Modal isOpen={isRoleModalOpen} onClose={handleCloseModals} title={editingRole ? "Rolni tahrirlash" : "Yangi rol qo'shish"} size="lg">
                <RoleForm role={editingRole} onSave={handleSaveRole} onClose={handleCloseModals} />
            </Modal>
            <Modal isOpen={isEmployeeModalOpen} onClose={handleCloseModals} title={editingEmployee ? "Xodimni tahrirlash" : "Yangi xodim qo'shish"} size="lg">
                <EmployeeForm employee={editingEmployee} onSave={handleSaveEmployee} onClose={handleCloseModals} />
            </Modal>
        </div>
    );
};

export default Hodimlar;