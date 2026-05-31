import { createServerSupabase } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { redirect } from 'next/navigation'

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const DAY_NAMES_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

interface DaySchedule {
    day_of_week: number
    start_time: string
    end_time: string
    is_active: boolean
}

export default async function SchedulePage() {
    const supabase = await createServerSupabase()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 1. Dapatkan employee record berdasarkan user_id yang login
    const { data: empData } = await supabase
        .from('employees')
        .select(`
            id,
            profile:profiles!user_id(full_name)
        `)
        .eq('user_id', user.id)
        .single()

    if (!empData) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                Profil pegawai tidak ditemukan.
            </div>
        )
    }

    const employeeName = (empData as any).profile?.full_name || (Array.isArray((empData as any).profile) ? (empData as any).profile[0]?.full_name : '') || ''

    // 2. Ambil jadwal shift dari tabel employee_schedules
    const { data: scheduleData } = await supabase
        .from('employee_schedules')
        .select('day_of_week, start_time, end_time, is_active')
        .eq('employee_id', empData.id)
        .order('day_of_week', { ascending: true })

    const schedules = (scheduleData || []) as DaySchedule[]

    // Buat array 7 hari dengan data jadwal (atau null jika tidak ada jadwal)
    const weekGrid = [1, 2, 3, 4, 5, 6, 0].map(day => { // Urutan: Senin-Minggu
        const schedule = schedules.find(s => s.day_of_week === day && s.is_active)
        return { day, schedule: schedule || null }
    })

    const today = new Date().getDay() // 0=Minggu, 1=Senin, ...
    const totalWorkDays = schedules.filter(s => s.is_active).length

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Jadwal Shift Saya</h1>
                <p className="text-gray-500 mt-1">
                    Jadwal kerja mingguan berulang
                    {employeeName && ` — ${employeeName}`}
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
                    <CardContent className="p-4">
                        <p className="text-indigo-100 text-sm">Hari Kerja / Minggu</p>
                        <p className="text-3xl font-black mt-1">
                            {totalWorkDays}
                        </p>
                        <p className="text-indigo-200 text-xs mt-1">hari</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-gray-500 text-sm">Status Hari Ini</p>
                        <div className="mt-2">
                            {schedules.some(s => s.day_of_week === today && s.is_active) ? (
                                <Badge variant="success">Sedang Bertugas</Badge>
                            ) : (
                                <Badge variant="default">Hari Libur</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-2 sm:col-span-1">
                    <CardContent className="p-4">
                        <p className="text-gray-500 text-sm">Jam Kerja Hari Ini</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">
                            {(() => {
                                const todaySchedule = schedules.find(s => s.day_of_week === today && s.is_active)
                                if (!todaySchedule) return '—'
                                return `${todaySchedule.start_time.slice(0, 5)} – ${todaySchedule.end_time.slice(0, 5)}`
                            })()}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Grid */}
            <Card>
                <CardHeader>
                    <CardTitle>Jadwal Mingguan</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {schedules.length === 0 ? (
                        <div className="text-center py-16 px-6">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">Belum Ada Jadwal</p>
                            <p className="text-gray-500 text-sm mt-1">
                                Belum ada jadwal shift yang ditugaskan kepada Anda.<br />
                                Hubungi owner/admin untuk mengatur jadwal.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-b-xl">
                            <div className="grid grid-cols-7 gap-px bg-gray-200 min-w-[500px] sm:min-w-full overflow-hidden">
                                {weekGrid.map(({ day, schedule }) => {
                                    const isToday = day === today
                                    const isWorkDay = !!schedule
                                    return (
                                        <div
                                            key={day}
                                            className={`flex flex-col items-center p-2 sm:p-4 min-h-[120px] transition-colors ${
                                                isToday
                                                    ? 'bg-indigo-50 '
                                                    : 'bg-white '
                                            }`}
                                        >
                                            {/* Day name */}
                                            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2 ${
                                                isToday
                                                    ? 'text-indigo-600 '
                                                    : 'text-gray-400 '
                                            }`}>
                                                <span className="hidden sm:inline">{DAY_NAMES[day]}</span>
                                                <span className="sm:hidden">{DAY_NAMES_SHORT[day]}</span>
                                            </span>

                                            {/* Status indicator */}
                                            {isWorkDay ? (
                                                <div className={`w-full rounded-lg p-2 text-center ${
                                                    isToday
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-green-50 border border-green-200 '
                                                }`}>
                                                    <div className={`text-[10px] sm:text-xs font-bold mb-0.5 ${
                                                        isToday ? 'text-indigo-100' : 'text-green-600 '
                                                    }`}>
                                                        KERJA
                                                    </div>
                                                    <div className={`text-[9px] sm:text-[11px] font-semibold ${
                                                        isToday ? 'text-white' : 'text-gray-700 '
                                                    }`}>
                                                        {schedule.start_time.slice(0, 5)}
                                                    </div>
                                                    <div className={`text-[9px] sm:text-[11px] ${
                                                        isToday ? 'text-indigo-200' : 'text-gray-500'
                                                    }`}>
                                                        s/d
                                                    </div>
                                                    <div className={`text-[9px] sm:text-[11px] font-semibold ${
                                                        isToday ? 'text-white' : 'text-gray-700 '
                                                    }`}>
                                                        {schedule.end_time.slice(0, 5)}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full rounded-lg p-2 text-center bg-gray-50 border border-gray-100">
                                                    <div className="text-[10px] sm:text-xs text-gray-400 font-medium">
                                                        Libur
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Detail List */}
            {schedules.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Detail Jam Kerja</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-gray-100">
                            {weekGrid
                                .filter(({ schedule }) => !!schedule)
                                .map(({ day, schedule }) => {
                                    const isToday = day === today
                                    return (
                                        <div
                                            key={day}
                                            className={`flex items-center justify-between px-6 py-4 ${
                                                isToday ? 'bg-indigo-50/50 ' : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                                                    isToday
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 '
                                                }`}>
                                                    {DAY_NAMES_SHORT[day]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {DAY_NAMES[day]}
                                                        {isToday && (
                                                            <span className="ml-2 text-xs text-indigo-500 font-normal">(Hari ini)</span>
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {schedule!.start_time.slice(0, 5)} – {schedule!.end_time.slice(0, 5)} WIB
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="success" size="sm">Aktif</Badge>
                                        </div>
                                    )
                                })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
