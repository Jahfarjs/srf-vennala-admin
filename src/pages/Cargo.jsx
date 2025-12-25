import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';

const Cargo = () => {
  const [cargo, setCargo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', type: 'error' });
  const [selectedCargo, setSelectedCargo] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchCargo();
  }, [searchTerm]);

  const fetchCargo = async () => {
    try {
      const response = await api.get('/cargo', {
        params: { search: searchTerm }
      });
      if (response.data.success) {
        setCargo(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cargo:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (title, message, type = 'error') => {
    setAlertConfig({ title, message, type });
    setShowAlertModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedCargo) {
        const response = await api.put(`/cargo/${selectedCargo._id}`, formData);
        if (response.data.success) {
          fetchCargo();
          handleCloseModal();
        }
      } else {
        const response = await api.post('/cargo', formData);
        if (response.data.success) {
          fetchCargo();
          handleCloseModal();
        }
      }
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/cargo/${selectedCargo._id}`);
      if (response.data.success) {
        fetchCargo();
        setSelectedCargo(null);
      }
    } catch (error) {
      setShowDeleteModal(false);
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleEdit = (cargoItem) => {
    setSelectedCargo(cargoItem);
    setFormData({ name: cargoItem.name });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCargo(null);
    setFormData({ name: '' });
  };

  return (
    <div className="space-y-6">
      {/* Title and Controls in one row */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-4xl font-bold text-slate-800" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Cargo</h1>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name..."
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
          Add Cargo
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {cargo.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-500">
                      No cargo companies found
                    </td>
                  </tr>
                ) : (
                  cargo.map((cargoItem) => (
                    <tr key={cargoItem._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {cargoItem.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(cargoItem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(cargoItem)}
                          className="text-slate-600 hover:text-slate-900 mr-4 transition-colors"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCargo(cargoItem);
                            setShowDeleteModal(true);
                          }}
                          className="text-rose-600 hover:text-rose-900 transition-colors"
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
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="srf-modal-backdrop">
          <div className="srf-modal-panel max-w-md">
            <div className="srf-modal-header">
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedCargo ? 'Edit Cargo' : 'Add Cargo'}
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
                {selectedCargo ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCargo(null);
        }}
        onConfirm={handleDelete}
        title="Delete Cargo"
        message={`Are you sure you want to delete ${selectedCargo?.name}? This action cannot be undone.`}
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

export default Cargo;

