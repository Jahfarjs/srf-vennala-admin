import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import DetailModal from '../components/DetailModal';
import Pagination from '../components/Pagination';
import { Search, Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';

const Salesmen = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' });
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [detailSalesman, setDetailSalesman] = useState(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '', phone: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSalesmen();
  }, [searchTerm, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchSalesmen = async () => {
    try {
      setLoading(true);
      const response = await api.get('/salesman', {
        params: { search: searchTerm, page: currentPage, limit: itemsPerPage }
      });
      if (response.data.success) {
        setSalesmen(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching salesmen:', error);
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

  const handleViewDetail = (salesman) => {
    setDetailSalesman(salesman);
    setShowDetailModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSalesman) {
        const response = await api.put(`/salesman/${selectedSalesman._id}`, formData);
        if (response.data.success) {
          fetchSalesmen();
          handleCloseModal();
        }
      } else {
        const response = await api.post('/salesman', formData);
        if (response.data.success) {
          fetchSalesmen();
          handleCloseModal();
        }
      }
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/salesman/${selectedSalesman._id}`);
      if (response.data.success) {
        fetchSalesmen();
        setSelectedSalesman(null);
      }
    } catch (error) {
      setShowDeleteModal(false);
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleEdit = (salesman) => {
    setSelectedSalesman(salesman);
    setFormData({ name: salesman.name, username: salesman.username, password: '', phone: salesman.phone });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSalesman(null);
    setFormData({ name: '', username: '', password: '', phone: '' });
    setShowPassword(false);
  };

  const getDetailFields = (salesman) => [
    { label: 'Name', value: salesman?.name, type: 'text', key: 'name' },
    { label: 'Username', value: salesman?.username, type: 'text', key: 'username' },
    { label: 'Password', value: salesman?.plainPassword || '', type: 'password', key: 'password' },
    { label: 'Phone', value: salesman?.phone, type: 'text', key: 'phone' },
    { label: 'Created At', value: salesman?.createdAt, type: 'datetime', key: 'createdAt' },
    { label: 'Updated At', value: salesman?.updatedAt, type: 'datetime', key: 'updatedAt' },
  ];

  return (
    <div className="space-y-6">
      {/* Title and Controls */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-4xl font-bold text-slate-800" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Salesmen</h1>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, username, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm font-medium whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Salesman
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {salesmen.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">No salesmen found</td>
                    </tr>
                  ) : (
                    salesmen.map((salesman) => (
                      <tr
                        key={salesman._id}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetail(salesman)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{salesman.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{salesman.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{salesman.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {new Date(salesman.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewDetail(salesman); }}
                            className="text-indigo-500 hover:text-indigo-700 mr-3 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(salesman); }}
                            className="text-slate-600 hover:text-slate-900 mr-3 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSalesman(salesman);
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

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setDetailSalesman(null); }}
        title="Salesman Details"
        fields={getDetailFields(detailSalesman)}
        onEdit={() => detailSalesman && handleEdit(detailSalesman)}
      />

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="srf-modal-backdrop">
          <div className="srf-modal-panel max-w-md">
            <div className="srf-modal-header">
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedSalesman ? 'Edit Salesman' : 'Add Salesman'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {selectedSalesman && <span className="text-slate-500 font-normal">(leave blank to keep current)</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!selectedSalesman}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
            </form>
            <div className="srf-modal-footer">
              <button type="button" onClick={handleCloseModal} className="srf-btn srf-btn-secondary">Cancel</button>
              <button type="submit" onClick={handleSubmit} className="srf-btn srf-btn-primary">
                {selectedSalesman ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedSalesman(null); }}
        onConfirm={handleDelete}
        title="Delete Salesman"
        message={`Are you sure you want to delete ${selectedSalesman?.name}? This action cannot be undone.`}
        type="danger"
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

export default Salesmen;
