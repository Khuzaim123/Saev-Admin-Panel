import { useProducts } from '../../hooks/useProducts';
import ProductForm from '../../components/ProductForm/ProductForm';
import styles from './AddProduct.module.css';

export default function AddProduct() {
  const { addProduct, uploadImage } = useProducts();

  const handleSubmit = {
    add: async (productData) => {
      return await addProduct.mutateAsync(productData);
    },
    uploadImage: async (productId, file) => {
      return await uploadImage(productId, file);
    },
  };

  return (
    <div className={styles.addProductPage}>
      <h1 className={styles.pageTitle}>Add New Product</h1>
      <ProductForm
        onSubmit={handleSubmit}
        loading={addProduct.isPending}
        isEditing={false}
      />
    </div>
  );
}
