import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ShoppingBag,
  Ticket,
  CreditCard,
  TrendingDown,
  Zap,
  AlertTriangle,
  Activity,
  Check,
  Plus,
  Minus,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react';

const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: 'Mechanical Keyboard Keychron K2',
    price: 1250000,
    image:
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'Logitech MX Master 3S',
    price: 1549000,
    image:
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&h=300&fit=crop',
  },
  {
    id: 3,
    name: 'Sony WH-1000XM5 Headphones',
    price: 4999000,
    image:
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=300&h=300&fit=crop',
  },
  {
    id: 4,
    name: 'Monitor LG UltraGear 27"',
    price: 3800000,
    image:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=300&fit=crop',
  },
];

const DUMMY_VOUCHERS = [
  {
    id: 'v1',
    code: 'HEMAT10',
    desc: 'Diskon 10% Semua Item',
    multiplier: 0.9,
    color: 'indigo',
  },
  {
    id: 'v2',
    code: 'ONGKIR5',
    desc: 'Diskon Ekstra 5%',
    multiplier: 0.95,
    color: 'blue',
  },
  {
    id: 'v3',
    code: 'FLASH20',
    desc: 'Flash Sale 20% Off',
    multiplier: 0.8,
    color: 'rose',
  },
  {
    id: 'v4',
    code: 'MEMBER2',
    desc: 'Diskon Member 2%',
    multiplier: 0.98,
    color: 'emerald',
  },
];

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};

const runIterative = (arr) => {
  let result = 1;
  for (let value of arr) {
    result *= value;
  }
  return result;
};

const runRecursive = (arr, index) => {
  if (index === arr.length) return 1;
  if (index >= arr.length) return 1;
  return arr[index] * runRecursive(arr, index + 1);
};

const VoucherCard = ({ voucher, isSelected, onToggle }) => (
  <div
    onClick={() => onToggle(voucher.id)}
    className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group overflow-hidden ${
      isSelected
        ? `border-${voucher.color}-500 bg-${voucher.color}-50/50 shadow-sm`
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    }`}
  >
    <div
      className={`p-3 rounded-full mr-4 bg-${voucher.color}-100 text-${voucher.color}-600 group-hover:scale-110 transition-transform`}
    >
      <Ticket size={20} />
    </div>
    <div className='flex-grow'>
      <h3 className='font-bold text-gray-800 flex items-center gap-2'>
        {voucher.code}
        {isSelected && (
          <Check size={16} className={`text-${voucher.color}-600`} />
        )}
      </h3>
      <p className='text-sm text-gray-500'>{voucher.desc}</p>
    </div>
    <div className='text-right'>
      <span className={`font-bold text-lg text-${voucher.color}-600`}>
        {Math.round((1 - voucher.multiplier) * 100)}% OFF
      </span>
    </div>
    <div
      className={`absolute -right-6 -bottom-6 text-${voucher.color}-100/50 opacity-20 pointer-events-none transform rotate-12`}
    >
      <Ticket size={80} />
    </div>
  </div>
);

export default function EcommerceVoucherStacking() {
  const [cart, setCart] = useState([DUMMY_PRODUCTS[0]]);
  const [selectedVoucherIds, setSelectedVoucherIds] = useState([]);
  const [baseTotal, setBaseTotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [totalMultiplier, setTotalMultiplier] = useState(1);

  const [chartData, setChartData] = useState([]);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkError, setBenchmarkError] = useState('');
  const [showBenchmark, setShowBenchmark] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    const newBaseTotal = cart.reduce((sum, item) => sum + item.price, 0);
    setBaseTotal(newBaseTotal);

    const activeMultipliers = DUMMY_VOUCHERS.filter((v) =>
      selectedVoucherIds.includes(v.id)
    ).map((v) => v.multiplier);

    const combinedMultiplier = runIterative(activeMultipliers);

    setTotalMultiplier(combinedMultiplier);
    setFinalTotal(newBaseTotal * combinedMultiplier);
  }, [cart, selectedVoucherIds]);

  const toggleVoucher = (id) => {
    setSelectedVoucherIds((prev) =>
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id]
    );
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const handleRunVoucherStressTest = useCallback(async () => {
    if (selectedVoucherIds.length === 0) {
      setBenchmarkError(
        'Pilih setidaknya satu voucher untuk melakukan stress test.'
      );
      return;
    }
    setIsBenchmarking(true);
    setBenchmarkError('');
    setChartData([]);

    const activeMultipliersBase = DUMMY_VOUCHERS.filter((v) =>
      selectedVoucherIds.includes(v.id)
    ).map((v) => v.multiplier);

    const sizes = [10, 100, 1000, 5000, 8000];
    const newChartData = [];
    const iterations = 200;

    setTimeout(() => {
      try {
        for (let size of sizes) {
          const largeVoucherArray = Array.from(
            { length: size },
            (_, i) => activeMultipliersBase[i % activeMultipliersBase.length]
          );

          const iterStart = performance.now();
          for (let i = 0; i < iterations; i++) runIterative(largeVoucherArray);
          const iterEnd = performance.now();
          const iterAvgTime = (iterEnd - iterStart) / iterations;

          let recAvgTime = null;
          if (size <= 7000) {
            const recStart = performance.now();
            for (let i = 0; i < iterations; i++)
              runRecursive(largeVoucherArray, 0);
            const recEnd = performance.now();
            recAvgTime = (recEnd - recStart) / iterations;
          }

          newChartData.push({
            name: size,
            iterative: iterAvgTime.toFixed(4),
            recursive: recAvgTime !== null ? recAvgTime.toFixed(4) : null,
          });
        }
        setChartData(newChartData);
      } catch (err) {
        setBenchmarkError('Stress Test Error: ' + err.message);
      } finally {
        setIsBenchmarking(false);
      }
    }, 100);
  }, [selectedVoucherIds]);

  const handlePayment = () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong! Pilih produk dulu.');
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  const resetTransaction = () => {
    setCart([]);
    setSelectedVoucherIds([]);
    setShowSuccessModal(false);
    setChartData([]);
  };

  return (
    <div className='min-h-screen bg-gray-100 font-sans text-gray-800'>
      <header className='bg-white shadow-sm sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex justify-between items-center'>
          <div className='flex items-center gap-2'>
            <ShoppingBag className='text-indigo-600 ' size={28} />
            <h1 className='text-xl font-extrabold tracking-tight text-gray-900'>
              Pavilion <span className='text-indigo-600'>ID</span>
            </h1>
          </div>
          <div className='flex items-center gap-4'>
            <div className='relative p-2 bg-gray-100 rounded-full text-gray-600'>
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className='absolute top-0 right-0 -mt-1 -mr-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white'>
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4'>
        <div className='lg:col-span-2 space-y-6'>
          <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
            <ShoppingBag className='text-gray-500' size={24} /> Produk Tersedia
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {DUMMY_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex hover:shadow-md transition-shadow'
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className='w-32 h-32 object-cover'
                />
                <div className='p-4 flex flex-col justify-between flex-grow'>
                  <div>
                    <h3 className='font-bold text-gray-800 line-clamp-1'>
                      {product.name}
                    </h3>
                    <p className='text-indigo-600 font-bold mt-1'>
                      {formatRupiah(product.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className='mt-3 w-full py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors'
                  >
                    <Plus size={16} /> Tambah ke Keranjang
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-10 bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden'>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500'></div>
            <button
              onClick={() => setShowBenchmark(!showBenchmark)}
              className='w-full flex justify-between items-center mb-4 focus:outline-none group'
            >
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors'>
                  <Activity size={20} />
                </div>
                <div className='text-left'>
                  <h2 className='text-lg font-bold text-gray-800'>
                    Voucher System Stress Test
                  </h2>
                  <p className='text-sm text-gray-500 hidden md:block'>
                    Analisis performa kalkulasi jika voucher yang dipilih
                    ditumpuk ribuan kali.
                  </p>
                </div>
              </div>
              <div
                className={`transform transition-transform duration-200 ${
                  showBenchmark ? 'rotate-180' : ''
                }`}
              >
                <TrendingDown size={20} className='text-gray-400' />
              </div>
            </button>

            {showBenchmark && (
              <div className='animate-fade-in-down'>
                <p className='text-sm text-gray-600 mb-4'>
                  Fitur ini akan menggunakan jenis voucher yang sedang Anda
                  pilih di keranjang, lalu mensimulasikan perhitungan jika
                  voucher tersebut ditumpuk dalam jumlah ekstrem (N) menggunakan
                  metode Iteratif vs Rekursif.
                </p>

                {benchmarkError && (
                  <div className='mb-4 bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-lg text-rose-700 flex items-start gap-2 text-sm'>
                    <AlertTriangle className='shrink-0 mt-0.5' size={16} />
                    <p>{benchmarkError}</p>
                  </div>
                )}

                <button
                  onClick={handleRunVoucherStressTest}
                  disabled={isBenchmarking || selectedVoucherIds.length === 0}
                  className='mb-6 w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-70'
                >
                  {isBenchmarking ? (
                    <Zap size={18} className='animate-spin' />
                  ) : (
                    <Activity size={18} />
                  )}
                  {isBenchmarking
                    ? 'Sedang Melakukan Stress Test...'
                    : 'Jalankan Stress Test (Iteratif vs Rekursif)'}
                </button>

                <div className='h-[350px] relative bg-gray-50 rounded-xl border border-gray-100 p-4'>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray='3 3'
                          stroke='#e5e7eb'
                          vertical={false}
                        />
                        <XAxis
                          dataKey='name'
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          label={{
                            value: 'Jumlah Voucher Ditumpuk (N)',
                            position: 'insideBottom',
                            offset: -15,
                            fill: '#4b5563',
                            fontSize: 12,
                          }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          label={{
                            value: 'Waktu Komputasi (ms)',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#4b5563',
                            fontSize: 12,
                          }}
                        />
                        <Tooltip
                          cursor={{
                            stroke: '#6366f1',
                            strokeWidth: 1,
                            strokeDasharray: '4 4',
                          }}
                          contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          }}
                          formatter={(value) => [`${value} ms`]}
                        />
                        <Legend
                          verticalAlign='top'
                          height={36}
                          iconType='circle'
                          wrapperStyle={{ fontSize: '12px' }}
                        />
                        <Line
                          type='monotone'
                          dataKey='iterative'
                          name='Iteratif (Loop)'
                          stroke='#4f46e5'
                          strokeWidth={3}
                          dot={{ r: 3, fill: 'white' }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type='monotone'
                          dataKey='recursive'
                          name='Rekursif (Fungsi)'
                          stroke='#f43f5e'
                          strokeWidth={3}
                          dot={{ r: 3, fill: 'white' }}
                          activeDot={{ r: 6 }}
                          connectNulls={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className='absolute inset-0 flex flex-col items-center justify-center text-gray-400'>
                      <Zap size={40} className='text-gray-300 mb-2' />
                      <p className='text-sm font-medium'>
                        Pilih voucher & jalankan test.
                      </p>
                    </div>
                  )}
                </div>
                <div className='mt-3 text-xs text-center text-gray-500 bg-indigo-50/50 py-2 rounded-lg px-2'>
                  <span className='font-bold text-indigo-700'>Catatan:</span>{' '}
                  Pada N=8000, metode Rekursif sengaja dihentikan (null) untuk
                  mencegah crash browser (Stack Overflow). Ini menunjukkan
                  keterbatasan memori metode rekursif pada data besar.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className='lg:col-span-1'>
          <div className='sticky top-24 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-10 custom-scrollbar'>
            <div className='bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100'>
              <h2 className='text-xl font-bold text-gray-800 mb-4 flex items-center gap-2'>
                <CreditCard className='text-gray-500' size={24} /> Ringkasan
                Belanja
              </h2>

              <div className='mb-6 max-h-48 overflow-y-auto pr-2 space-y-3 custom-scrollbar'>
                {cart.length === 0 ? (
                  <p className='text-gray-400 italic text-sm text-center py-4'>
                    Keranjang kosong
                  </p>
                ) : (
                  cart.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm'
                    >
                      <div className='flex items-center gap-2 overflow-hidden'>
                        <img
                          src={item.image}
                          className='w-8 h-8 rounded object-cover shrink-0'
                          alt=''
                        />
                        <span className='truncate text-gray-700 font-medium'>
                          {item.name}
                        </span>
                      </div>
                      <div className='flex items-center gap-3 ml-2 shrink-0'>
                        <span className='text-gray-600'>
                          {formatRupiah(item.price)}
                        </span>
                        <button
                          onClick={() => removeFromCart(index)}
                          className='text-gray-400 hover:text-rose-500 transition-colors'
                        >
                          <Minus
                            size={14}
                            className='bg-white rounded-full border border-gray-200 p-0.5 sm:p-1 box-content'
                          />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className='space-y-3 border-t border-gray-100 pt-4'>
                <div className='flex justify-between text-gray-600'>
                  <span>Total Harga ({cart.length} barang)</span>
                  <span className='font-medium'>{formatRupiah(baseTotal)}</span>
                </div>

                {selectedVoucherIds.length > 0 && (
                  <div className='bg-indigo-50 rounded-lg p-3 text-sm animate-fade-in-up'>
                    <div className='flex justify-between items-center text-indigo-700 font-medium mb-1'>
                      <span className='flex items-center gap-1'>
                        <Ticket size={14} /> Voucher Bertumpuk:
                      </span>
                      <span>{selectedVoucherIds.length}x</span>
                    </div>
                    <div className='text-xs font-mono text-indigo-600/80 break-all bg-indigo-100/50 p-2 rounded border border-indigo-100'>
                      Total Pengali ={' '}
                      <span className='font-bold'>
                        {totalMultiplier.toFixed(4)}
                      </span>
                    </div>
                    <div className='flex justify-between text-indigo-700 font-bold mt-2'>
                      <span>Total Hemat</span>
                      <span>- {formatRupiah(baseTotal - finalTotal)}</span>
                    </div>
                  </div>
                )}

                <div className='flex justify-between text-lg font-extrabold text-gray-900 pt-2 border-t border-gray-100 align-baseline'>
                  <span>Total Tagihan</span>
                  <span className='text-2xl text-indigo-600'>
                    {formatRupiah(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessingPayment || cart.length === 0}
                className='w-full bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl mt-6 transition-all flex items-center justify-center gap-2 text-lg shadow-lg hover:shadow-xl transform active:scale-95'
              >
                {isProcessingPayment ? (
                  <>
                    <RefreshCw size={20} className='animate-spin' />{' '}
                    Memproses...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} /> Bayar Sekarang
                  </>
                )}
              </button>
            </div>

            <div className='space-y-4'>
              <h3 className='font-bold text-gray-700 flex items-center gap-2 px-1'>
                <TrendingDown className='text-gray-500' size={20} /> Gunakan
                Voucher Hemat
              </h3>
              <p className='text-sm text-gray-500 px-1 -mt-2 mb-4'>
                Klik voucher untuk menumpuk diskon!
              </p>
              <div className='space-y-3'>
                {DUMMY_VOUCHERS.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    isSelected={selectedVoucherIds.includes(voucher.id)}
                    onToggle={toggleVoucher}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in'>
          <div className='bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-bounce-in'>
            <div className='bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-center text-white relative overflow-hidden'>
              <div className='absolute top-0 left-0 w-full h-full bg-white/10 opacity-30 pattern-dots'></div>
              <div className='bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner'>
                <Check
                  size={40}
                  className='text-white drop-shadow-md'
                  strokeWidth={3}
                />
              </div>
              <h2 className='text-2xl font-extrabold tracking-tight'>
                Pembayaran Berhasil!
              </h2>
              <p className='text-emerald-50 opacity-90 text-sm mt-1'>
                Terima kasih telah berbelanja di Pavilion ID
              </p>
            </div>

            <div className='p-8'>
              <div className='space-y-4 mb-8'>
                <div className='flex justify-between text-gray-500 text-sm border-b border-gray-100 pb-2'>
                  <span>Metode Pembayaran</span>
                  <span className='font-medium text-gray-800'>
                    QRIS / E-Wallet
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Total Harga Awal</span>
                  <span className='font-semibold text-gray-800 line-through decoration-rose-500 decoration-2'>
                    {formatRupiah(baseTotal)}
                  </span>
                </div>
                <div className='flex justify-between items-center text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100'>
                  <span className='flex items-center gap-2 font-medium'>
                    <Ticket size={16} /> Hemat (
                    {Math.round((1 - totalMultiplier) * 100)}%)
                  </span>
                  <span className='font-bold'>
                    - {formatRupiah(baseTotal - finalTotal)}
                  </span>
                </div>
                <div className='flex justify-between items-end pt-2 border-t-2 border-dashed border-gray-200'>
                  <span className='text-gray-800 font-bold text-lg'>
                    Total Dibayar
                  </span>
                  <span className='text-3xl font-black text-gray-900 tracking-tight'>
                    {formatRupiah(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={resetTransaction}
                className='w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition-transform transform hover:-translate-y-0.5 shadow-lg active:scale-95 flex items-center justify-center gap-2'
              >
                Belanja Lagi <ShoppingBag size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 20px;
            border: 3px solid transparent;
            background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(107, 114, 128, 0.8);
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.5s ease-out;
        }
        .animate-fade-in-down {
            animation: fadeInDown 0.5s ease-out;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
             from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
            0% { opacity: 0; transform: scale(0.9); }
            70% { transform: scale(1.02); }
            100% { opacity: 1; transform: scale(1); }
        }
        .animate-bounce-in {
            animation: bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
