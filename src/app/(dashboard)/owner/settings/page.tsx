import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PaymentMethodsSettings } from './payment-methods'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function OwnerSettingsPage() {
    const supabase = await createServerSupabase()
    const { data: paymentMethods } = await supabase
        .from('store_payment_methods')
        .select('*')
        .order('created_at', { ascending: false })


    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Pengaturan Bisnis</h1>
                <p className="text-gray-500 mt-1">Kelola profil usaha dan preferensi aplikasi</p>
            </div>

            {/* Payment Methods Section */}
            <PaymentMethodsSettings initialMethods={paymentMethods || []} />

            <Card className="border-red-100">
                <CardHeader>
                    <CardTitle className="text-red-600">Zona Berbahaya</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="font-medium text-gray-900">Reset Data Aplikasi</p>
                            <p className="text-sm text-gray-500">Tindakan ini akan menghapus beberapa data sementara. Harap berhati-hati.</p>
                        </div>
                        <Button variant="outline" className="text-red-600 hover:bg-red-50 border-red-200">
                            Reset Data
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
