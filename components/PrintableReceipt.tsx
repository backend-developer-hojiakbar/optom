import React from 'react';
import { Sale, Product, Customer, StoreSettings, PaymentType, Employee } from '../types.ts';
import QRCode from './QRCode.tsx';

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

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('uz-UZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    };

    return (
      <div id="printable-receipt" ref={ref} className="p-2 bg-white text-black font-mono text-xs w-[288px]">
        {/* Header */}
        <div className="text-center mb-2">
          <h2 className="font-bold text-sm mb-1">{settings.name}</h2>
          <p className="text-xs">{settings.address}</p>
          <p className="text-xs">Tel: {settings.phone}</p>
          {settings.receiptHeader && <p className="mt-1">{settings.receiptHeader}</p>}
        </div>

        {/* Receipt Details */}
        <div className="mb-2">
          {settings.receiptShowChekId && <p className="text-xs">Chek: #{sale.id.slice(-6)}</p>}
          {settings.receiptShowDate && <p className="text-xs">Sana: {formatDate(sale.date)}</p>}
          {settings.receiptShowSeller && seller && <p className="text-xs">Sotuvchi: {seller.name}</p>}
          {settings.receiptShowCustomer && customer && <p className="text-xs">Mijoz: {customer.name}</p>}
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
              <tr key={item.product.id}>
                <td className="text-left w-1/2">{getProductName(item.product.id)}</td>
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
            {settings.receiptShowQR && (
              <QRCode
                saleId={sale.id}
                storeId={settings.id}
                totalAmount={Number(sale.total)}
                date={sale.date}
              />
            )}
        </div>
      </div>
    );
  }
);

export default PrintableReceipt;