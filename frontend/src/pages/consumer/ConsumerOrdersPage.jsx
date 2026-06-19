import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderApi } from '../../api/services';
import { getErrorMessage } from '../../utils/constants';

export default function ConsumerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data } = await orderApi.getConsumer();
      setOrders(data.data.orders);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderApi.updateStatus(orderId, 'cancelled');
      toast.success('Order cancelled');
      fetchOrders();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
      <p className="mt-1 text-gray-600 text-sm">Track your orders from local growers.</p>

      {orders.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl mb-4">🛒</span>
          <p className="text-base font-bold text-slate-850">No orders placed yet</p>
          <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">Use "Find Growers" to browse and add items to your cart.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="card border border-slate-100 shadow-sm overflow-hidden p-0">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/50 px-5 py-4 border-b border-slate-100 gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ordering from</p>
                  <h3 className="text-base font-bold text-slate-800 mt-0.5">{order.growerName}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">City: {order.growerCity}</p>
                </div>
                <div className="flex flex-col sm:items-end gap-1.5">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-5 py-4 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.name} className="flex justify-between items-center py-2.5 text-sm">
                    <div>
                      <p className="font-semibold text-slate-800 capitalize">{item.name}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity} x ₹{item.price}</p>
                    </div>
                    <p className="font-bold text-slate-800">₹{item.quantity * item.price}</p>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-slate-50/20 px-5 py-4 border-t border-slate-100 gap-4">
                <div className="flex justify-between sm:justify-start items-baseline gap-2">
                  <span className="text-xs text-slate-500 font-medium">Total Amount:</span>
                  <span className="text-lg font-extrabold text-slate-900">₹{order.totalAmount}</span>
                </div>
                
                {order.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(order._id)}
                    className="btn-secondary py-2 text-xs font-bold text-rose-600 border border-rose-100 hover:bg-rose-50/20 hover:border-rose-200"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
