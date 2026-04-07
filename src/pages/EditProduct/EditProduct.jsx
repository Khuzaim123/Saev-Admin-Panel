import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useProducts } from '../../hooks/useProducts';
import ProductForm from '../../components/ProductForm/ProductForm';
import Spinner from '../../components/Spinner/Spinner';
import styles from './EditProduct.module.css';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateProduct, uploadImage } = useProducts();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const docRef = doc(db, 'products', id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      throw new Error('Product not found');
    },
  });

  const handleSubmit = {
    update: async (productId, productData) => {
      return await updateProduct.mutateAsync({ id: productId, productData });
    },
    uploadImage: async (productId, file) => {
      return await uploadImage(productId, file);
    },
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.errorContainer}>
        <h2>Product Not Found</h2>
        <button className="btn-primary" onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className={styles.editProductPage}>
      <h1 className={styles.pageTitle}>Edit Product</h1>
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        loading={updateProduct.isPending}
        isEditing={true}
      />
    </div>
  );
}
