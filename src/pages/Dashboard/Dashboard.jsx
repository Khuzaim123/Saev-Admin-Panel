import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import StatCard from '../../components/StatCard/StatCard';
import ProductTable from '../../components/ProductTable/ProductTable';
import Spinner from '../../components/Spinner/Spinner';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { products, recentProducts, loading, getProductStats } = useProducts();
  const stats = getProductStats();

  const handleEdit = (id) => {
    navigate(`/products/edit/${id}`);
  };

  const handleDelete = (id) => {
    // For dashboard, we'll just navigate to products page
    // The actual delete will be handled there
    navigate('/products');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <StatCard title="Total Products" value={stats.total} color="primary" />
        <StatCard title="Active" value={stats.active} color="success" />
        <StatCard title="Inactive" value={stats.inactive} color="error" />
        <StatCard title="Total Stores" value={stats.totalStores} color="warning" />
      </div>

      <div className={styles.recentProducts}>
        <h2 className={styles.sectionTitle}>Recent Products</h2>
        <ProductTable
          products={recentProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
