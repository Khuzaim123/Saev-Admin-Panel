import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import ProductTable from '../../components/ProductTable/ProductTable';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import Spinner from '../../components/Spinner/Spinner';
import styles from './Products.module.css';

import searchIcon from '../../assets/Drop App - Light/search.png';
import filterIcon from '../../assets/Drop App - Light/filter.png';
import plusIcon from '../../assets/Drop App - Light/PlusSize.png';

export default function Products() {
  const navigate = useNavigate();
  const { products, loading, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    productId: null,
  });

  const filteredProducts = useMemo(() => {
    let filtered = products || [];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.productName?.toLowerCase().includes(term) ||
          product.storeName?.toLowerCase().includes(term) ||
          product.brand?.toLowerCase().includes(term) ||
          product.category?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter((product) => product.isActive);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter((product) => !product.isActive);
    }

    return filtered;
  }, [products, searchTerm, filterStatus]);

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDeleteClick = (id) => {
    setConfirmDialog({ isOpen: true, productId: id });
  };

  const handleDeleteConfirm = async () => {
    if (confirmDialog.productId) {
      try {
        await deleteProduct.mutateAsync(confirmDialog.productId);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className={styles.productsPage}>
      <div className={styles.topBar}>
        <h1 className={styles.pageTitle}>Products</h1>
        <div className={styles.searchContainer}>
          <img src={searchIcon} alt="Search" className={styles.searchIcon} />
          <input
            type="text"
            className={`input-field ${styles.searchInput}`}
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/products/add')}
        >
          <img src={plusIcon} alt="Add" />
          Add Product
        </button>
      </div>

      <div className={styles.filterBar}>
        <button
          className="btn-secondary"
          onClick={() => setShowFilters(!showFilters)}
        >
          <img src={filterIcon} alt="Filter" />
          Filters
        </button>

        {showFilters && (
          <div className={styles.filterOptions}>
            <label className={styles.filterLabel}>Status:</label>
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div className={styles.resultsInfo}>
        <p>Showing {filteredProducts.length} of {products.length} products</p>
      </div>

      <ProductTable
        products={filteredProducts}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, productId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
