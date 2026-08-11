import { useState, useEffect, useMemo } from 'react';
import { Search, Shield, CheckCircle, Lock, Users, UserCheck, UserX, ChevronDown } from 'lucide-react';
import apiClient from '../../../services/apiClient';

const isUserActive = (status) => {
  if (!status) return false;
  const s = String(status).toUpperCase();
  return s === 'ACTIVE' || s === 'ON' || s === 'ENABLE' || s === '1' || s === 'TRUE';
};

function StatusBadge({ status }) {
  const active = isUserActive(status);
  return active
    ? <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle className="w-3 h-3" />Hoạt động</span>
    : <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-rose-500/10 text-rose-400 border-rose-500/20"><Lock className="w-3 h-3" />Đã khóa</span>;
}

function RoleBadge({ role }) {
  const isAdmin = role === 'ROLE_ADMIN' || role === 'ADMIN';
  return isAdmin
    ? <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20"><Shield className="w-3 h-3" />ADMIN</span>
    : <span className="text-[11px] font-medium text-zinc-500 border border-white/8 bg-white/3 px-2 py-0.5 rounded">USER</span>;
}

function AdminCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 ${className}`} style={{ background: '#1A1A1A' }}>
      {children}
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/users');
        const data = Array.isArray(res) ? res : (res?.data || []);
        setUsers(data);
      } catch (err) {
        console.warn('AdminUsers fetch error:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter(u => {
      const matchSearch = !q
        || (u.name || '').toLowerCase().includes(q)
        || (u.email || '').toLowerCase().includes(q)
        || (u.phoneNumber || '').includes(q);
      const role = u.role || '';
      const matchRole = roleFilter === 'ALL'
        || (roleFilter === 'ADMIN' && (role === 'ROLE_ADMIN' || role === 'ADMIN'))
        || (roleFilter === 'USER' && (role === 'ROLE_USER' || role === 'USER'));
      return matchSearch && matchRole;
    });
  }, [users, searchQuery, roleFilter]);

  const toggleStatus = async (user) => {
    const newStatus = isUserActive(user.status) ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.patch(`/users/${user.id}/update-status`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === 'ROLE_ADMIN' || u.role === 'ADMIN').length,
    customers: users.filter(u => u.role !== 'ROLE_ADMIN' && u.role !== 'ADMIN').length,
    blocked: users.filter(u => !isUserActive(u.status)).length,
  }), [users]);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Tổng tài khoản', value: stats.total, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: <Users className="w-5 h-5" /> },
          { label: 'Quản trị viên', value: stats.admins, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', icon: <Shield className="w-5 h-5" /> },
          { label: 'Khách hàng', value: stats.customers, color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: <UserCheck className="w-5 h-5" /> },
          { label: 'Tài khoản khóa', value: stats.blocked, color: '#F43F5E', bg: 'rgba(244,63,94,0.1)', icon: <UserX className="w-5 h-5" /> },
        ].map(k => (
          <AdminCard key={k.label} className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.bg, color: k.color }}>
              {k.icon}
            </div>
            <div>
              <p className="text-zinc-400 text-xs">{k.label}</p>
              <p className="text-white font-bold text-xl">{loading ? '--' : k.value}</p>
            </div>
          </AdminCard>
        ))}
      </div>

      {/* Filter bar */}
      <AdminCard className="p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-sm text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none"
            style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'USER', label: 'Khách hàng' },
            { id: 'ADMIN', label: 'Quản trị viên' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                roleFilter === tab.id ? 'bg-[#CF0F47] text-white' : 'text-zinc-400 hover:text-white border border-white/8'
              }`}
              style={roleFilter !== tab.id ? { background: '#111111' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </AdminCard>

      {/* Table */}
      <AdminCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead style={{ background: '#111111' }}>
              <tr className="text-xs uppercase text-zinc-500 font-bold border-b border-white/5">
                <th className="px-6 py-3.5">Người dùng</th>
                <th className="px-6 py-3.5">SĐT</th>
                <th className="px-6 py-3.5">Ngày sinh</th>
                <th className="px-6 py-3.5">Điểm</th>
                <th className="px-6 py-3.5">Đăng ký qua</th>
                <th className="px-6 py-3.5">Vai trò</th>
                <th className="px-6 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-3 bg-white/5 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-zinc-500 text-sm">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs uppercase shrink-0"
                          style={{ background: 'linear-gradient(135deg, #CF0F47 0%, #8B0B30 100%)' }}>
                          {(u.name || '?').charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-xs font-semibold">{u.name}</p>
                          <p className="text-zinc-500 text-[11px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-300">{u.phoneNumber || '—'}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{u.doB || '—'}</td>
                    <td className="px-6 py-4 text-xs font-bold text-amber-400">{u.point ?? 0}</td>
                    <td className="px-6 py-4 text-xs text-zinc-500">{u.registerBy || 'Email'}</td>
                    <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleStatus(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                          isUserActive(u.status)
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                        }`}
                      >
                        {isUserActive(u.status) ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  );
}
