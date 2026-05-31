'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/supabase/database-types'
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts'
import { Button } from '@/components/ui/button'

export function OwnerReportsClient({ 
    stats, 
    chartData,
    serviceData,
    machineData
}: { 
    stats: any, 
    chartData: any[],
    serviceData: any[],
    machineData: any[]
}) {
    const [chartType, setChartType] = useState<'area' | 'bar'>('area')
    const [downloadTimeframe, setDownloadTimeframe] = useState<'weekly'|'monthly'|'yearly'>('monthly')
    const [isDownloading, setIsDownloading] = useState(false)
    const [isDownloadingExcel, setIsDownloadingExcel] = useState(false)

    const handleDownloadPDF = async () => {
        try {
            setIsDownloading(true)
            const { jsPDF } = await import('jspdf')
            const { default: autoTable } = await import('jspdf-autotable')
            const { getReportDataForExport } = await import('@/app/actions/owner')

            const data = await getReportDataForExport(downloadTimeframe)

            const doc = new jsPDF()
            
            // Header Styling
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(22)
            doc.setTextColor(30, 64, 175) // blue-800
            doc.text('LAUNDRYKU', 14, 22)
            
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(11)
            doc.setTextColor(100)
            const titleMap = { weekly: 'Mingguan', monthly: 'Bulanan', yearly: 'Tahunan' }
            doc.text(`Laporan Transaksi ${titleMap[downloadTimeframe]}`, 14, 30)
            doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 36)

            // Line separator
            doc.setDrawColor(226, 232, 240) // slate-200
            doc.setLineWidth(0.5)
            doc.line(14, 40, 196, 40)

            let totalPemasukan = 0
            
            const tableData = data.map((b: any, index: number) => {
                const amount = Number(b.total_amount) || 0
                if (b.status === 'finished' || b.status === 'picked_up') {
                    totalPemasukan += amount
                }
                const date = new Date(b.created_at).toLocaleDateString('id-ID')
                return [
                    index + 1,
                    date,
                    b.booking_code,
                    b.customer?.full_name || '-',
                    b.service_type,
                    b.status,
                    formatCurrency(amount)
                ]
            })

            // Total Pemasukan box/text
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(30, 64, 175)
            const totalText = `Total Pemasukan (Selesai): ${formatCurrency(totalPemasukan)}`
            // Right align
            const textWidth = doc.getTextWidth(totalText)
            doc.text(totalText, 196 - textWidth, 48)

            autoTable(doc, {
                startY: 52,
                head: [['No', 'Tanggal', 'Resi', 'Pelanggan', 'Layanan', 'Status', 'Nominal']],
                body: tableData,
                theme: 'grid',
                headStyles: { 
                    fillColor: [30, 64, 175], 
                    textColor: 255, 
                    fontStyle: 'bold',
                    halign: 'center' 
                },
                alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
                columnStyles: {
                    0: { halign: 'center', cellWidth: 10 },
                    6: { halign: 'right' }
                },
                styles: { 
                    font: 'helvetica', 
                    fontSize: 9, 
                    cellPadding: 4,
                    lineColor: [226, 232, 240], // slate-200
                    lineWidth: 0.1
                }
            })

            doc.save(`Laporan_LaundryKu_${downloadTimeframe}.pdf`)

        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Gagal mengunduh laporan')
        } finally {
            setIsDownloading(false)
        }
    }

    const handleDownloadExcel = async () => {
        try {
            setIsDownloadingExcel(true)
            const XLSX = await import('xlsx')
            const { getReportDataForExport } = await import('@/app/actions/owner')

            const data = await getReportDataForExport(downloadTimeframe)

            const titleMap = { weekly: 'Mingguan', monthly: 'Bulanan', yearly: 'Tahunan' }
            
            let totalPemasukan = 0
            data.forEach((b: any) => {
                if (b.status === 'finished' || b.status === 'picked_up') {
                    totalPemasukan += (Number(b.total_amount) || 0)
                }
            })

            const aoa = [
                ['LAPORAN TRANSAKSI LAUNDRYKU'],
                [`Periode: ${titleMap[downloadTimeframe]}`],
                [`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
                [`Total Pemasukan (Selesai): ${formatCurrency(totalPemasukan)}`],
                [], // baris kosong
                ['No', 'Tanggal', 'Resi', 'Pelanggan', 'Layanan', 'Status', 'Nominal']
            ]

            data.forEach((b: any, index: number) => {
                aoa.push([
                    index + 1,
                    new Date(b.created_at).toLocaleDateString('id-ID'),
                    b.booking_code,
                    b.customer?.full_name || '-',
                    b.service_type,
                    b.status,
                    Number(b.total_amount) || 0
                ])
            })

            const worksheet = XLSX.utils.aoa_to_sheet(aoa)
            
            // Atur lebar kolom
            worksheet['!cols'] = [
                { wch: 5 },  // No
                { wch: 12 }, // Tanggal
                { wch: 15 }, // Resi
                { wch: 25 }, // Pelanggan
                { wch: 15 }, // Layanan
                { wch: 12 }, // Status
                { wch: 18 }  // Nominal
            ]

            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Transaksi')

            XLSX.writeFile(workbook, `Laporan_LaundryKu_${downloadTimeframe}.xlsx`)

        } catch (error) {
            console.error('Error generating Excel:', error)
            alert('Gagal mengunduh laporan Excel')
        } finally {
            setIsDownloadingExcel(false)
        }
    }

    // Colors according to ui-ux-pro-max
    const COLORS = ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#F59E0B']

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-md text-sm">
                    <p className="text-slate-500 mb-1 font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="font-bold">
                            {entry.name === 'revenue' || entry.name === 'Pendapatan (Rp)' ? 'Pendapatan: ' + formatCurrency(entry.value) : `${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)] pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Analisis</h1>
                    <p className="text-slate-500 mt-1">Ringkasan performa bisnis dan wawasan operasional</p>
                </div>
                <div className="flex items-center gap-2">
                    <select 
                        value={downloadTimeframe} 
                        onChange={(e) => setDownloadTimeframe(e.target.value as any)}
                        className="h-10 px-3 text-sm bg-white border border-slate-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="weekly">Mingguan</option>
                        <option value="monthly">Bulanan</option>
                        <option value="yearly">Tahunan</option>
                    </select>
                    <Button onClick={handleDownloadPDF} isLoading={isDownloading} className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm border-0">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        PDF
                    </Button>
                    <Button onClick={handleDownloadExcel} isLoading={isDownloadingExcel} className="bg-green-600 hover:bg-green-700 text-white shadow-sm border-0">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Excel
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="col-span-2 shadow-sm border-l-4 border-l-blue-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pendapatan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-blue-900">{formatCurrency(stats.totalRevenue)}</p>
                    </CardContent>
                </Card>
                
                <Card className="col-span-2 sm:col-span-1 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pesanan (Bulan Ini)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-slate-800">{stats.totalBookings}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-b-4 border-b-yellow-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Antre Hari Ini</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-amber-600">{stats.todayStatus?.pending || 0}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-b-4 border-b-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Proses Hari Ini</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-blue-600">{stats.todayStatus?.processing || 0}</p>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-b-4 border-b-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Selesai Hari Ini</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-black text-green-600">{stats.todayStatus?.completed || 0}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b border-slate-100">
                        <div>
                            <CardTitle className="text-lg text-slate-800">Tren Pendapatan & Pesanan</CardTitle>
                            <CardDescription className="text-xs">30 Hari Terakhir</CardDescription>
                        </div>
                        <div className="flex bg-slate-100 p-0.5 rounded-md mt-4 sm:mt-0">
                            <button className={`px-3 py-1 text-xs font-medium rounded ${chartType === 'area' ? 'bg-white shadow-sm text-blue-800' : 'text-slate-500'}`} onClick={() => setChartType('area')}>Area</button>
                            <button className={`px-3 py-1 text-xs font-medium rounded ${chartType === 'bar' ? 'bg-white shadow-sm text-blue-800' : 'text-slate-500'}`} onClick={() => setChartType('bar')}>Bar</button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {chartType === 'area' ? (
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#1E40AF" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} minTickGap={20} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `Rp${val/1000}k`} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area yAxisId="left" type="monotone" dataKey="revenue" name="Pendapatan (Rp)" stroke="#1E40AF" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} dy={10} minTickGap={20} />
                                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `Rp${val/1000}k`} />
                                        <YAxis yAxisId="right" orientation="right" hide />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar yAxisId="left" dataKey="revenue" name="Pendapatan (Rp)" fill="#1E40AF" radius={[2, 2, 0, 0]} />
                                        <Bar yAxisId="right" dataKey="orders" name="Jumlah Pesanan" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Service Distribution Pie */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-2 border-b border-slate-100">
                        <CardTitle className="text-lg text-slate-800">Distribusi Layanan</CardTitle>
                        <CardDescription className="text-xs">Komposisi tipe pesanan</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={serviceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {serviceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            {serviceData.map((s, i) => (
                                <div key={i} className="flex items-center text-xs text-slate-600">
                                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                    <span className="truncate">{s.name} ({s.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Machine Utilization */}
                <Card className="shadow-sm">
                    <CardHeader className="pb-2 border-b border-slate-100">
                        <CardTitle className="text-lg text-slate-800">Utilisasi Mesin Teratas</CardTitle>
                        <CardDescription className="text-xs">5 Mesin paling sering digunakan (30 hari terakhir)</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="h-[250px] w-full">
                            {machineData && machineData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={machineData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#1E3A8A', fontWeight: 600 }} width={60} />
                                        <Tooltip cursor={{fill: '#F8FAFC'}} content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Kali Digunakan" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24}>
                                            {machineData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#1E40AF' : '#3B82F6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">Belum ada data penggunaan mesin</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Insight Card */}
                <Card className="shadow-sm bg-gradient-to-br from-blue-900 to-blue-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Ringkasan Analisis AI</CardTitle>
                        <CardDescription className="text-blue-200">Insights otomatis dari data Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4 mt-2">
                            <li className="flex items-start">
                                <span className="text-amber-400 mr-2">✦</span>
                                <p className="text-sm text-blue-50">Layanan <strong className="text-white">{serviceData[0]?.name || 'Utama'}</strong> merupakan kontributor terbesar pesanan Anda.</p>
                            </li>
                            <li className="flex items-start">
                                <span className="text-amber-400 mr-2">✦</span>
                                <p className="text-sm text-blue-50">Mesin <strong className="text-white">{machineData[0]?.name || '-'}</strong> bekerja paling keras bulan ini. Pertimbangkan penjadwalan pemeliharaan (maintenance) bulan depan.</p>
                            </li>
                            <li className="flex items-start">
                                <span className="text-amber-400 mr-2">✦</span>
                                <p className="text-sm text-blue-50">Hari ini ada <strong className="text-white">{stats.todayStatus?.pending || 0} pesanan</strong> yang menunggu diproses. Segera kerahkan pegawai!</p>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
