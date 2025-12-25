import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import { Search, Plus, Edit2, Trash2, X, Download, RefreshCw, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [cargo, setCargo] = useState([]);
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [formData, setFormData] = useState({
    type: 'sell order',
    items: [],
    customerName: '',
    cargo: ''
  });
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchOrders();
    fetchRelatedData();
  }, [searchTerm, statusFilter, typeFilter, monthFilter, yearFilter]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders', {
        params: {
          search: searchTerm,
          status: statusFilter,
          type: typeFilter,
          month: monthFilter,
          year: yearFilter
        }
      });
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [customersRes, itemsRes, cargoRes, salesmenRes] = await Promise.all([
        api.get('/customers'),
        api.get('/items'),
        api.get('/cargo'),
        api.get('/salesman')
      ]);

      if (customersRes.data.success) setCustomers(customersRes.data.data);
      if (itemsRes.data.success) setItems(itemsRes.data.data);
      if (cargoRes.data.success) setCargo(cargoRes.data.data);
      if (salesmenRes.data.success) setSalesmen(salesmenRes.data.data);
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  };

  const showAlert = (title, message, type = 'error') => {
    setAlertConfig({ title, message, type });
    setShowAlertModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that all selected items have quantity
    if (selectedItems.length === 0) {
      showAlert('Validation Error', 'Please select at least one item', 'warning');
      return;
    }
    
    const hasInvalidQuantity = selectedItems.some(item => !item.quantity || item.quantity < 1);
    if (hasInvalidQuantity) {
      showAlert('Validation Error', 'All items must have a quantity of at least 1', 'warning');
      return;
    }
    
    const orderData = {
      ...formData,
      items: selectedItems.map(item => ({
        item: item.itemId,
        quantity: parseInt(item.quantity)
      }))
    };
    
    try {
      if (selectedOrder) {
        const response = await api.put(`/orders/${selectedOrder._id}`, orderData);
        if (response.data.success) {
          fetchOrders();
          handleCloseModal();
        }
      } else {
        const response = await api.post('/orders', orderData);
        if (response.data.success) {
          fetchOrders();
          handleCloseModal();
        }
      }
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await api.put(`/orders/${selectedOrder._id}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        fetchOrders();
        setShowStatusModal(false);
        setSelectedOrder(null);
        setNewStatus('');
      }
    } catch (error) {
      setShowStatusModal(false);
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/orders/${selectedOrder._id}`);
      if (response.data.success) {
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      setShowDeleteModal(false);
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setFormData({
      type: order.type,
      customerName: order.customerName?._id || '',
      cargo: order.cargo?._id || ''
    });
    
    // Map items with quantities
    const itemsWithQty = order.items.map(orderItem => ({
      itemId: orderItem.item?._id || orderItem.item,
      quantity: orderItem.quantity,
      name: orderItem.item?.name || 'Unknown Item',
      price: orderItem.item?.price || 0,
      availableQty: orderItem.item?.quantity || 0
    }));
    
    setSelectedItems(itemsWithQty);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setFormData({
      type: 'sell order',
      customerName: '',
      cargo: ''
    });
    setSelectedItems([]);
  };

  const handleAddItem = (itemId) => {
    const item = items.find(i => i._id === itemId);
    if (!item) return;
    
    // Check if item already added
    if (selectedItems.some(si => si.itemId === itemId)) {
      showAlert('Item Already Added', 'This item is already added to the order', 'info');
      return;
    }
    
    setSelectedItems([...selectedItems, {
      itemId: item._id,
      name: item.name,
      price: item.price,
      availableQty: item.quantity,
      quantity: 1
    }]);
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
  };

  const handleUpdateItemQuantity = (itemId, quantity) => {
    setSelectedItems(selectedItems.map(item => 
      item.itemId === itemId ? { ...item, quantity: parseInt(quantity) || 0 } : item
    ));
  };

  const getNextStatus = (currentStatus) => {
    const statusMap = {
      'pending': 'to roll',
      'to roll': 'rolled',
      'rolled': 'billed',
      'billed': 'delivered'
    };
    return statusMap[currentStatus];
  };

  const handleExportToExcel = () => {
    if (orders.length === 0) {
      showAlert('No Data', 'No data to export', 'info');
      return;
    }

    const exportData = orders.map((order, index) => ({
      'S.No': index + 1,
      'Order ID': order._id,
      'Date': new Date(order.createdAt).toLocaleDateString(),
      'Type': order.type,
      'Customer': order.customerName?.name || '-',
      'Items': order.items.map(orderItem => 
        `${orderItem.item?.name || 'Unknown'} (Qty: ${orderItem.quantity})`
      ).join(', '),
      'Status': order.status,
      'Cargo': order.cargo?.name || '-',
      'Created By': order.createdByType === 'admin' ? 'Admin' : (order.createdBy?.name || '-')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

    const fileName = `orders_${yearFilter}_${monthFilter || 'all'}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'to roll': 'bg-blue-100 text-blue-800',
    'rolled': 'bg-purple-100 text-purple-800',
    'billed': 'bg-orange-100 text-orange-800',
    'delivered': 'bg-green-100 text-green-800'
  };

  return (
    <div className="space-y-6">
      {/* Title and Controls in one row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-4xl font-bold text-slate-800" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Orders</h1>
        </div>

        <div className="relative w-64">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by customer, order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all min-w-[150px]"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="to roll">To Roll</option>
          <option value="rolled">Rolled</option>
          <option value="billed">Billed</option>
          <option value="delivered">Delivered</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all min-w-[150px]"
        >
          <option value="">All Types</option>
          <option value="sell order">Sell Order</option>
          <option value="purchase order">Purchase Order</option>
        </select>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all min-w-[150px]"
        >
          <option value="">All Months</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all min-w-[120px]"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <button
          onClick={handleExportToExcel}
          className="flex items-center justify-center bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
          title="Export to Excel"
        >
          <Download className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center bg-slate-700 text-white p-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          title="Add Order"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200/70 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/80 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Salesman</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr 
                      key={order._id} 
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailModal(true);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 capitalize">
                        {order.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                        {order.customerName?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {order.createdByType === 'admin' ? 'Admin' : (order.createdBy?.name || '-')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          {order.status !== 'delivered' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(getNextStatus(order.status));
                                setShowStatusModal(true);
                              }}
                              className="text-emerald-600 hover:text-emerald-900 transition-colors"
                              title="Update Status"
                            >
                              <RefreshCw className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(order)}
                            className="text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDeleteModal(true);
                            }}
                            className="text-rose-600 hover:text-rose-900 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="srf-modal-backdrop">
          <div className="srf-modal-panel max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="srf-modal-header">
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedOrder ? 'Edit Order' : 'Add Order'}
              </h3>
              <button onClick={handleCloseModal} className="srf-icon-btn text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full"
                >
                  <option value="sell order">Sell Order</option>
                  <option value="purchase order">Purchase Order</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                <select
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full"
                >
                  <option value="">Select Customer</option>
                  {customers.filter(c => !c.isBlocked).map(customer => (
                    <option key={customer._id} value={customer._id}>{customer.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                <div className="space-y-2">
                  {/* Add Item Dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddItem(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full"
                  >
                    <option value="">+ Add Item</option>
                    {items.filter(item => !selectedItems.some(si => si.itemId === item._id)).map(item => (
                      <option key={item._id} value={item._id}>
                        {item.name} - ₹{item.price} (Available: {item.quantity})
                      </option>
                    ))}
                  </select>

                  {/* Selected Items List */}
                  {selectedItems.length > 0 && (
                    <div className="border border-gray-300 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                      {selectedItems.map((item) => (
                        <div key={item.itemId} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">₹{item.price} (Available: {item.availableQty})</p>
                          </div>
                          <input
                            type="number"
                            min="1"
                            max={formData.type === 'sell order' ? item.availableQty : undefined}
                            value={item.quantity}
                            onChange={(e) => handleUpdateItemQuantity(item.itemId, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Qty"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.itemId)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedItems.length === 0 && (
                    <p className="text-xs text-gray-500 italic">No items selected. Use the dropdown above to add items.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cargo (Optional)</label>
                <select
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full"
                >
                  <option value="">Select Cargo</option>
                  {cargo.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This order will be automatically created by Admin.
                </p>
              </div>
            </form>
              
            <div className="srf-modal-footer">
              <button
                type="button"
                onClick={handleCloseModal}
                className="srf-btn srf-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="srf-btn srf-btn-primary"
              >
                {selectedOrder ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      <ConfirmModal
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedOrder(null);
          setNewStatus('');
        }}
        onConfirm={handleStatusUpdate}
        title="Update Order Status"
        message={`Are you sure you want to change status from "${selectedOrder?.status}" to "${newStatus}"?`}
        type="info"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrder(null);
        }}
        onConfirm={handleDelete}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        type="danger"
      />

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="srf-modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div className="srf-modal-panel max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="srf-modal-header">
              <h3 className="text-lg font-semibold text-slate-900">Order Details</h3>
              <button 
                onClick={() => setShowDetailModal(false)} 
                className="srf-icon-btn text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Order ID</p>
                  <p className="text-sm text-slate-900 font-mono bg-slate-100 px-3 py-2 rounded-lg">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm text-slate-900 font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm text-slate-900 font-medium capitalize">{selectedOrder.type}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Name:</span>
                    <span className="text-sm text-slate-900 font-medium">{selectedOrder.customerName?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Phone:</span>
                    <span className="text-sm text-slate-900 font-medium">{selectedOrder.customerName?.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Email:</span>
                    <span className="text-sm text-slate-900 font-medium">{selectedOrder.customerName?.email || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((orderItem, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{orderItem.item?.name || 'Unknown Item'}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Price: ₹{orderItem.item?.price || 0} × Quantity: {orderItem.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            ₹{((orderItem.item?.price || 0) * orderItem.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-slate-900">Total Amount:</span>
                    <span className="text-lg font-bold text-indigo-600">
                      ₹{selectedOrder.items.reduce((total, orderItem) => 
                        total + ((orderItem.item?.price || 0) * orderItem.quantity), 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                {selectedOrder.cargo && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Cargo</p>
                    <p className="text-sm text-slate-900 font-medium">{selectedOrder.cargo?.name || '-'}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Created By</p>
                  <p className="text-sm text-slate-900 font-medium">
                    {selectedOrder.createdByType === 'admin' ? 'Admin' : (selectedOrder.createdBy?.name || '-')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="srf-modal-footer">
              <button
                onClick={() => setShowDetailModal(false)}
                className="srf-btn srf-btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedOrder);
                }}
                className="srf-btn srf-btn-primary"
              >
                <Edit2 className="w-4 h-4" />
                Edit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
};

export default Orders;

