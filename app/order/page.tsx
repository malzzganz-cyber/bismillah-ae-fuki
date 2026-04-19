'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Button, Card, Badge, Skeleton, Select, formatRupiah } from '@/components/ui';
import {
  ShoppingBag, Phone, Copy, Check, RefreshCw, X,
  ChevronRight, Loader2, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'select' | 'confirm' | 'active';

interface ActiveOrder {
  docId: string;
  orderId: string;
  phoneNumber: string;
  otp: string | null;
  status: string;
  serviceName: string;
  operatorName: string;
  markedPrice: number;
}

export default function OrderPage() {
  const { userData, refreshUserData } = useAuth();

  // Data
  const [services, setServices] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [operatorsLoading, setOperatorsLoading] = useState(false);

  // Selection
  const [selectedService, setSelectedService] = useState('');
  const [selectedOperator, setSelectedOperator] = useState('');
  const [step, setStep] = useState<Step>('select');

  // Active order
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const getToken = useCallback(async () => {
    const tok = await auth.currentUser?.getIdToken();
    if (!tok) throw new Error('Not authenticated');
    return tok;
  }, []);

  // Load services on mount
  useEffect(() => {
    loadServices();
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  // Load operators when service changes
  useEffect(() => {
    if (selectedService) loadOperators(selectedService);
    setSelectedOperator('');
  }, [selectedService]);

  const loadServices = async () => {
    setServicesLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/order/services', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Support array or object response
      const list = Array.isArray(data.data) ? data.data : Object.values(data.data || {});
      setServices(list);
    } catch (err: any) {
      toast.error('Gagal memuat layanan: ' + err.message);
    } finally {
      setServicesLoading(false);
    }
  };

  const loadOperators = async (serviceId: string) => {
    setOperatorsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`/api/order/operators?provider_id=${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const list = Array.isArray(data.data) ? data.data : Object.values(data.data || {});
      setOperators(list);
    } catch (err: any) {
      toast.error('Gagal memuat operator: ' + err.message);
    } finally {
      setOperatorsLoading(false);
    }
  };

  const getSelectedServiceObj = () => services.find((s: any) => String(s.id || s.service_id) === selectedService);
  const getSelectedOperatorObj = () => operators.find((o: any) => String(o.id || o.operator_id) === selectedOperator);

  const basePrice = () => {
    const op = getSelectedOperatorObj();
    return op ? Number(op.price || op.cost || 0) : 0;
  };

  const markedPrice = () => {
    const p = basePrice();
    return p + (p <= 15000 ? 500 : 1000);
  };

  const handleConfirm = () => {
    if (!selectedService || !selectedOperator) return toast.error('Pilih layanan dan operator');
    if ((userData?.balance ?? 0) < markedPrice()) {
      return toast.error(`Saldo tidak cukup. Butuh: ${formatRupiah(markedPrice())}`);
    }
    setStep('confirm');
  };

  const handleCreateOrder = async () => {
    const svc = getSelectedServiceObj();
    const opr = getSelectedOperatorObj();
    if (!svc || !opr) return;

    setCreating(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          serviceId: String(svc.id || svc.service_id),
          operatorId: String(opr.id || opr.operator_id),
          serviceName: svc.name || svc.title || svc.service_name || selectedService,
          operatorName: opr.name || opr.operator_name || selectedOperator,
          basePrice: basePrice(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const order: ActiveOrder = {
        docId: data.docId,
        orderId: data.orderId,
        phoneNumber: data.phoneNumber || '',
        otp: null,
        status: 'pending',
        serviceName: svc.name || svc.title || selectedService,
        operatorName: opr.name || opr.operator_name || selectedOperator,
        markedPrice: data.markedPrice,
      };
      setActiveOrder(order);
      setStep('active');
      toast.success('Order berhasil dibuat! 📱');
      refreshUserData();
      startPolling(data.docId, data.orderId);
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat order');
    } finally {
      setCreating(false);
    }
  };

  const startPolling = (docId: string, orderId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    // First check after 10s
    setTimeout(() => checkOrderStatus(docId, orderId), 10000);
    pollRef.current = setInterval(() => checkOrderStatus(docId, orderId), 60000);
  };

  const checkOrderStatus = async (docId: string, orderId: string) => {
    try {
      const token = await getToken();
      const res = await fetch('/api/order/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ docId, orderId }),
      });
      const data = await res.json();
      if (!res.ok) return;

      setActiveOrder(prev => prev ? {
        ...prev,
        status: data.status,
        otp: data.otp || prev.otp,
        phoneNumber: data.phoneNumber || prev.phoneNumber,
      } : null);

      if (data.otp) toast.success('🎉 OTP diterima!');
      if (['finished', 'cancelled', 'timeout'].includes(data.status)) {
        if (pollRef.current) clearInterval(pollRef.current);
        if (data.status === 'cancelled' || data.status === 'timeout') refreshUserData();
      }
    } catch { }
  };

  const handleManualCheck = () => {
    if (!activeOrder) return;
    toast('Mengecek status...', { icon: '🔄' });
    checkOrderStatus(activeOrder.docId, activeOrder.orderId);
  };

  const handleCancel = async () => {
    if (!activeOrder) return;
    if (pollRef.current) clearInterval(pollRef.current);
    try {
      const token = await getToken();
      const res = await fetch('/api/order/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ docId: activeOrder.docId, orderId: activeOrder.orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast('Order dibatalkan. Saldo dikembalikan.', { icon: '🔁' });
      refreshUserData();
      resetFlow();
    } catch (err: any) {
      toast.error(err.message || 'Gagal membatalkan');
    }
  };

  const handleCopyPhone = () => {
    if (!activeOrder?.phoneNumber) return;
    navigator.clipboard.writeText(activeOrder.phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Nomor disalin!');
  };

  const handleCopyOTP = (otp: string) => {
    navigator.clipboard.writeText(otp);
    toast.success('OTP disalin!');
  };

  const resetFlow = () => {
    setActiveOrder(null);
    setStep('select');
    setSelectedService('');
    setSelectedOperator('');
  };

  const statusColor: Record<string, string> = {
    pending: '#f59e0b', received: '#3b82f6', finished: '#22c55e',
    cancelled: '#64748b', timeout: '#ef4444',
  };
  const statusLabel: Record<string, string> = {
    pending: 'Menunggu SMS', received: 'SMS Diterima', finished: 'Selesai',
    cancelled: 'Dibatalkan', timeout: 'Kadaluarsa',
  };

  // ─── ACTIVE ORDER VIEW ────────────────────────────────────────────────────
  if (step === 'active' && activeOrder) {
    return (
      <div className="px-5 py-6 page-enter">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
            <Phone size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Order Aktif</h1>
            <p className="text-xs text-white/40">{activeOrder.serviceName} · {activeOrder.operatorName}</p>
          </div>
        </div>

        {/* Status card */}
        <div className="rounded-3xl p-5 mb-5 relative overflow-hidden"
          style={{ background: 'rgba(17,24,39,0.9)', border: `1px solid ${statusColor[activeOrder.status]}33` }}>
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-5 blur-3xl"
            style={{ background: statusColor[activeOrder.status], transform: 'translate(40%, -40%)' }} />

          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: `${statusColor[activeOrder.status]}18`, color: statusColor[activeOrder.status], border: `1px solid ${statusColor[activeOrder.status]}30` }}>
              {statusLabel[activeOrder.status] || activeOrder.status}
            </span>
            <span className="text-sm font-bold text-white">{formatRupiah(activeOrder.markedPrice)}</span>
          </div>

          {/* Phone number */}
          <p className="text-xs text-white/40 mb-1">Nomor Virtual</p>
          {activeOrder.phoneNumber ? (
            <div className="flex items-center gap-3 mb-5">
              <p className="text-2xl font-mono font-bold text-white tracking-wider flex-1">
                {activeOrder.phoneNumber}
              </p>
              <button onClick={handleCopyPhone}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-white/50" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-5">
              <Loader2 size={16} className="animate-spin text-white/30" />
              <p className="text-white/30 text-sm">Mengambil nomor...</p>
            </div>
          )}

          {/* OTP Box */}
          {activeOrder.otp ? (
            <div className="rounded-2xl p-4 mb-4"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-xs text-green-400/60 mb-2 font-medium">🎉 Kode OTP Diterima</p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-mono font-bold text-green-400 tracking-[0.2em] flex-1">
                  {activeOrder.otp}
                </p>
                <button onClick={() => handleCopyOTP(activeOrder.otp!)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <Copy size={16} className="text-green-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 mb-4 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-center gap-2 text-white/30">
                <Loader2 size={14} className="animate-spin" />
                <span className="text-sm">Menunggu OTP...</span>
              </div>
              <p className="text-xs text-white/20 mt-1">Auto-cek tiap 60 detik</p>
            </div>
          )}

          {/* Actions */}
          {!['finished', 'cancelled', 'timeout'].includes(activeOrder.status) && (
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={handleManualCheck} className="flex-1 gap-1.5">
                <RefreshCw size={13} /> Cek Ulang
              </Button>
              <Button variant="danger" size="sm" onClick={handleCancel} className="flex-1 gap-1.5">
                <X size={13} /> Batalkan
              </Button>
            </div>
          )}

          {['finished', 'cancelled', 'timeout'].includes(activeOrder.status) && (
            <Button fullWidth onClick={resetFlow} className="mt-2">
              + Order Baru
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-white/20">
          Order ID: <span className="font-mono">{activeOrder.orderId}</span>
        </p>
      </div>
    );
  }

  // ─── CONFIRM VIEW ─────────────────────────────────────────────────────────
  if (step === 'confirm') {
    const svc = getSelectedServiceObj();
    const opr = getSelectedOperatorObj();
    return (
      <div className="px-5 py-6 page-enter">
        <h1 className="font-display text-2xl font-bold text-white mb-6">Konfirmasi Order</h1>

        <Card className="p-5 mb-5 space-y-4">
          {[
            { label: 'Layanan', value: svc?.name || svc?.title || selectedService },
            { label: 'Operator', value: opr?.name || opr?.operator_name || selectedOperator },
            { label: 'Harga Dasar', value: formatRupiah(basePrice()) },
            { label: 'Markup', value: `+ ${formatRupiah(markedPrice() - basePrice())}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-sm text-white/40">{label}</span>
              <span className="text-sm font-semibold text-white">{value}</span>
            </div>
          ))}
          <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-white">Total Bayar</span>
            <span className="text-lg font-bold text-green-400">{formatRupiah(markedPrice())}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-white/30">Saldo setelah order</span>
            <span className="text-xs text-white/50">{formatRupiah((userData?.balance ?? 0) - markedPrice())}</span>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="secondary" size="lg" onClick={() => setStep('select')} className="flex-1">
            Kembali
          </Button>
          <Button size="lg" loading={creating} onClick={handleCreateOrder} className="flex-1">
            {creating ? 'Memproses...' : 'Order Sekarang'}
          </Button>
        </div>
      </div>
    );
  }

  // ─── SELECT VIEW ──────────────────────────────────────────────────────────
  return (
    <div className="px-5 py-6 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
          <ShoppingBag size={18} className="text-blue-400" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Order Nokos</h1>
          <p className="text-sm text-white/40">Saldo: <span className="text-white font-semibold">{formatRupiah(userData?.balance ?? 0)}</span></p>
        </div>
      </div>

      <Card className="p-5 space-y-5">
        {/* Service selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Pilih Layanan</label>
          {servicesLoading ? (
            <Skeleton className="h-14 w-full" />
          ) : (
            <Select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
            >
              <option value="" style={{ background: '#111827' }}>-- Pilih Layanan --</option>
              {services.map((s: any) => {
                const id = String(s.id || s.service_id || '');
                const name = s.name || s.title || s.service_name || id;
                return (
                  <option key={id} value={id} style={{ background: '#111827' }}>{name}</option>
                );
              })}
            </Select>
          )}
        </div>

        {/* Operator selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/70">Pilih Operator / Negara</label>
          {operatorsLoading ? (
            <Skeleton className="h-14 w-full" />
          ) : (
            <Select
              value={selectedOperator}
              onChange={e => setSelectedOperator(e.target.value)}
              disabled={!selectedService || operators.length === 0}
            >
              <option value="" style={{ background: '#111827' }}>
                {!selectedService ? '-- Pilih layanan dahulu --' : operators.length === 0 ? 'Tidak ada operator' : '-- Pilih Operator --'}
              </option>
              {operators.map((o: any) => {
                const id = String(o.id || o.operator_id || '');
                const name = o.name || o.operator_name || id;
                const price = o.price || o.cost || 0;
                return (
                  <option key={id} value={id} style={{ background: '#111827' }}>
                    {name} — {formatRupiah(Number(price) + (Number(price) <= 15000 ? 500 : 1000))}
                  </option>
                );
              })}
            </Select>
          )}
        </div>

        {/* Price preview */}
        {selectedOperator && (
          <div className="rounded-2xl p-4 space-y-2"
            style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Harga dasar</span>
              <span className="text-white">{formatRupiah(basePrice())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Markup layanan</span>
              <span className="text-white/60">+ {formatRupiah(markedPrice() - basePrice())}</span>
            </div>
            <div className="h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex justify-between">
              <span className="text-sm font-bold text-white">Total</span>
              <span className="text-base font-bold text-green-400">{formatRupiah(markedPrice())}</span>
            </div>
          </div>
        )}

        <Button
          fullWidth size="lg"
          onClick={handleConfirm}
          disabled={!selectedService || !selectedOperator}
          className="gap-2"
        >
          <Zap size={16} /> Lanjut Order
        </Button>
      </Card>

      {/* Info box */}
      <div className="mt-5 rounded-2xl p-4"
        style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)' }}>
        <p className="text-xs text-yellow-400/80 font-medium mb-1">💡 Cara kerja</p>
        <p className="text-xs text-white/40 leading-relaxed">
          Pilih layanan & operator → Konfirmasi → Dapatkan nomor virtual → Gunakan untuk verifikasi → OTP muncul otomatis di sini.
        </p>
      </div>
    </div>
  );
}
