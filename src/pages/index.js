import React, { useState } from 'react';
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
  Play,
  RefreshCw,
  BarChart2,
  Layers,
  AlertTriangle,
  Zap,
  Box,
  Timer,
} from 'lucide-react';

const Card = ({ children, title, icon: Icon, className = '' }) => (
  <div
    className={`bg-white rounded-2xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col ${className}`}
  >
    {title && (
      <div className='flex items-center gap-3 mb-6 pb-3 border-b border-gray-100'>
        <div className='p-2 bg-indigo-50 text-indigo-600 rounded-lg'>
          <Icon size={20} />
        </div>
        <h2 className='text-lg font-bold text-gray-800'>{title}</h2>
      </div>
    )}
    {children}
  </div>
);

export default function ModernAlgorithmBenchmark() {
  const [inputSize, setInputSize] = useState('');
  const [benchmarkSizes, setBenchmarkSizes] = useState('');
  const [generatedArray, setGeneratedArray] = useState([]);
  const [singleResult, setSingleResult] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const runIterative = (arr) => {
    let result = 1;
    for (let value of arr) {
      result *= value;
    }
    return result;
  };

  const runRecursive = (arr, index) => {
    if (index === arr.length) return 1;
    return arr[index] * runRecursive(arr, index + 1);
  };

  const generateRandomArray = (size) => {
    return Array.from(
      { length: size },
      () => Math.floor(Math.random() * 5) + 1
    );
  };

  const handleGenerateArray = () => {
    const size = parseInt(inputSize);
    if (isNaN(size) || size <= 0) {
      setErrorMsg('Masukkan jumlah data yang valid > 0');
      return;
    }
    const arr = generateRandomArray(size);
    setGeneratedArray(arr);
    setSingleResult(null);
    setErrorMsg('');
  };

  const handleRunSingle = (type) => {
    setErrorMsg('');
    let arrToUse = generatedArray;
    let currentSize = generatedArray.length;

    if (currentSize === 0) {
      const size = parseInt(inputSize);
      if (isNaN(size) || size <= 0) {
        setErrorMsg('Masukkan jumlah data untuk generate otomatis.');
        return;
      }
      arrToUse = generateRandomArray(size);
      setGeneratedArray(arrToUse);
      currentSize = size;
    }

    let res;
    const iterations = 500;

    try {
      const start = performance.now();

      if (type === 'iterative') {
        for (let i = 0; i < iterations; i++) {
          res = runIterative(arrToUse);
        }
      } else {
        if (currentSize > 7000)
          throw new Error(
            'Ukuran array terlalu besar untuk Rekursif (Potensi Stack Overflow)'
          );
        for (let i = 0; i < iterations; i++) {
          res = runRecursive(arrToUse, 0);
        }
      }

      const end = performance.now();
      const avgTimeMs = (end - start) / iterations;

      setSingleResult({
        type: type === 'iterative' ? 'Iteratif' : 'Rekursif',
        result: res,
        time: avgTimeMs.toFixed(5),
        size: currentSize,
      });
    } catch (err) {
      setErrorMsg(err.message);
      setSingleResult(null);
    }
  };

  const handleRunBenchmark = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSingleResult(null);

    const sizes = benchmarkSizes
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    if (sizes.length === 0) {
      setErrorMsg('Masukkan setidaknya satu ukuran data untuk benchmark.');
      setIsLoading(false);
      return;
    }

    const newChartData = [];

    setTimeout(() => {
      try {
        for (let size of sizes) {
          const arr = generateRandomArray(size);
          const iterations = 500;

          const iterStart = performance.now();
          for (let i = 0; i < iterations; i++) runIterative(arr);
          const iterEnd = performance.now();
          const iterAvgTime = (iterEnd - iterStart) / iterations;

          let recAvgTime = 0;
          if (size <= 7000) {
            const recStart = performance.now();
            for (let i = 0; i < iterations; i++) runRecursive(arr, 0);
            const recEnd = performance.now();
            recAvgTime = (recEnd - recStart) / iterations;
          } else {
            recAvgTime = null;
          }

          newChartData.push({
            name: size,
            iterative: iterAvgTime.toFixed(5),
            recursive: recAvgTime !== null ? recAvgTime.toFixed(5) : null,
          });
        }
        setChartData(newChartData);
      } catch (err) {
        setErrorMsg('Benchmark Error: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6 md:p-8 font-sans text-gray-800 antialiased'>
      <header className='max-w-7xl mx-auto mb-8 text-center md:text-left md:flex justify-between items-end'>
        <div>
          <h1 className='text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500'>
            JS Array Multiplication
          </h1>
          <p className='text-gray-500 mt-2 text-lg'>
            Analisis Performa:{' '}
            <span className='font-medium text-indigo-600'>Iteratif</span> vs{' '}
            <span className='font-medium text-rose-500'>Rekursif</span>
          </p>
        </div>
      </header>

      {errorMsg && (
        <div className='max-w-7xl mx-auto mb-6 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg text-rose-700 flex items-start gap-3 animate-fade-in-down'>
          <AlertTriangle className='shrink-0 mt-0.5' size={20} />
          <p className='font-medium'>{errorMsg}</p>
        </div>
      )}

      <main className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8'>
        <div className='lg:col-span-4 flex flex-col gap-8'>
          <Card title='Konfigurasi Data' icon={Box}>
            <div className='mb-5'>
              <label className='block text-sm font-semibold text-gray-600 mb-2'>
                Jumlah Elemen Array (N)
              </label>
              <div className='relative'>
                <input
                  type='number'
                  value={inputSize}
                  onChange={(e) => setInputSize(e.target.value)}
                  placeholder='Contoh: 100'
                  className='w-full pl-4 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none font-medium'
                />
                <div className='absolute right-4 top-3.5 text-gray-400 font-medium text-sm'>
                  items
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateArray}
              className='w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md'
            >
              <RefreshCw
                size={18}
                className={isLoading ? 'animate-spin' : ''}
              />{' '}
              Generate Array Baru
            </button>

            <div
              className={`mt-6 p-4 bg-gray-100 rounded-xl border border-gray-200 transition-all ${
                generatedArray.length ? 'opacity-100' : 'opacity-50 grayscale'
              }`}
            >
              <div className='flex justify-between items-center mb-2'>
                <span className='text-xs font-bold uppercase text-gray-500 tracking-wider'>
                  Data Preview
                </span>
                <span className='text-xs font-medium px-2 py-1 bg-gray-200 rounded-full text-gray-600'>
                  Size: {generatedArray.length || 0}
                </span>
              </div>
              <div className='h-24 overflow-y-auto text-sm font-mono text-gray-600 break-all bg-white p-2 rounded-lg shadow-inner'>
                {generatedArray.length > 0 ? (
                  `[${generatedArray.slice(0, 50).join(', ')}${
                    generatedArray.length > 50 ? '...' : ''
                  }]`
                ) : (
                  <span className='text-gray-400 italic'>
                    Belum ada data. Klik generate.
                  </span>
                )}
              </div>
            </div>
          </Card>

          <Card title='Uji Coba Manual' icon={Zap}>
            <p className='text-sm text-gray-500 mb-4'>
              Jalankan satu kali pengujian pada data yang aktif.
            </p>
            <div className='grid grid-cols-2 gap-3 mb-6'>
              <button
                onClick={() => handleRunSingle('iterative')}
                className='group bg-white border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 text-indigo-700 font-semibold py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all'
              >
                <Layers
                  size={20}
                  className='text-indigo-500 group-hover:scale-110 transition-transform'
                />
                <span>Run Iteratif</span>
              </button>
              <button
                onClick={() => handleRunSingle('recursive')}
                className='group bg-white border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-50 text-rose-700 font-semibold py-3 px-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all'
              >
                <RefreshCw
                  size={20}
                  className='text-rose-500 group-hover:rotate-180 transition-transform duration-500'
                />
                <span>Run Rekursif</span>
              </button>
            </div>

            {singleResult && (
              <div className='bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-200 shadow-sm animate-fade-in-up'>
                <div className='flex items-center justify-between mb-3'>
                  <span
                    className={`font-bold px-3 py-1 rounded-full text-sm ${
                      singleResult.type === 'Iteratif'
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {singleResult.type}
                  </span>
                  <span className='text-gray-500 text-sm font-medium flex items-center gap-1'>
                    <Timer size={14} /> {singleResult.time} ms
                  </span>
                </div>
                <div className='space-y-1'>
                  <p className='text-sm text-gray-500 flex justify-between'>
                    <span>Input Size:</span>{' '}
                    <span className='font-medium text-gray-800'>
                      {singleResult.size}
                    </span>
                  </p>
                  <div className='text-sm text-gray-500'>
                    <span className='block mb-1'>Result:</span>
                    <div className='w-full p-2 bg-gray-100 rounded-lg font-mono text-gray-800 text-xs truncate border border-gray-200'>
                      {singleResult.result}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className='lg:col-span-8'>
          <Card
            title='Benchmark & Visualisasi Grafik'
            icon={BarChart2}
            className='h-full'
          >
            <div className='flex flex-col md:flex-row gap-3 mb-6 items-end'>
              <div className='flex-grow'>
                <label className='block text-sm font-semibold text-gray-600 mb-2'>
                  Titik Uji Benchmark (N)
                </label>
                <input
                  type='text'
                  value={benchmarkSizes}
                  onChange={(e) => setBenchmarkSizes(e.target.value)}
                  placeholder='Contoh: 10, 100, 1000'
                  className='w-full pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-sm font-mono'
                />
              </div>
              <button
                onClick={handleRunBenchmark}
                disabled={isLoading}
                className='md:w-auto w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed h-[50px]'
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className='animate-spin' />{' '}
                    Memproses...
                  </>
                ) : (
                  <>
                    <Play size={18} className='fill-current' /> Jalankan
                    Benchmark
                  </>
                )}
              </button>
            </div>

            <div className='flex-grow min-h-[450px] relative bg-gradient-to-b from-white to-gray-50 rounded-xl border border-gray-100 p-4'>
              {chartData.length > 0 ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
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
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      label={{
                        value: 'Ukuran Data (N)',
                        position: 'insideBottom',
                        offset: -20,
                        fill: '#4b5563',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      label={{
                        value: 'Rata-rata Waktu (ms)',
                        angle: -90,
                        position: 'insideLeft',
                        offset: 0,
                        fill: '#4b5563',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    />
                    <Tooltip
                      cursor={{
                        stroke: '#6366f1',
                        strokeWidth: 1,
                        strokeDasharray: '4 4',
                      }}
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      }}
                      itemStyle={{ padding: '4px 0' }}
                      formatter={(value, name) => [`${value} ms`, name]}
                    />
                    <Legend verticalAlign='top' height={40} iconType='circle' />
                    <Line
                      type='monotone'
                      dataKey='iterative'
                      name='Iteratif (Loop)'
                      stroke='#4f46e5'
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                      animationDuration={1500}
                    />
                    <Line
                      type='monotone'
                      dataKey='recursive'
                      name='Rekursif (Fungsi)'
                      stroke='#f43f5e'
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                      activeDot={{ r: 8, strokeWidth: 0, fill: '#f43f5e' }}
                      animationDuration={1500}
                      connectNulls={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className='absolute inset-0 flex flex-col items-center justify-center text-gray-400'>
                  <div className='p-6 bg-gray-100 rounded-full mb-4'>
                    <BarChart2 size={48} className='text-gray-300' />
                  </div>
                  <h3 className='text-lg font-semibold text-gray-600'>
                    Belum ada data benchmark
                  </h3>
                  <p className='text-sm max-w-xs text-center mt-2'>
                    Masukkan ukuran data di atas dan klik {'Jalankan Benchmark'}
                    untuk melihat visualisasi.
                  </p>
                </div>
              )}
            </div>
            <div className='mt-4 text-xs text-center text-gray-500 bg-indigo-50 py-2 rounded-lg'>
              <span className='font-bold text-indigo-700'>Info Teknis:</span>{' '}
              Waktu yang ditampilkan adalah rata-rata (ms) dari 500x eksekusi
              per ukuran data.
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
