import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import ConfirmModal from '../components/ConfirmModal';
import AlertModal from '../components/AlertModal';
import DetailModal from '../components/DetailModal';
import Pagination from '../components/Pagination';
import { Search, Plus, Edit2, Trash2, X, Eye, Tag } from 'lucide-react';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rakNo: '',
    price: '',
    quantity: '',
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [searchTerm, sizeFilter, currentPage]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sizeFilter]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const response = await api.post('/categories', { name: newCategoryName.trim() });
      if (response.data.success) {
        setNewCategoryName('');
        fetchCategories();
      }
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const response = await api.delete(`/categories/${categoryToDelete._id}`);
      if (response.data.success) {
        setCategoryToDelete(null);
        setShowDeleteCategoryModal(false);
        fetchCategories();
        if (sizeFilter === categoryToDelete.name) setSizeFilter('');
      }
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const searchQuery = [searchTerm, sizeFilter].filter(Boolean).join(' ').trim();
      const response = await api.get('/items', {
        params: { 
          search: searchQuery,
          page: currentPage,
          limit: itemsPerPage
        }
      });
      if (response.data.success) {
        setItems(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
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
      if (selectedItem) {
        const response = await api.put(`/items/${selectedItem._id}`, formData);
        if (response.data.success) {
          fetchItems();
          handleCloseModal();
        }
      } else {
        const response = await api.post('/items', formData);
        if (response.data.success) {
          fetchItems();
          handleCloseModal();
        }
      }
    } catch (error) {
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await api.delete(`/items/${selectedItem._id}`);
      if (response.data.success) {
        fetchItems();
        setSelectedItem(null);
      }
    } catch (error) {
      setShowDeleteModal(false);
      showAlert('Error', error.response?.data?.message || 'An error occurred', 'error');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      rakNo: item.rakNo,
      price: item.price,
      quantity: item.quantity,
      category: item.category || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setFormData({ name: '', rakNo: '', price: '', quantity: '', category: '' });
  };

  const handleViewDetail = (item) => {
    setDetailItem(item);
    setShowDetailModal(true);
  };

  const getDetailFields = (item) => [
    { label: 'Name', value: item?.name, type: 'text', key: 'name' },
    { label: 'Rak No', value: item?.rakNo, type: 'text', key: 'rakNo' },
    { label: 'Category', value: item?.category || '-', type: 'text', key: 'category' },
    { label: 'Price', value: item?.price, type: 'currency', key: 'price' },
    { label: 'Quantity', value: item?.quantity, type: 'text', key: 'quantity' },
    { label: 'Created At', value: item?.createdAt, type: 'datetime', key: 'createdAt' },
    { label: 'Updated At', value: item?.updatedAt, type: 'datetime', key: 'updatedAt' },
  ];

  return (
    <div className="space-y-6">
      {/* Title and Controls in one row */}
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-4xl font-bold text-slate-800" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>Items</h1>
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or rak number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/10 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setSizeFilter('')}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              sizeFilter === ''
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setSizeFilter(cat.name)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                sizeFilter === cat.name
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border border-dashed border-slate-400 text-slate-500 hover:bg-slate-50 transition-colors"
            title="Manage Categories"
          >
            <Tag className="w-4 h-4" />
            Manage
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm font-medium whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Item
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
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Rak No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => handleViewDetail(item)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.rakNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">₹{item.price.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleViewDetail(item); }}
                            className="text-indigo-500 hover:text-indigo-700 mr-3 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                            className="text-slate-600 hover:text-slate-900 mr-3 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
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
                {selectedItem ? 'Edit Item' : 'Add Item'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Rak No</label>
                <input
                  type="text"
                  required
                  value={formData.rakNo}
                  onChange={(e) => setFormData({ ...formData, rakNo: e.target.value })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full"
                >
                  <option value="">-- None --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
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
                {selectedItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setDetailItem(null); }}
        title="Item Details"
        fields={getDetailFields(detailItem)}
        onEdit={() => detailItem && handleEdit(detailItem)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete ${selectedItem?.name}? This action cannot be undone.`}
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

      {/* Manage Categories Modal */}
      {showCategoryModal && (
        <div className="srf-modal-backdrop">
          <div className="srf-modal-panel max-w-sm">
            <div className="srf-modal-header">
              <h3 className="text-lg font-semibold text-slate-900">Manage Categories</h3>
              <button onClick={() => { setShowCategoryModal(false); setNewCategoryName(''); }} className="srf-icon-btn text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              {/* Add new category */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name (e.g. 72mm)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  className="flex-1"
                />
                <button
                  onClick={handleAddCategory}
                  className="flex items-center gap-1 bg-slate-700 text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              {/* Existing categories */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-4">No categories yet</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat._id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                      <button
                        onClick={() => { setCategoryToDelete(cat); setShowDeleteCategoryModal(true); }}
                        className="text-rose-500 hover:text-rose-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation */}
      <ConfirmModal
        isOpen={showDeleteCategoryModal}
        onClose={() => { setShowDeleteCategoryModal(false); setCategoryToDelete(null); }}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete the category "${categoryToDelete?.name}"?`}
        type="danger"
      />
    </div>
  );
};

export default Items;

