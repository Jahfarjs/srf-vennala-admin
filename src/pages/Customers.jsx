import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import DetailModal from '../components/DetailModal';
import Pagination from '../components/Pagination';
import { Search, Plus, Edit2, Trash2, X, Eye, ShieldOff, ShieldCheck } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBlocked, setFilterBlocked] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0
  });
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gstin: '',
    isBlocked: false,
    paymentRating: 'good'
  });

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, filterBlocked, filterPayment, currentPage]);

  // Reset to page 1 when search term or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBlocked, filterPayment]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = { 
        search: searchTerm,
        page: currentPage,
        limit: itemsPerPage
      };
      if (filterBlocked !== '') params.isBlocked = filterBlocked;
      if (filterPayment !== '') params.paymentRating = filterPayment;
      const response = await api.get('/customers', { params });
      if (response.data.success) {
        setCustomers(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showAlert = (title, message, type = 'error') => {
    setAlertConfig({ title, message, type });
    setShowAlertModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedCustomer) {
        const response = await api.put(`/customers/${selectedCustomer._id}`, formData);
        if (response.data.success) {
          fetchCustomers();
          handleCloseModal();
        }
      } else {
        const response = await api.post('/customers', formData);
        if (response.data.success) {
          fetchCustomers();
          handleCloseModal();
        }
      }
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/customers/${selectedCustomer._id}`);
      if (response.data.success) {
        fetchCustomers();
        setSelectedCustomer(null);
      }
    } catch (error) {
      setShowDeleteModal(false);
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      gstin: customer.gstin || '',
      isBlocked: customer.isBlocked,
      paymentRating: customer.paymentRating || 'good'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setFormData({ name: '', phone: '', gstin: '', isBlocked: false, paymentRating: 'good' });
  };

  const PAYMENT_RATING = {
    good:    { label: 'Good Payer',    bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
    average: { label: 'Average Payer', bg: 'bg-amber-100',   text: 'text-amber-800',   dot: 'bg-amber-500'   },
    bad:     { label: 'Poor Payer',    bg: 'bg-rose-100',    text: 'text-rose-800',    dot: 'bg-rose-500'    },
  };

  const PaymentBadge = ({ rating }) => {
    const cfg = PAYMENT_RATING[rating] || PAYMENT_RATING.good;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${cfg.bg} ${cfg.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
      </span>
    );
  };

  const handleViewDetail = (customer) => {
    setDetailCustomer(customer);
    setShowDetailModal(true);
  };

  const confirmToggleBlock = (customer) => {
    setBlockTarget(customer);
    setShowBlockModal(true);
  };

  const handleToggleBlock = async () => {
    if (!blockTarget) return;
    try {
      const response = await api.put(`/customers/${blockTarget._id}`, {
        isBlocked: !blockTarget.isBlocked,
      });
      if (response.data.success) {
        fetchCustomers();
      }
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    } finally {
      setBlockTarget(null);
    }
  };

  const getDetailFields = (customer) => [
    { label: 'Name', value: customer?.name, type: 'text', key: 'name' },
    { label: 'Phone', value: customer?.phone, type: 'text', key: 'phone' },
    { label: 'GSTIN', value: customer?.gstin || '—', type: 'text', key: 'gstin' },
    { label: 'Status', value: customer?.isBlocked ? 'Blocked' : 'Active', type: 'badge', key: 'status' },
    { label: 'Payment Rating', value: PAYMENT_RATING[customer?.paymentRating]?.label || 'Good Payer', type: 'text', key: 'paymentRating' },
    { label: 'Created At', value: customer?.createdAt, type: 'datetime', key: 'createdAt' },
    { label: 'Updated At', value: customer?.updatedAt, type: 'datetime', key: 'updatedAt' },
  ];

  return (
    <div className="space-y-6">
      {/* Title and Controls in one row */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-4xl font-bold text-slate-800" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Customers</h1>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, phone, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all"
          />
        </div>
        <select
          value={filterBlocked}
          onChange={(e) => setFilterBlocked(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all min-w-[150px]"
        >
          <option value="">All Customers</option>
          <option value="false">Active Only</option>
          <option value="true">Blocked Only</option>
        </select>
        <select
          value={filterPayment}
          onChange={(e) => setFilterPayment(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all min-w-[160px]"
        >
          <option value="">All Payment Ratings</option>
          <option value="good">Good Payer</option>
          <option value="average">Average Payer</option>
          <option value="bad">Poor Payer</option>
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm font-medium whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm ring-1 ring-slate-200/70 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">GSTIN</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        No customers found
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr
                        key={customer._id}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetail(customer)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{customer.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{customer.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{customer.gstin || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PaymentBadge rating={customer.paymentRating || 'good'} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            customer.isBlocked ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {customer.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewDetail(customer); }}
                            className="text-indigo-500 hover:text-indigo-700 mr-3 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); confirmToggleBlock(customer); }}
                            className={`mr-3 transition-colors ${customer.isBlocked ? 'text-emerald-600 hover:text-emerald-800' : 'text-amber-500 hover:text-amber-700'}`}
                            title={customer.isBlocked ? 'Unblock Customer' : 'Block Customer'}
                          >
                            {customer.isBlocked ? <ShieldCheck className="w-5 h-5" /> : <ShieldOff className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}
                            className="text-slate-600 hover:text-slate-900 mr-3 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomer(customer);
                              setShowDeleteModal(true);
                            }}
                            className="text-rose-600 hover:text-rose-900 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="srf-modal-backdrop">
          <div className="srf-modal-panel max-w-md">
            <div className="srf-modal-header">
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedCustomer ? 'Edit Customer' : 'Add Customer'}
              </h3>
              <button onClick={handleCloseModal} className="srf-icon-btn text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Rating</label>
                <select
                  value={formData.paymentRating}
                  onChange={(e) => setFormData({ ...formData, paymentRating: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-all"
                >
                  <option value="good">Good Payer</option>
                  <option value="average">Average Payer</option>
                  <option value="bad">Poor Payer</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBlocked"
                  checked={formData.isBlocked}
                  onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isBlocked" className="ml-2 text-sm text-gray-700">
                  Block this customer
                </label>
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
                {selectedCustomer ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setDetailCustomer(null); }}
        title="Customer Details"
        fields={getDetailFields(detailCustomer)}
        onEdit={() => detailCustomer && handleEdit(detailCustomer)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCustomer(null);
        }}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${selectedCustomer?.name}? This action cannot be undone.`}
        type="danger"
      />

      {/* Block / Unblock Confirmation Modal */}
      <ConfirmModal
        isOpen={showBlockModal}
        onClose={() => { setShowBlockModal(false); setBlockTarget(null); }}
        onConfirm={handleToggleBlock}
        title={blockTarget?.isBlocked ? 'Unblock Customer' : 'Block Customer'}
        message={
          blockTarget?.isBlocked
            ? `Are you sure you want to unblock ${blockTarget?.name}? They will be selectable in the mobile app again.`
            : `Are you sure you want to block ${blockTarget?.name}? They will not be selectable in the mobile app.`
        }
        type={blockTarget?.isBlocked ? 'info' : 'warning'}
      />

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

export default Customers;

