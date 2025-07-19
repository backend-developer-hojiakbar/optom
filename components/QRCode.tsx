import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAppContext } from '../context/AppContext.tsx';
import { Link } from 'react-router-dom';

interface QRCodeProps {
  saleId: string;
  storeId: string;
  totalAmount: number;
  date: string;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ saleId, storeId, totalAmount, date }) => {
  const { settings } = useAppContext();
  const qrData = {
    saleId,
    storeId,
    totalAmount,
    date,
    storeName: settings?.name || 'Store',
    currency: settings?.currency || 'UZS'
  };

  const qrString = JSON.stringify(qrData);

  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isScanning) {
      const startCamera = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setIsScanning(false);
        }
      };

      startCamera();

      const scanQR = () => {
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            // Here you would implement QR code decoding logic
            // For now, we'll just simulate scanning
            setTimeout(() => {
              const simulatedData = `https://soliq.uz/qr?data=${encodeURIComponent(qrString)}`;
              setScannedData(simulatedData);
              setIsScanning(false);
              window.location.href = simulatedData;
            }, 2000);
          }
        }
      };

      const interval = setInterval(scanQR, 1000);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  return (
    <div className="mt-2">
      <QRCodeSVG
        value={qrString}
        size={100}
        level="H"
        includeMargin={true}
        className="mb-2"
        title="Chek QR kodi"
      />
      
      <div className="text-center text-xs mb-2">
        <button 
          onClick={() => setIsScanning(!isScanning)}
          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
        >
          {isScanning ? 'Toxtatish' : 'QR kodni skanerlash'}
        </button>
      </div>

      {isScanning && (
        <div className="mt-2">
          <div className="relative w-full">
            <video ref={videoRef} className="w-full" autoPlay playsInline />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full opacity-0" />
          </div>
        </div>
      )}

      {scannedData && (
        <div className="mt-2 text-center text-xs">
          <p>Skanerlangan ma''lumot: {scannedData}</p>
        </div>
      )}

      <p className="text-center text-xs mt-2">Scan QR kodni soliq.uz saytiga kirish uchun</p>
    </div>
  );
};

export default QRCodeComponent;
