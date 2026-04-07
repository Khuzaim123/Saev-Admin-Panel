import { useNavigate } from 'react-router-dom';
import styles from './ProductTable.module.css';

import actionIcon from '../../assets/Drop App - Light/Quick Action.png';

export default function ProductTable({ products, onEdit, onDelete }) {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No products found</p>
        <button className="btn-primary" onClick={() => navigate('/products/add')}>
          Add Your First Product
        </button>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Store</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className={styles.productImage}>
                  {product.productImage ? (
                    <img src={product.productImage} alt={product.productName} />
                  ) : (
                    <div className={styles.placeholder}>No Image</div>
                  )}
                </div>
              </td>
              <td className={styles.productName}>{product.productName}</td>
              <td>{product.storeName}</td>
              <td>
                {product.currency} {product.price?.toFixed(2)}
              </td>
              <td>
                <span
                  className={`badge ${
                    product.isActive ? 'badge-active' : 'badge-inactive'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className={styles.actions}>
                  <button
                    className="btn-secondary"
                    onClick={() => onEdit && onEdit(product.id)}
                    title="Edit"
                  >
                    Edit
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => onDelete && onDelete(product.id)}
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
