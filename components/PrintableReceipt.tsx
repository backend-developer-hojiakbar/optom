import React from 'react';
import { Sale, Product, Customer, StoreSettings, PaymentType, Employee } from '../types.ts';

interface PrintableReceiptProps {
  sale: Sale | null;
  products: Product[];
  customer: Customer | null;
  settings: StoreSettings | null;
  seller?: Employee | null;
}

const paymentTypeLabels: { [key in PaymentType]: string } = {
    [PaymentType.CASH]: "Naqd",
    [PaymentType.CARD]: "Plastik karta",
    [PaymentType.TRANSFER]: "O'tkazma",
    [PaymentType.DEBT]: "Nasiya"
};

const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(
    ({ sale, products, customer, settings, seller }, ref) => {
    if (!sale || !settings) return null;

    const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Noma\'lum mahsulot';

    return (
      <div id="printable-receipt" ref={ref} className="p-4 bg-white text-black font-mono text-xs w-[288px]">
        <div className="text-center">
          {settings.receiptShowStoreName && <h2 className="font-bold text-sm">{settings.name}</h2>}
          {settings.receiptShowAddress && <p>{settings.address}</p>}
          {settings.receiptShowPhone && <p>Tel: {settings.phone}</p>}
          {settings.receiptHeader && <p className="mt-2">{settings.receiptHeader}</p>}
        </div>
        <hr className="my-2 border-dashed border-black" />
        <div>
          {settings.receiptShowChekId && <p>Chek: #{sale.id.slice(-6)}</p>}
          {settings.receiptShowDate && <p>Sana: {new Date(sale.date).toLocaleString('uz-UZ')}</p>}
          {settings.receiptShowSeller && seller && <p>Sotuvchi: {seller.name}</p>}
          {settings.receiptShowCustomer && customer && <p>Mijoz: {customer.name}</p>}
        </div>
        <hr className="my-2 border-dashed border-black" />
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Mahsulot</th>
              <th className="text-right">Miqdor</th>
              <th className="text-right">Narx</th>
              <th className="text-right">Summa</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map(item => (
              <tr key={item.productId}>
                <td className="text-left w-1/2">{getProductName(item.productId)}</td>
                <td className="text-right">{item.quantity}</td>
                <td className="text-right">{item.price.toLocaleString()}</td>
                <td className="text-right">{(item.quantity * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="my-2 border-dashed border-black" />
        <div className="text-right">
          <p>Jami: {Number(sale.subtotal).toLocaleString()} {settings.currency}</p>
          {Number(sale.discount) > 0 && <p>Chegirma: -{Number(sale.discount).toLocaleString()} {settings.currency}</p>}
          <p className="font-bold">To'lash uchun: {Number(sale.total).toLocaleString()} {settings.currency}</p>
        </div>
        <hr className="my-2 border-dashed border-black" />
        <div className="text-left">
            <p className="font-bold">To'lovlar:</p>
            {sale.payments.map((p, index) => (
                <div key={index} className="flex justify-between">
                    <span>{paymentTypeLabels[p.type]}:</span>
                    <span>{p.amount.toLocaleString()} {settings.currency}</span>
                </div>
            ))}
        </div>
         <hr className="my-2 border-dashed border-black" />
        <div className="text-center">
            {settings.receiptFooter && <p className="mt-2">{settings.receiptFooter}</p>}
        </div>
      </div>
    );
  }
);

export default PrintableReceipt;